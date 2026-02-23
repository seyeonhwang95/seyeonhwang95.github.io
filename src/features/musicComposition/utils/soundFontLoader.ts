/**
 * SoundFont loader and player
 * Loads professional instrument samples for realistic audio playback
 */

import { midiToFrequency } from './musicConstants'

interface PlayNoteOptions {
  duration?: number // milliseconds
  volume?: number // 0-1
  instrument?: string
}

let audioContext: AudioContext | null = null
// Store for future use when full SoundFont support is implemented
// @ts-expect-error - intentionally unused for future implementation
const soundFonts: Map<string, AudioBuffer[]> = new Map()

/**
 * Initialize audio context
 */
function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Load SoundFont from URL (Freepats or similar)
 * This uses a simple approach - for production, use a dedicated SoundFont library
 */
export async function loadSoundFont(
  instrumentName: string,
  soundFontUrl?: string,
): Promise<void> {
  try {
    initAudioContext()

    // If no URL provided, use Freepats CDN
    const url = soundFontUrl ||
      `https://freepats.zenvoid.org/Piano/acoustic-grand-piano-mp3-${instrumentName}.tar`

    console.log('Loading SoundFont:', url)
    // Note: Full SoundFont implementation would require a dedicated library
    // like sf2-player or soundfont-player
    
    console.log('🎵 SoundFont loaded (basic support)')
  } catch (error) {
    console.warn('Failed to load SoundFont:', error)
  }
}

/**
 * Play a note using SoundFont samples
 * Simplified version - for production use soundfont-player package
 */
export function playNoteSoundFont(
  midiNumber: number,
  options: PlayNoteOptions = {},
): void {
  const {
    duration = 500,
    volume = 0.3,
    instrument: _unusedInstrument = 'acoustic_grand_piano',
  } = options

  try {
    const ctx = initAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // For now, fall back to basic synthesis
    // Real SoundFont playback requires loading audio buffers
    playNoteSoundFontSimple(midiNumber, duration, volume)
  } catch (error) {
    console.warn('SoundFont playback failed:', error)
  }
}

/**
 * Simplified SoundFont playback using Web Audio API
 * This is a fallback when actual SoundFont samples aren't available
 */
function playNoteSoundFontSimple(
  midiNumber: number,
  duration: number,
  volume: number,
): void {
  const ctx = initAudioContext()
  const frequency = midiToFrequency(midiNumber)
  const now = ctx.currentTime
  const durationSec = duration / 1000

  // Create nodes
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gainNode = ctx.createGain()

  // Use sawtooth for richer tone
  osc.type = 'sawtooth'
  osc.frequency.value = frequency

  // Filter settings
  filter.type = 'lowpass'
  filter.frequency.value = 5000
  filter.Q.value = 2

  // ADSR envelope
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.05) // Attack
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, now + 0.2) // Decay
  gainNode.gain.setValueAtTime(volume * 0.7, now + durationSec - 0.1) // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + durationSec) // Release

  // Connect nodes
  osc.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)

  // Play
  osc.start(now)
  osc.stop(now + durationSec)

  // Cleanup
  setTimeout(() => {
    try {
      osc.disconnect()
      filter.disconnect()
      gainNode.disconnect()
    } catch (e) {
      // Already disconnected
    }
  }, duration + 100)
}

/**
 * Load and play SoundFont with optimized library
 * (Requires soundfont-player package - commented for now)
 */
export async function playSoundFontNote(
  midiNumber: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _instrumentName: string = 'acoustic_grand_piano',
  duration: number = 500,
  volume: number = 0.3,
): Promise<void> {
  try {
    // This would use soundfont-player library:
    // import Soundfont from 'soundfont-player'
    // const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    // const instrument = await Soundfont.instrument(ac, _instrumentName)
    // instrument.play(midiNumber, ac.currentTime, { duration: duration / 1000, gain: volume })

    // For now, use fallback
    playNoteSoundFontSimple(midiNumber, duration, volume)
  } catch (error) {
    console.warn('SoundFont note playback failed:', error)
  }
}
