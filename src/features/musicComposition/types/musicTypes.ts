/**
 * Core types for music composition/notation
 */

export type Note = {
  id: string
  pitch: number // 0-127 MIDI note number
  duration: NoteDuration
  startTime: number // in beats
  accidental?: 'sharp' | 'flat' | 'natural'
  tied?: boolean
}

export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirtysecond'

export type Rest = {
  id: string
  duration: NoteDuration
  startTime: number
}

export type Measure = {
  id: string
  number: number
  timeSignature: TimeSignature
  keySignature: KeySignature
  content: (Note | Rest)[] // Can add more later: Chord, Tuplet, etc.
}

export type Staff = {
  id: string
  instrument: Instrument
  clef: 'treble' | 'bass' | 'alto' | 'tenor'
  measures: Measure[]
}

export type Instrument = {
  id: string
  name: string
  midiProgram: number // 0-127
  volume: number // 0-100
  pan: number // -100 to 100
  muted: boolean
}

export type TimeSignature = {
  numerator: number // 4 in 4/4
  denominator: number // 4 in 4/4
}

export type KeySignature = {
  sharpsFlats: number // -7 (7 flats) to 7 (7 sharps)
  isMinor: boolean
}

export type Score = {
  id: string
  title: string
  subtitle?: string
  composer?: string
  lyricist?: string
  copyright?: string
  staves: Staff[]
  tempo: number // BPM
  timeSignature: TimeSignature
  keySignature: KeySignature
  metadata: ScoreMetadata
}

export type ScoreMetadata = {
  createdAt: Date
  modifiedAt: Date
  pageSize: 'A4' | 'Letter'
  pageMargins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  barsPerSystem?: number // optional constraint
}

export type CompositionMode = 'select' | 'note' | 'rest' | 'edit'

export type SelectionInfo = {
  type: 'note' | 'rest' | 'measure' | 'staff' | 'none'
  elementId?: string
  staffId?: string
  measureId?: string
}
