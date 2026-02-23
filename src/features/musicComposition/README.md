# Music Composition Module

A comprehensive music notation editor module inspired by MuseScore. This module provides a foundation for creating, editing, and playing back musical scores with support for multiple instruments, staves, and various notation elements.

## Features

### 1. Score Creation & Editing
- **WYSIWYG Interface**: Visual score editor with real-time rendering
- **Multiple Staves**: Support for unlimited instruments and staves
- **Instrument Management**: Add, remove, and reorder instruments
- **Notation Support**: Notes, rests, accidentals (sharp, flat, natural)
- **Undo/Redo**: Full history tracking for all edits

### 2. Playback & Sound
- **Playback Controls**: Play, pause, stop, and seek functionality
- **Mixer**: Volume and pan controls for each instrument track
- **Tempo Control**: Adjustable tempo (BPM)
- **MIDI Support**: Foundation for MIDI note generation

### 3. File Management
- **Score Properties**: Title, composer, lyricist, copyright metadata
- **Page Settings**: Configurable page size and margins
- **MusicXML Export** (Basic): Foundation for MusicXML support
- **Score Templates**: Pre-configured orchestral templates

### 4. User Interface
- **Contextual Toolbar**: Mode-specific controls (select, note input, rest input)
- **Properties Panel**: Edit score metadata and settings
- **Mixer Panel**: Real-time instrument control
- **Note Input Bar**: Quick duration and accidental selection

## Architecture

### Directory Structure

```
src/features/musicComposition/
├── types/
│   └── musicTypes.ts          # TypeScript interfaces and types
├── utils/
│   ├── musicConstants.ts      # MIDI instruments and utilities
│   └── scoreUtils.ts          # Score manipulation functions
├── hooks/
│   ├── useScoreEditor.ts      # Score editor state management
│   └── usePlayback.ts         # Playback state management
├── components/
│   ├── EditorToolbar.tsx      # Main toolbar
│   ├── NoteInputBar.tsx       # Note input controls
│   ├── StaffView.tsx          # Staff rendering
│   ├── Mixer.tsx              # Mixer panel
│   └── ScoreProperties.tsx    # Properties editor
├── MusicComposition.tsx       # Main component
├── musicComposition.css       # Styles
└── index.ts                   # Export barrel
```

### Core Types

- **Score**: Top-level container for the entire musical composition
- **Staff**: Individual instrument staff within a score
- **Measure**: Time-bound container for musical events
- **Note**: Individual musical note with pitch, duration, and accidentals
- **Rest**: Silence placeholder with duration
- **Instrument**: MIDI-mapped instrument definition

### Custom Hooks

#### `useScoreEditor`
Manages score state, undo/redo history, and selection.

```tsx
const editor = useScoreEditor({ initialScore });
// Access: editor.score, editor.mode, editor.canUndo, editor.canRedo
// Actions: editor.updateScore(), editor.undo(), editor.redo(), editor.changeMode()
```

#### `usePlayback`
Manages playback state and controls.

```tsx
const playback = usePlayback({ tempo: 120 });
// Access: playback.isPlaying, playback.currentTime, playback.duration
// Actions: playback.play(), playback.pause(), playback.stop(), playback.seek()
```

### Utility Functions

**scoreUtils.ts**
- `createEmptyScore()` - Create a new score
- `addStaffToScore()` - Add instrument to score
- `createEmptyMeasure()` - Create measure with rests
- `addNoteToMeasure()` - Add note and remove conflicting rests
- `getMeasureDurationBeats()` - Calculate measure duration
- `isMeasureFull()` - Check if measure is complete
- `createOrchestraTemplate()` - Pre-configured orchestra setup

**musicConstants.ts**
- `STANDARD_INSTRUMENTS` - Array of common orchestral instruments
- `NOTE_DURATIONS_BEATS` - Duration-to-beats mapping
- `getMidiNoteName()` - Convert MIDI number to note name
- `midiToFrequency()` - Convert MIDI number to frequency

## Usage

### Basic Implementation

```tsx
import { MusicComposition } from '@/features/musicComposition'

function MyApp() {
  return <MusicComposition />
}
```

### With Initial Score

```tsx
import { useScoreEditor } from '@/features/musicComposition'
import { createOrchestraTemplate } from '@/features/musicComposition'

function Editor() {
  const orchestraScore = createOrchestraTemplate()
  const editor = useScoreEditor({ initialScore: orchestraScore })
  // ... rest of implementation
}
```

## Future Enhancements

### Immediate Priority
- [ ] MIDI keyboard input support
- [ ] Advanced note entry modes (TrebleClef, BassClef visual entry)
- [ ] Tuplets and complex rhythms
- [ ] Slurs and ties visual rendering
- [ ] Key signature and time signature changes mid-score

### Medium Priority
- [ ] Full MusicXML import/export
- [ ] MIDI import
- [ ] PDF export
- [ ] Articulation marks (staccato, accent, etc.)
- [ ] Dynamics and expression marks
- [ ] Lyrics support

### Advanced Features
- [ ] VST3 plugin support
- [ ] Real-time audio engine with SoundFont support
- [ ] Parts extraction with synchronization
- [ ] Advanced engraving controls
- [ ] Braille music export
- [ ] Screen reader accessibility enhancements
- [ ] Collaborative editing
- [ ] Version history and cloud sync

## Music Theory Fundamentals

### MIDI Note Numbers
- Middle C (C4) = 60
- Concert A (A4) = 69
- Range: 0 (C-1) to 127 (G9)

### Note Durations (in beats at 4/4 time)
- Whole: 4 beats
- Half: 2 beats
- Quarter: 1 beat
- Eighth: 0.5 beats
- Sixteenth: 0.25 beats
- Thirty-second: 0.125 beats

### Standard Orchestral Order
1. Flute, Oboe, Clarinet, Bassoon (Woodwinds)
2. Horn, Trumpet, Trombone, Tuba (Brass)
3. Timpani (Percussion)
4. Violin I, Violin II, Viola (Upper Strings)
5. Cello, Double Bass (Lower Strings)
6. Piano (if included)

## Development Tips

### Adding New Instruments
Edit `STANDARD_INSTRUMENTS` in `musicConstants.ts`:

```tsx
export const STANDARD_INSTRUMENTS = [
  { id: 'new-instrument', name: 'New Instrument', midiProgram: 20, clef: 'treble' },
  // ...
]
```

### Extending Score Format
Modify `Score` type in `musicTypes.ts` and update default scores in `scoreUtils.ts`.

### Performance Optimization
- Memo components rendering many staves for large scores
- Lazy load extended measure views
- Use virtual scrolling for very long scores

## Styling

The module includes comprehensive CSS in `musicComposition.css`:
- Responsive layout for desktop/tablet/mobile
- Theme variables for customization
- Accessibility considerations (sufficient color contrast, focus indicators)

Customize by overriding CSS variables or modifying the stylesheet directly.

## Known Limitations

1. **Simplified Music Theory**: Current implementation uses simplified music theory rules
2. **No Audio Synthesis**: Playback is UI-only; requires external audio engine
3. **Limited Format Support**: Basic MusicXML structure only
4. **Single Voice per Staff**: No multiple independent voices in one staff
5. **Visual Only**: No MIDI device input, only keyboard/mouse
6. **No Engraving Algorithm**: Manual staff positioning required

## Contributing

When extending this module:
1. Maintain the separation of concerns (types, utils, hooks, components)
2. Add comprehensive TypeScript types
3. Create reusable utility functions
4. Use custom hooks for complex state management
5. Document new features in this README
6. Add storybook stories for new components

## License

This module is part of the main application.
