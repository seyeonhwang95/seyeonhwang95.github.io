/**
 * Standard MIDI instruments for common orchestral setup
 */

export const STANDARD_INSTRUMENTS = [
  // Woodwinds
  { id: 'flute', name: 'Flute', midiProgram: 73, clef: 'treble' as const },
  { id: 'oboe', name: 'Oboe', midiProgram: 68, clef: 'treble' as const },
  { id: 'clarinet', name: 'Clarinet', midiProgram: 71, clef: 'treble' as const },
  { id: 'bassoon', name: 'Bassoon', midiProgram: 70, clef: 'bass' as const },
  
  // Brass
  { id: 'horn', name: 'Horn', midiProgram: 60, clef: 'treble' as const },
  { id: 'trumpet', name: 'Trumpet', midiProgram: 56, clef: 'treble' as const },
  { id: 'trombone', name: 'Trombone', midiProgram: 57, clef: 'bass' as const },
  { id: 'tuba', name: 'Tuba', midiProgram: 58, clef: 'bass' as const },
  
  // Percussion
  { id: 'timpani', name: 'Timpani', midiProgram: 47, clef: 'bass' as const },
  { id: 'violin', name: 'Violin', midiProgram: 40, clef: 'treble' as const },
  { id: 'viola', name: 'Viola', midiProgram: 41, clef: 'alto' as const },
  { id: 'cello', name: 'Cello', midiProgram: 42, clef: 'bass' as const },
  { id: 'bass', name: 'Double Bass', midiProgram: 43, clef: 'bass' as const },
  
  // Keyboard
  { id: 'piano', name: 'Piano', midiProgram: 0, clef: 'treble' as const },
]

export const NOTE_DURATIONS_BEATS = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  thirtysecond: 0.125,
}

export const MIDI_NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

/**
 * Get octave and note name from MIDI note number
 */
export const getMidiNoteName = (midiNumber: number): string => {
  const octave = Math.floor(midiNumber / 12) - 1
  const noteName = MIDI_NOTE_NAMES[midiNumber % 12]
  return `${noteName}${octave}`
}

/**
 * Convert MIDI note number to frequency in Hertz
 */
export const midiToFrequency = (midiNumber: number): number => {
  return 440 * Math.pow(2, (midiNumber - 69) / 12)
}

/**
 * Get major/minor scale degrees
 */
export const getScaleDegrees = (keySignature: number, _isMinor: boolean): number[] => {
  // This is a simplified version - in practice you'd have more sophisticated music theory
  const majorScales: Record<number, number[]> = {
    0: [0, 2, 4, 5, 7, 9, 11], // C Major
    1: [0, 2, 4, 5, 7, 9, 11], // G Major (simplified)
    '-1': [0, 2, 3, 5, 7, 8, 11], // F Major (simplified)
  }
  return majorScales[keySignature as keyof typeof majorScales] || majorScales[0]
}

/**
 * Calculate staffline position for a MIDI note
 * For treble clef (middle line is B3 = 59)
 */
export const getNoteLinePosition = (midiNumber: number, clef: string = 'treble'): number => {
  // Simplified: returns approximate position from bottom of staff
  // In a real implementation, would be more complex with ledger lines
  const baseNotes: Record<string, number> = {
    treble: 59, // B3 on middle line
    bass: 45, // D2 on middle line
    alto: 48, // C3 on middle line
  }
  const base = baseNotes[clef] || baseNotes.treble
  return (midiNumber - base) * 0.5
}
