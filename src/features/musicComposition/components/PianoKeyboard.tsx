/**
 * Piano keyboard component for visual note selection
 * 88-key piano (A0 to C8) - standard piano range
 * Shows C through B with sharps/flats for easy MIDI note picking
 * Plays sound when keys are clicked
 */

import { getMidiNoteName } from '../utils/musicConstants'
import { playNoteTone } from '../utils/toneSynthesis'

interface PianoKeyboardProps {
  selectedMidiNote?: number
  onSelectNote: (midiNumber: number) => void
}

export function PianoKeyboard({
  selectedMidiNote,
  onSelectNote,
}: PianoKeyboardProps) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const blackKeyIndices = [1, 3, 6, 8, 10] // C#, D#, F#, G#, A#

  // 88-key piano: A0 (MIDI 21) to C8 (MIDI 108)
  const startMidi = 21 // A0
  const endMidi = 108 // C8

  const handleKeyClick = (midiNumber: number) => {
    // Play the note sound
    playNoteTone(midiNumber, { duration: 300, volume: 0.4, instrument: 'piano' })
    // Update selected note
    onSelectNote(midiNumber)
  }

  // Generate all keys from A0 to C8
  const allKeys = []
  for (let midi = startMidi; midi <= endMidi; midi++) {
    const noteIndex = midi % 12
    const octave = Math.floor(midi / 12) - 1
    allKeys.push({
      midi,
      noteName: notes[noteIndex],
      octave,
      isBlack: blackKeyIndices.includes(noteIndex),
    })
  }

  // Group by white keys for layout
  const whiteKeys = allKeys.filter((k) => !k.isBlack)
  const blackKeys = allKeys.filter((k) => k.isBlack)

  return (
    <div className="piano-keyboard">
      <div className="keyboard-wrapper">
        {/* White keys container */}
        <div className="white-keys-container">
          {whiteKeys.map((key) => (
            <button
              key={`${key.noteName}-${key.octave}`}
              className={`piano-key white-key ${
                selectedMidiNote === key.midi ? 'selected' : ''
              }`}
              onClick={() => handleKeyClick(key.midi)}
              title={getMidiNoteName(key.midi)}
              data-midi={key.midi}
            >
              {/* Label only for natural notes starting at C */}
              {key.noteName === 'C' && (
                <span className="key-label">
                  {key.noteName}
                  <span className="octave-number">{key.octave}</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Black keys overlay */}
        <div className="black-keys-container">
          {blackKeys.map((key) => (
            <button
              key={`${key.noteName}-${key.octave}`}
              className={`piano-key black-key ${
                selectedMidiNote === key.midi ? 'selected' : ''
              }`}
              onClick={() => handleKeyClick(key.midi)}
              title={getMidiNoteName(key.midi)}
              data-midi={key.midi}
              style={{
                // Position black keys between white keys
                '--white-key-width': '2.3rem',
                '--offset-ratio':
                  key.noteName === 'C#'
                    ? 0.65
                    : key.noteName === 'D#'
                      ? 1.63
                      : key.noteName === 'F#'
                        ? 3.61
                        : key.noteName === 'G#'
                          ? 4.59
                          : 5.57,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
