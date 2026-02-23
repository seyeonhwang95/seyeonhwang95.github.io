/**
 * Music Composition Module
 * 
 * A comprehensive music notation editor inspired by MuseScore
 * 
 * Features:
 * - Score creation and editing with WYSIWYG interface
 * - Support for multiple staves and instruments
 * - Musical notation support (notes, rests, accidentals)
 * - Playback controls and mixer
 * - Score properties and metadata management
 * - Undo/Redo functionality
 * - Extensible architecture for future features
 */

export { MusicComposition } from './MusicComposition'
export { useScoreEditor } from './hooks/useScoreEditor'
export { usePlayback } from './hooks/usePlayback'
export {
  createEmptyScore,
  addStaffToScore,
  createEmptyMeasure,
  addNoteToMeasure,
  removeElementFromMeasure,
  updateNote,
  getMeasureDurationBeats,
  isMeasureFull,
  getMidiNotesFromStaff,
  scoreToMusicXML,
  createOrchestraTemplate,
} from './utils/scoreUtils'
export {
  createNoteInMeasure,
  getAdjustedMidiNote,
  getAvailableBeatPositions,
  getNextAvailableBeat,
} from './utils/noteInputUtils'
export { STANDARD_INSTRUMENTS, NOTE_DURATIONS_BEATS, getMidiNoteName, midiToFrequency } from './utils/musicConstants'
export type {
  Note,
  NoteDuration,
  Rest,
  Measure,
  Staff,
  Instrument,
  TimeSignature,
  KeySignature,
  Score,
  ScoreMetadata,
  CompositionMode,
  SelectionInfo,
} from './types/musicTypes'
