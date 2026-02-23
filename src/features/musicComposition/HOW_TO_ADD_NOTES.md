# How to Add Notes to the Music Composition Sheet

A complete guide to using the note input system in the Music Composition module.

## Quick Start: Add Your First Note

### Step 1: Enter Note Input Mode
1. Click the **"Mode"** selector in the toolbar
2. Select **"Note"** (green highlighted button)
3. The **Note Input Bar** will appear below the toolbar

### Step 2: Select Note Parameters

**Duration (How long the note lasts)**
- **W** = Whole note (4 beats)
- **H** = Half note (2 beats)
- **Q** = Quarter note (1 beat) - recommended for beginners
- **E** = Eighth note (0.5 beats)
- **S** = Sixteenth note (0.25 beats)

**Accidental (Modifies the note pitch)**
- **♯** (Sharp) = Raises pitch by 1 semitone
- **♮** (Natural) = Keep basic note
- **♭** (Flat) = Lowers pitch by 1 semitone

### Step 3: Select a Pitch

**Option A: Use the Piano Keyboard**
1. Click **"Piano"** button in header (top right)
2. Visual piano keyboard appears below toolbars
3. Click on a white or black key to select the note pitch
4. Selected keys highlight in green
5. MIDI note number displays in footer

**Option B: Auto-select (Default: Middle C)**
- If you don't open the piano, it defaults to **MIDI #60** (Middle C)

### Step 4: Click on a Staff to Place the Note

1. **Hover** over any staff (the staff area will highlight)
2. Blue **dot indicators** appear on the staff showing valid positions where you can place notes
3. The dot positions represent available beat positions based on your selected duration
4. **Click on a beat dot** to place the note
5. The note appears on the staff immediately!

## Understanding MIDI Notes

MIDI (Musical Instrument Digital Interface) uses numbers 0-127 to represent pitches:

- **Middle C (C4)** = MIDI 60 (the most common starting pitch)
- **A4** = MIDI 69 (concert tuning reference)
- **C5** = MIDI 72 (one octave above Middle C)
- **C3** = MIDI 48 (one octave below Middle C)

### Piano Keyboard Reference

The visual piano keyboard shows:
- **White keys** = Natural notes (C, D, E, F, G, A, B)
- **Black keys** = Sharp/Flat notes (C♯/D♭, D♯/E♭, etc.)
- Octave numbers (2-6 by default)
- Hover over any key to see the MIDI note name

### Common Pitches
| Note | MIDI | Common Use |
|------|------|-----------|
| C2 | 36 | Deep bass notes |
| C3 | 48 | Low register |
| C4 | 60 | Middle C (default) |
| C5 | 72 | High register |
| C6 | 84 | Very high notes |

## Workflow Examples

### Example 1: Simple Melody (Quarter Notes)
1. Set **Duration** to **Q** (Quarter)
2. Leave accidental unselected
3. Click Piano button to open keyboard
4. Click **E4** (MIDI 64 - E above Middle C)
5. Hover over Violin staff, click first blue dot - **E4 note placed!**
6. Click **D4** on piano
7. Click second blue dot on staff - **D4 note placed!**
8. Continue building your melody...

### Example 2: Adding Accidentals (Sharps/Flats)
1. Set **Duration** to **Q**
2. Click **♯** (Sharp button)
3. Open Piano, click **D4**
4. Click beat dot on staff - **D♯4 placed!**
5. To remove accidental, click **♯** again to deselect

### Example 3: Longer Note Values (Half Notes)
1. Set **Duration** to **H** (Half = 2 beats)
2. Select pitch from piano
3. Note the blue dots are now further apart (fewer positions available)
4. Click a dot - **Half note placed!**
5. Next available dot is at beat 2

## Visual Feedback System

### When Hovering Over a Staff (Note Mode)
- Staff area slightly highlights
- Blue vertical guidelines appear
- Blue dot circles show valid placement positions
- Dots are positioned based on your selected duration

### Color Meanings
- **Blue dots** = Available positions for note placement
- **Green highlight** = Selected key on piano
- **Blue highlight** = Selected note on staff

## Available Beat Positions

In 4/4 time with different durations:

**Quarter Note (Q = 1 beat)**
- Positions at: 0, 1, 2, 3 (4 possible positions)

**Half Note (H = 2 beats)**
- Positions at: 0, 2 (2 possible positions)

**Eighth Note (E = 0.5 beats)**
- Positions at: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5 (8 possible positions)

**Whole Note (W = 4 beats)**
- Position at: 0 only (1 possible position)

## Managing Notes

### Selecting a Note
1. Switch to **"Select"** mode on toolbar
2. Click on any note on the staff
3. Note highlights with blue dashed box
4. Note details appear in status bar

### Editing a Note
1. Select the note (see above)
2. Change mode to **"Edit"**
3. Modify its properties through the UI

### Deleting a Note
1. Enter **Edit** mode
2. Select the note
3. Press **Delete** or click remove button

### Moving Between Staves
Each staff (Violin, Piano, Cello, etc.) accepts notes independently:
- Hover over different staves to see available positions
- Each staff has standard orchestral clefs (Treble/Bass/Alto)
- Notes are automatically displayed on the staff where you place them

## Keyboard Shortcuts (Future)
| Shortcut | Action |
|----------|--------|
| Q | Quarter note duration |
| H | Half note duration |
| W | Whole note duration |
| E | Eighth note duration |
| ♯ | Toggle sharp |
| ♭ | Toggle flat |
| Del | Delete selected note |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |

## Tips & Tricks

### 🎹 Pro Tips
1. **Piano opens in Note mode** - Click "Piano" button to toggle visual piano keyboard on/off
2. **Default pitch memorization** - Keep using Middle C until comfortable, then explore higher/lower pitches
3. **Beat visualization** - Blue dots show exactly where notes fit in the measure
4. **Multiple staves** - Switch between staves by hovering and clicking on different staff lines
5. **Undo/Redo** - Always available in toolbar: ↶ Undo, ↷ Redo

### Common Mistakes
❌ Trying to extend note beyond measure = Use shorter duration
❌ Clicking on wrong area = Make sure hovering first to see blue dots
❌ No piano showing = Check if mode is "Note", then click Piano button
❌ Accidental not applying = Make sure button is highlighted (active) before placing note

## Accidental Behavior

### Sharp (♯)
- Raises pitch **one semitone** (half step)
- C♯ = between C and D
- Click **♯** button to activate
- Click again to deactivate

### Flat (♭)
- Lowers pitch **one semitone** (half step)
- B♭ = between A and B
- Click **♭** button to activate

### Natural (♮)
- Cancels any previous accidental
- Returns to base note
- Activated automatically when no accidental selected

The **accidental is part of the visual display** - it affects how the note appears on the sheet but is stored as the adjusted MIDI pitch.

## Measure Overview

Each measure in 4/4 time contains:
- 4 beats total
- Displayed with measure numbers (1, 2, 3, etc.)
- Vertical lines mark measure boundaries
- Time signature shown in score properties

### Filling a Measure
You must fill measures with notes/rests totaling exactly 4 beats:

✅ Valid: 4 quarter notes (1+1+1+1 = 4)
✅ Valid: 1 half note + 2 quarter notes (2+1+1 = 4)
✅ Valid: 1 whole note (4)
✅ Valid: 2 eighth notes + 1 half note (0.5+0.5+2 = 3... wait this is only 3)

## Playback with Notes

After placing notes:
1. Click **"▶ Play"** in toolbar
2. All staves play back their notes
3. Volume/pan controlled in Mixer panel
4. Use **"⏹ Stop"** to stop playback

## Score Export

Your composed notes can be exported as:
- **MusicXML** (basic support)
- **MIDI** (foundation ready)
- Future: PDF, PNG, WAV

## Troubleshooting

### Blue dots not appearing
- ✅ Make sure you're in **"Note"** mode
- ✅ Make sure you're **hovering** over a staff
- ✅ Check if staff is visible on screen

### Can't place note at desired location
- ✅ Another note might already occupy that position
- ✅ Try a different duration (Blue dots move based on duration)
- ✅ Clear overlapping notes first

### Piano keyboard not showing
- ✅ Only shows in **"Note"** mode
- ✅ Click **"Piano"** button in header
- ✅ May need to scroll to see all keys

### Note disappeared after placing
- ✅ Try **Undo** (↶ button)
- ✅ Check if you accidentally switched modes
- ✅ Verify the note appears on correct staff

## Next Steps

Once comfortable with basic note entry:
1. **Try different durations** - Explore whole, half, and eighth notes
2. **Use accidentals** - Compose chromatic passages
3. **Multiple staves** - Build harmonies across instruments
4. **Playback** - Listen to your composition
5. **Edit properties** - Add title, composer name, tempo changes

Happy composing! 🎵
