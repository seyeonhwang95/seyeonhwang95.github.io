import { PitchDetector } from 'pitchy'

export interface DetectedPitch {
  frequency: number | null
  certainty: number
  midi: number | null
  noteName: string | null
}

/**
 * Convert frequency (Hz) to MIDI note number
 * A4 = 440Hz = MIDI 69
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69)
}

/**
 * Convert MIDI note number to note name
 */
export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const noteIndex = midi % 12
  return `${notes[noteIndex]}${octave}`
}

/**
 * Wrapper for Pitchy pitch detection with flexible type handling
 */
function detectPitchInternal(
  buffer: any,
  sampleRate: number
): [number, number] {
  const detector = PitchDetector.forFloat32Array(buffer.length)
  return detector.findPitch(buffer, sampleRate)
}

/**
 * Detect pitch from audio buffer using Pitchy
 */
export function detectPitch(
  buffer: any,
  sampleRate: number,
  minConfidence: number = 0.8
): DetectedPitch {
  try {
    const pitch = detectPitchInternal(buffer, sampleRate)

    if (pitch[0] === -1 || pitch[1] < minConfidence) {
      return {
        frequency: null,
        certainty: pitch[1],
        midi: null,
        noteName: null,
      }
    }

    const midi = frequencyToMidi(pitch[0])
    const noteName = midiToNoteName(midi)

    return {
      frequency: pitch[0],
      certainty: pitch[1],
      midi,
      noteName,
    }
  } catch (error) {
    console.error('Pitch detection error:', error)
    return {
      frequency: null,
      certainty: 0,
      midi: null,
      noteName: null,
    }
  }
}

/**
 * Filter and smooth pitch data to reduce jitter
 */
export function smoothPitchData(
  detections: DetectedPitch[],
  minConsecutiveFrames: number = 3
): DetectedPitch[] {
  const smoothed: DetectedPitch[] = []

  for (let i = 0; i < detections.length; i++) {
    const current = detections[i]

    if (current.frequency === null) {
      continue
    }

    // Check if we have enough consecutive detections with same MIDI note
    let sameNoteCount = 1
    for (let j = i + 1; j < detections.length; j++) {
      if (detections[j].midi === current.midi && detections[j].frequency !== null) {
        sameNoteCount++
      } else {
        break
      }
    }

    if (sameNoteCount >= minConsecutiveFrames) {
      // Use average frequency for smoothing
      let frequencySum = current.frequency
      for (let j = 1; j < sameNoteCount; j++) {
        frequencySum += detections[i + j].frequency!
      }
      const averageFrequency = frequencySum / sameNoteCount

      smoothed.push({
        frequency: averageFrequency,
        certainty: current.certainty,
        midi: current.midi,
        noteName: current.noteName,
      })

      // Skip the frames we just processed
      i += sameNoteCount - 1
    }
  }

  return smoothed
}

/**
 * Constrain detected MIDI to a specific range
 */
export function constrainMidiRange(midi: number, minMidi: number, maxMidi: number): number {
  return Math.max(minMidi, Math.min(maxMidi, midi))
}

/**
 * Get violin range (typically G3 to E7 or MIDI 43-76)
 */
export function getViolinRange(): { min: number; max: number } {
  return { min: 55, max: 84 } // G3 (55) to C6 (84) - comfortable violin range
}

/**
 * Quantize frequency to nearest semitone
 */
export function quantizeToSemitone(frequency: number): number {
  const midi = frequencyToMidi(frequency)
  const midiFrequency = 440 * Math.pow(2, (midi - 69) / 12)
  return midiFrequency
}
