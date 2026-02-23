/**
 * Enhanced note input system with interactive note selection
 */

import type { Note, Measure } from '../types/musicTypes'
import { NOTE_DURATIONS_BEATS } from '../utils/musicConstants'

/**
 * Generate a simple UUID
 */
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Represents a note input session with selected parameters
 */
export interface NoteInputState {
  duration: string // 'quarter', 'half', etc.
  accidental: 'sharp' | 'flat' | 'natural' | null
  selectedMidiNote: number | null
}

/**
 * Convert MIDI note and accidental to actual pitch
 * Sharp increases by 1, Flat decreases by 1
 */
export const getAdjustedMidiNote = (
  midiNote: number,
  accidental: 'sharp' | 'flat' | 'natural' | null,
): number => {
  if (accidental === 'sharp') return midiNote + 1
  if (accidental === 'flat') return midiNote - 1
  return midiNote
}

/**
 * Create a note and add it to a measure
 */
export const createNoteInMeasure = (
  measure: Measure,
  midiPitch: number,
  duration: string,
  accidental: 'sharp' | 'flat' | 'natural' | null,
  startBeat: number = 0,
): { measure: Measure; note: Note } => {
  // Adjust pitch based on accidental
  const adjustedPitch = getAdjustedMidiNote(midiPitch, accidental)

  // Ensure pitch stays in valid MIDI range
  const clampedPitch = Math.max(0, Math.min(127, adjustedPitch))

  const durationBeats = NOTE_DURATIONS_BEATS[duration as keyof typeof NOTE_DURATIONS_BEATS] || 1
  const noteEndTime = startBeat + durationBeats

  const note: Note = {
    id: `note_${generateId()}`,
    pitch: clampedPitch,
    duration: duration as any,
    startTime: startBeat,
    accidental: accidental === 'natural' || accidental === null ? undefined : accidental,
  }

  // Filter out items that would overlap with the new note
  // Rests can be replaced, but existing notes cannot be on top of each other
  const newContent = measure.content.filter((item) => {
    const isNote = 'pitch' in item
    const itemEndTime = item.startTime + (NOTE_DURATIONS_BEATS[item.duration as keyof typeof NOTE_DURATIONS_BEATS] || 1)
    
    // Check for overlap
    const hasOverlap = itemEndTime > startBeat && noteEndTime > item.startTime
    
    // Remove overlapping rests, but keep overlapping notes (which shouldn't happen)
    if (hasOverlap && !isNote) {
      return false // Remove rest
    }
    
    return true
  })

  // Add the new note and ensure sorted by start time
  newContent.push(note)
  newContent.sort((a, b) => a.startTime - b.startTime)

  return {
    measure: { ...measure, content: newContent },
    note,
  }
}

/**
 * Calculate available start beats in a measure
 * Returns array of valid beat positions where a note could be placed
 * Rests are treated as replaceable, only notes block placement
 */
export const getAvailableBeatPositions = (
  measure: Measure,
  duration: string,
): number[] => {
  const durationBeats = NOTE_DURATIONS_BEATS[duration as keyof typeof NOTE_DURATIONS_BEATS] || 1
  const maxBeats = measure.timeSignature.numerator
  const positions: number[] = []

  // Try each possible beat position
  for (let beat = 0; beat < maxBeats; beat += durationBeats) {
    // Ensure we don't place a note that would exceed the measure
    if (beat + durationBeats > maxBeats) {
      break
    }

    const noteEndTime = beat + durationBeats

    // Check if this position overlaps with any EXISTING NOTES (not rests - rests are replaceable)
    const hasNoteConflict = measure.content.some((item) => {
      // Only check notes, not rests
      const isNote = 'pitch' in item
      if (!isNote) return false

      const itemEndTime = item.startTime + (NOTE_DURATIONS_BEATS[item.duration as keyof typeof NOTE_DURATIONS_BEATS] || 1)
      
      // Check for overlap: x1 < x2 && y1 < y2
      return item.startTime < noteEndTime && itemEndTime > beat
    })

    if (!hasNoteConflict) {
      positions.push(beat)
    }
  }

  return positions
}

/**
 * Get the next available beat position in a measure
 * Useful for sequential note input
 */
export const getNextAvailableBeat = (measure: Measure, duration: string = 'quarter'): number => {
  const available = getAvailableBeatPositions(measure, duration)
  return available.length > 0 ? available[0] : 0
}
