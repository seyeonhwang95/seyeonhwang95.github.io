/**
 * Utility functions for music composition operations
 */

import type {
  Score,
  Staff,
  Measure,
  Note,
  Rest,
  Instrument,
  TimeSignature,
  KeySignature,
} from '../types/musicTypes'
import { NOTE_DURATIONS_BEATS } from './musicConstants'

/**
 * Create a new empty score with default settings
 */
export const createEmptyScore = (title: string = 'Untitled'): Score => {
  const now = new Date()
  return {
    id: `score_${Date.now()}`,
    title,
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    keySignature: { sharpsFlats: 0, isMinor: false },
    staves: [],
    metadata: {
      createdAt: now,
      modifiedAt: now,
      pageSize: 'A4',
      pageMargins: { top: 40, bottom: 40, left: 40, right: 40 },
      barsPerSystem: 4,
    },
  }
}

/**
 * Add a staff with an instrument to a score
 */
export const addStaffToScore = (
  score: Score,
  instrument: Instrument,
  clef: 'treble' | 'bass' | 'alto' | 'tenor',
  measureCount: number = 16,
): Score => {
  const measures = Array.from({ length: measureCount }, (_, i) =>
    createEmptyMeasure(i + 1, score.timeSignature, score.keySignature),
  )

  const newStaff: Staff = {
    id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    instrument,
    clef,
    measures,
  }

  return {
    ...score,
    staves: [...score.staves, newStaff],
    metadata: {
      ...score.metadata,
      modifiedAt: new Date(),
    },
  }
}

/**
 * Create an empty measure with unique IDs
 */
export const createEmptyMeasure = (
  number: number,
  timeSignature: TimeSignature,
  keySignature: KeySignature,
): Measure => {
  const beatCount = timeSignature.numerator
  const rests: Rest[] = []
  const uniqueSuffix = `_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Fill measure with rests initially
  let currentBeat = 0
  while (currentBeat < beatCount) {
    rests.push({
      id: `rest${uniqueSuffix}_${currentBeat}`,
      duration: 'quarter',
      startTime: currentBeat,
    })
    currentBeat += NOTE_DURATIONS_BEATS.quarter
  }

  return {
    id: `measure${uniqueSuffix}`,
    number,
    timeSignature,
    keySignature,
    content: rests,
  }
}

/**
 * Add a note to a measure
 */
export const addNoteToMeasure = (
  measure: Measure,
  note: Note,
): Measure => {
  // Remove any rests that overlap with the new note
  const newContent = measure.content.filter((item) => {
    if ('duration' in item && !('pitch' in item)) {
      // It's a rest
      const itemEndTime = item.startTime + NOTE_DURATIONS_BEATS[item.duration]
      const noteEndTime = note.startTime + NOTE_DURATIONS_BEATS[note.duration]
      return !(itemEndTime > note.startTime && noteEndTime > item.startTime)
    }
    return true
  })

  // Sort by start time
  newContent.push(note)
  newContent.sort((a, b) => a.startTime - b.startTime)

  return {
    ...measure,
    content: newContent,
  }
}

/**
 * Remove an element from a measure
 */
export const removeElementFromMeasure = (
  measure: Measure,
  elementId: string,
): Measure => {
  return {
    ...measure,
    content: measure.content.filter((item) => item.id !== elementId),
  }
}

/**
 * Update a note's properties
 */
export const updateNote = (note: Note, updates: Partial<Note>): Note => {
  return { ...note, ...updates }
}

/**
 * Calculate total duration of measure content in beats
 */
export const getMeasureDurationBeats = (measure: Measure): number => {
  return measure.content.reduce((total, item) => {
    return total + NOTE_DURATIONS_BEATS[item.duration]
  }, 0)
}

/**
 * Check if measure is full (all beats accounted for)
 */
export const isMeasureFull = (measure: Measure): boolean => {
  const expectedBeats = measure.timeSignature.numerator
  const actualBeats = getMeasureDurationBeats(measure)
  return Math.abs(actualBeats - expectedBeats) < 0.001 // Account for floating point
}

/**
 * Get MIDI notes for playback from a staff
 */
export const getMidiNotesFromStaff = (
  staff: Staff,
  tempoMultiplier: number = 1,
): Array<{ pitch: number; startTime: number; duration: number }> => {
  const notes: Array<{ pitch: number; startTime: number; duration: number }> = []

  staff.measures.forEach((measure) => {
    measure.content.forEach((item) => {
      if ('pitch' in item) {
        // It's a note
        const note = item as Note
        notes.push({
          pitch: note.pitch,
          startTime: note.startTime * tempoMultiplier,
          duration: NOTE_DURATIONS_BEATS[note.duration] * tempoMultiplier,
        })
      }
    })
  })

  return notes
}

/**
 * Export score to MusicXML (simplified structure)
 */
export const scoreToMusicXML = (score: Score): string => {
  // This is a simplified version - real MusicXML is more complex
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <identification>
    <encoding>
      <software>Music Composition App</software>
    </encoding>
  </identification>
  <part-list>
    ${score.staves
      .map(
        (staff, i) => `<score-part id="P${i + 1}">
      <part-name>${staff.instrument.name}</part-name>
    </score-part>`,
      )
      .join('\n')}
  </part-list>
  ${score.staves
    .map(
      (_staff, i) => `<part id="P${i + 1}">  
    <!-- Measures would go here -->
  </part>`,
    )
    .join('\n')}
</score-partwise>`
  return xml
}

/**
 * Generate a default score template with common orchestration
 */
export const createOrchestraTemplate = (): Score => {
  let score = createEmptyScore('Orchestra')

  // Add instruments in standard orchestral order
  const instrumentSetup = [
    { id: 'flute', name: 'Flute', clef: 'treble' as const },
    { id: 'oboe', name: 'Oboe', clef: 'treble' as const },
    { id: 'clarinet', name: 'Clarinet', clef: 'treble' as const },
    { id: 'bassoon', name: 'Bassoon', clef: 'bass' as const },
    { id: 'violin', name: 'Violin I', clef: 'treble' as const },
    { id: 'viola', name: 'Viola', clef: 'alto' as const },
    { id: 'cello', name: 'Cello', clef: 'bass' as const },
  ]

  instrumentSetup.forEach((setup) => {
    const instrument: Instrument = {
      id: setup.id,
      name: setup.name,
      midiProgram: 0,
      volume: 100,
      pan: 0,
      muted: false,
    }
    score = addStaffToScore(score, instrument, setup.clef)
  })

  return score
}

/**
 * Clear all notes and rests from all measures in a score, keeping the staff structure intact
 */
export const clearAllNotes = (score: Score): Score => {
  return {
    ...score,
    staves: score.staves.map((staff) => ({
      ...staff,
      measures: staff.measures.map((measure) => ({
        ...measure,
        content: [],
      })),
    })),
  }
}
