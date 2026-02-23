// Audio synthesis
export { playNote, playChord, stopAllAudio, getAudioContext } from './audioSynthesis'

// Tone.js synthesis
export { playNoteTone, initializeToneSynthesis, disposeToneSynthesis } from './toneSynthesis'

// SoundFont loader
export { loadSoundFont, playNoteSoundFont, playSoundFontNote } from './soundFontLoader'

// Score utilities
export {
  createEmptyScore,
  addStaffToScore,
  createEmptyMeasure,
  addNoteToMeasure,
  scoreToMusicXML,
  createOrchestraTemplate,
  clearAllNotes,
} from './scoreUtils'

// Music constants and utilities
export {
  STANDARD_INSTRUMENTS,
  NOTE_DURATIONS_BEATS,
  MIDI_NOTE_NAMES,
  getMidiNoteName,
  midiToFrequency,
  getScaleDegrees,
  getNoteLinePosition,
} from './musicConstants'

// Note input utilities
export {
  createNoteInMeasure,
  getAdjustedMidiNote,
  getAvailableBeatPositions,
  getNextAvailableBeat,
} from './noteInputUtils'
