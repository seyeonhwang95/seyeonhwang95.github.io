/**
 * Audio synthesis utilities using Web Audio API
 * Generates rich tones with proper envelope for musical playback
 */

import { midiToFrequency } from './musicConstants'

// Global audio context (singleton pattern)
let audioContext: AudioContext | null = null
let convolver: ConvolverNode | null = null

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    initializeReverb()
  }
  return audioContext
}

/**
 * Initialize simple reverb/convolver for better sound
 */
function initializeReverb(): void {
  if (!audioContext || convolver) return

  try {
    // Create impulse response for reverb (simple hall reverb simulation)
    const rate = audioContext.sampleRate
    const length = rate * 2 // 2 seconds of reverb
    const impulseResponse = audioContext.createBuffer(2, length, rate)
    const left = impulseResponse.getChannelData(0)
    const right = impulseResponse.getChannelData(1)

    // Generate a simple exponential decay impulse response
    for (let i = 0; i < length; i++) {
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
    }

    convolver = audioContext.createConvolver()
    convolver.buffer = impulseResponse
    convolver.connect(audioContext.destination)
  } catch (e) {
    console.warn('Could not initialize reverb')
  }
}

interface PlayNoteOptions {
  duration?: number // milliseconds
  volume?: number // 0-1
  instrument?: string // instrument ID
}

/**
 * Play a single note with rich synthesis and proper envelope
 * Uses sawtooth wave with filters for orchestral sound
 */
export function playNote(midiNumber: number, options: PlayNoteOptions = {}): void {
  const {
    duration = 500, // 500ms default
    volume = 0.3,
    instrument = 'violin', // Changed default to violin for richer sound
  } = options

  try {
    const ctx = getAudioContext()
    const frequency = midiToFrequency(midiNumber)

    // Resume audio context if suspended (required by modern browsers)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const durationSec = duration / 1000

    // ADSR envelope parameters (in seconds)
    const attackTime = Math.min(0.05, durationSec * 0.15) // 50ms or 15% of duration
    const decayTime = Math.min(0.1, durationSec * 0.2) // 100ms or 20% of duration
    const sustainLevel = 0.8
    const releaseTime = Math.min(0.2, durationSec * 0.3) // 200ms or 30% of duration

    // Create primary oscillator with richer waveform
    const osc1 = ctx.createOscillator()
    osc1.frequency.value = frequency

    // Create secondary oscillator for richness (slightly detuned)
    const osc2 = ctx.createOscillator()
    osc2.frequency.value = frequency * 1.005 // Slight detune for warmth

    // Select waveform based on instrument
    let waveType: OscillatorType
    if (instrument === 'piano') {
      waveType = 'sine'
    } else if (instrument === 'flute') {
      waveType = 'sine'
    } else {
      // violin, sawtooth, square default to richer waveforms
      waveType = 'sawtooth'
    }

    osc1.type = waveType
    osc2.type = waveType

    // Create low-pass filter for smoother sound
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 4000 // 4kHz cutoff
    filter.Q.value = 1

    // Envelope the filter too for more expression
    const filterGain = ctx.createGain()
    filterGain.gain.setValueAtTime(1, now)
    filterGain.gain.linearRampToValueAtTime(0.7, now + attackTime) // Close filter slightly during attack
    filterGain.gain.linearRampToValueAtTime(1, now + attackTime + decayTime) // Open back up

    // Create main gain node for amplitude envelope
    const gainNode = ctx.createGain()

    // ADSR Envelope
    gainNode.gain.setValueAtTime(0, now) // Start silent
    gainNode.gain.linearRampToValueAtTime(volume, now + attackTime) // Attack
    gainNode.gain.linearRampToValueAtTime(volume * sustainLevel, now + attackTime + decayTime) // Decay to sustain
    gainNode.gain.setValueAtTime(volume * sustainLevel, now + durationSec - releaseTime) // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + durationSec) // Release

    // Connect nodes: oscillators → filter → gain → destination (or reverb)
    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gainNode)

    if (convolver) {
      gainNode.connect(convolver) // Send to reverb
      const dryGain = ctx.createGain()
      dryGain.gain.value = 0.7 // 70% dry
      gainNode.connect(dryGain)
      dryGain.connect(ctx.destination)

      const wetGain = ctx.createGain()
      wetGain.gain.value = 0.3 // 30% wet (reverb)
      gainNode.connect(convolver)
    } else {
      gainNode.connect(ctx.destination)
    }

    // Play notes
    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + durationSec)
    osc2.stop(now + durationSec)

    // Clean up nodes after they stop
    setTimeout(() => {
      try {
        osc1.disconnect()
        osc2.disconnect()
        filter.disconnect()
        gainNode.disconnect()
      } catch (e) {
        // Already disconnected
      }
    }, duration + 200)
  } catch (error) {
    console.warn('Audio playback failed:', error)
  }
}

/**
 * Play multiple notes with slight delays (strum effect)
 */
export function playChord(midiNumbers: number[], options: PlayNoteOptions = {}): void {
  const { duration = 500, volume = 0.2 } = options
  const staggerDelay = 30 // ms between notes

  midiNumbers.forEach((note, index) => {
    setTimeout(() => {
      playNote(note, { duration, volume, ...options })
    }, index * staggerDelay)
  })
}

/**
 * Stop all audio by suspending the audio context
 */
export function stopAllAudio(): void {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend()
  }
}

/**
 * Adjust audio context volume (master volume)
 */
export function setMasterVolume(_volume: number): void {
  // TODO: Implement master volume control
  // const _ctx = getAudioContext()
  // Note: Web Audio API doesn't have a direct master volume
  // This would require additional implementation with a GainNode
  // For now, we handle volume per note in playNote()
}
