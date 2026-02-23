/**
 * High-quality audio synthesis using Tone.js
 * Provides rich instrument sounds with proper ADSR envelopes
 */

import * as Tone from 'tone'

// Global synth instances for different instruments
let synthInstances: Map<string, Tone.Synth | Tone.PolySynth> = new Map()

interface PlayNoteOptions {
  duration?: number // milliseconds
  volume?: number // 0-1
  instrument?: string // instrument ID
}

/**
 * Initialize Tone.js and create instrument synths
 */
export async function initializeToneSynthesis(): Promise<void> {
  try {
    // Start Tone.js audio context
    await Tone.start()

    // Create different synths for different instruments
    createInstrumentSynths()

    console.log('🎵 Tone.js synthesis initialized')
  } catch (error) {
    console.warn('Failed to initialize Tone.js:', error)
  }
}

/**
 * Create synth instances for different instruments
 */
function createInstrumentSynths(): void {
  // Piano synth - bright, percussive with sharp attack and quick decay
  const pianoReverb = new Tone.Reverb({
    decay: 1.2,
  }).toDestination()
  
  const pianoSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.002,
      decay: 0.25,
      sustain: 0.05,
      release: 0.3,
    },
  }).connect(pianoReverb)
  synthInstances.set('piano', pianoSynth)

  // Violin synth - smooth, sustained with rich harmonics
  const violinReverb = new Tone.Reverb({
    decay: 2.0,
  }).toDestination()
  
  const violinSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.15,
      decay: 0.05,
      sustain: 0.85,
      release: 0.6,
    },
  }).connect(violinReverb)
  
  synthInstances.set('violin', violinSynth)

  // Oboe synth - nasal, somewhat sharp but mellow
  const oboeReverb = new Tone.Reverb({
    decay: 1.3,
  }).toDestination()
  
  const oboeSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.12,
      decay: 0.08,
      sustain: 0.7,
      release: 0.35,
    },
  }).connect(oboeReverb)
  synthInstances.set('oboe', oboeSynth)

  // Clarinet synth - warm, cylindrical like wood
  const clarinetReverb = new Tone.Reverb({
    decay: 1.1,
  }).toDestination()
  
  const clarinetSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.1,
      decay: 0.12,
      sustain: 0.75,
      release: 0.4,
    },
  }).connect(clarinetReverb)
  synthInstances.set('clarinet', clarinetSynth)

  // Bassoon synth - deep, warm, woody tone
  const bassoonReverb = new Tone.Reverb({
    decay: 1.8,
  }).toDestination()
  
  const bassoonSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.2,
      decay: 0.08,
      sustain: 0.8,
      release: 0.5,
    },
  }).connect(bassoonReverb)
  synthInstances.set('bassoon', bassoonSynth)

  // Flute synth - light, airy with minimal sustain
  const fluteReverb = new Tone.Reverb({
    decay: 1.0,
  }).toDestination()
  
  const fluteSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.5,
      release: 0.25,
    },
  }).connect(fluteReverb)
  synthInstances.set('flute', fluteSynth)

  // Trumpet synth - bright, piercing brass
  const trumpetReverb = new Tone.Reverb({
    decay: 1.4,
  }).toDestination()
  
  const trumpetSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.08,
      decay: 0.2,
      sustain: 0.65,
      release: 0.35,
    },
  }).connect(trumpetReverb)
  synthInstances.set('trumpet', trumpetSynth)

  // Horn synth - warm brass tone
  const hornReverb = new Tone.Reverb({
    decay: 1.6,
  }).toDestination()
  
  const hornSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.13,
      decay: 0.1,
      sustain: 0.75,
      release: 0.45,
    },
  }).connect(hornReverb)
  synthInstances.set('horn', hornSynth)

  // Cello synth - warm, deep sustained
  const celloReverb = new Tone.Reverb({
    decay: 2.2,
  }).toDestination()
  
  const celloSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.18,
      decay: 0.08,
      sustain: 0.85,
      release: 0.65,
    },
  }).connect(celloReverb)
  synthInstances.set('cello', celloSynth)

  // Bell synth - metallic, decaying quickly with no sustain
  const bellReverb = new Tone.Reverb({
    decay: 2.5,
  }).toDestination()
  
  const bellSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.001,
      decay: 1.0,
      sustain: 0,
      release: 0.1,
    },
  }).connect(bellReverb)
  synthInstances.set('bell', bellSynth)

  // Generic synth - bright, synth-like with good sustain
  const synthReverb = new Tone.Reverb({
    decay: 1.5,
  }).toDestination()
  
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.6,
      release: 0.4,
    },
  }).connect(synthReverb)
  synthInstances.set('synth', synth)
}

/**
 * Play a note using Tone.js
 */
export function playNoteTone(
  midiNumber: number,
  options: PlayNoteOptions = {},
): void {
  const {
    duration = 500,
    volume = 0.3,
    instrument = 'violin',
  } = options

  try {
    // Ensure Tone.js is started
    if (Tone.context.state === 'suspended') {
      Tone.context.resume()
    }

    // Get the appropriate synth
    const synth = synthInstances.get(instrument) ||
                  synthInstances.get('violin')

    if (!synth) {
      console.warn('Synth not found for instrument:', instrument)
      return
    }

    // Set volume (0-1 scale)
    synth.volume.value = Tone.gainToDb(Math.max(0, Math.min(1, volume)))

    // Convert MIDI note to note name
    const noteName = midiNumberToNoteName(midiNumber)

    // Play note for specified duration
    const durationSec = duration / 1000
    synth.triggerAttackRelease(noteName, durationSec)

    console.log(
      `🎵 Playing ${instrument}: ${noteName} for ${durationSec.toFixed(2)}s`,
    )
  } catch (error) {
    console.warn('Failed to play note with Tone.js:', error)
  }
}

/**
 * Convert MIDI note number to Tone.js note name
 * E.g., 60 = C4, 69 = A4
 */
function midiNumberToNoteName(midiNumber: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midiNumber / 12) - 1
  const noteIndex = midiNumber % 12
  return `${noteNames[noteIndex]}${octave}`
}

/**
 * Stop all playing notes
 */
export function stopAllNotes(): void {
  synthInstances.forEach((synth) => {
    synth.triggerRelease(Tone.now())
  })
}

/**
 * Dispose of all synths (cleanup)
 */
export function disposeToneSynthesis(): void {
  synthInstances.forEach((synth) => {
    synth.dispose()
  })
  synthInstances.clear()
}
