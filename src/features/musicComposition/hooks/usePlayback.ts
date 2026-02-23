import { useState, useCallback, useRef, useEffect } from 'react'
import { playNoteTone, initializeToneSynthesis } from '../utils/toneSynthesis'
import { playNote } from '../utils/audioSynthesis'
import type { Score } from '../types/musicTypes'
import { NOTE_DURATIONS_BEATS } from '../utils/musicConstants'

interface UsePlaybackProps {
  tempo?: number
  score?: Score
}

interface ScheduledNote {
  pitch: number
  startTime: number
  duration: number
  id: string
  staffId: string
  isMuted: boolean
  instrumentId: string
}

export const usePlayback = ({ tempo = 120, score }: UsePlaybackProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.6)
  const [useAdvancedAudio, setUseAdvancedAudio] = useState(true) // Use Tone.js by default
  const [playingNoteIds, setPlayingNoteIds] = useState<Set<string>>(new Set())
  
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scheduledNotesRef = useRef<Map<string, boolean>>(new Map())
  const allNotesRef = useRef<ScheduledNote[]>([])
  const toneSynthInitializedRef = useRef(false)

  // Initialize Tone.js on first mount
  useEffect(() => {
    if (!toneSynthInitializedRef.current) {
      initializeToneSynthesis()
        .then(() => {
          toneSynthInitializedRef.current = true
          console.log('✅ Tone.js synthesis ready')
        })
        .catch((error) => {
          console.warn('Failed to initialize Tone.js, falling back to Web Audio:', error)
          setUseAdvancedAudio(false)
        })
    }
  }, [])

  // Build list of all notes with their playback times
  useEffect(() => {
    if (!score) return

    const notes: ScheduledNote[] = []
    const beatsPerMeasure = score.timeSignature.numerator || 4
    const beatDurationSec = 60 / (tempo || 120)

    score.staves.forEach((staff) => {
      staff.measures.forEach((measure) => {
        const measureStartTime = (measure.number - 1) * beatsPerMeasure * beatDurationSec

        measure.content.forEach((item) => {
          // Only include notes, not rests
          if ('pitch' in item) {
            const note = item as any
            const noteStartTime = measureStartTime + note.startTime * beatDurationSec
            const noteDurationBeats = NOTE_DURATIONS_BEATS[note.duration as keyof typeof NOTE_DURATIONS_BEATS] || 1
            const noteDurationSec = noteDurationBeats * beatDurationSec

            notes.push({
              pitch: note.pitch,
              startTime: noteStartTime,
              duration: noteDurationSec * 1000, // Convert to milliseconds
              id: `${staff.id}_${measure.id}_${note.id}`,
              staffId: staff.id,
              isMuted: staff.instrument.muted || false,
              instrumentId: staff.instrument.id,
            })
          }
        })
      })
    })

    allNotesRef.current = notes

    // Calculate total duration
    if (notes.length > 0) {
      const maxTime = Math.max(...notes.map((n) => n.startTime + n.duration / 1000))
      setDuration(maxTime)
      console.log('🎵 Playback notes loaded:', notes.length, 'notes, duration:', maxTime, 's')
    } else {
      setDuration(0)
      console.log('⚠️ No notes found in score')
    }
  }, [score, tempo])

  // Main playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
      return
    }

    console.log('▶️ Playback started, notes to play:', allNotesRef.current.length)

    // Play any notes that should have started by currentTime
    allNotesRef.current.forEach((note) => {
      if (
        currentTime >= note.startTime &&
        !scheduledNotesRef.current.has(note.id) &&
        !note.isMuted
      ) {
        console.log(`🎵 Playing note ${note.pitch} (MIDI) at ${currentTime.toFixed(2)}s (caught up) on ${note.instrumentId}`)
        const audioPlayFn = useAdvancedAudio ? playNoteTone : playNote
        audioPlayFn(note.pitch, { duration: note.duration, volume, instrument: note.instrumentId })
        scheduledNotesRef.current.set(note.id, true)
      } else if (
        currentTime >= note.startTime &&
        !scheduledNotesRef.current.has(note.id) &&
        note.isMuted
      ) {
        // Still mark as scheduled even if muted, so we don't try to play it again
        scheduledNotesRef.current.set(note.id, true)
      }
    })

    playbackIntervalRef.current = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 0.05 // 50ms increment

        if (nextTime >= duration && duration > 0) {
          // Stop when we reach the end
          console.log('⏹ Playback finished, resetting position')
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current)
            playbackIntervalRef.current = null
          }
          setIsPlaying(false)
          scheduledNotesRef.current.clear() // Clear so notes can play again on next playback
          // Return to beginning for next playback
          return 0
        }

        // Play any notes that should start in this time window
        allNotesRef.current.forEach((note) => {
          // Check if this note should start now (within the next 50ms)
          if (
            nextTime >= note.startTime &&
            prevTime < note.startTime &&
            !scheduledNotesRef.current.has(note.id)
          ) {
            if (!note.isMuted) {
              console.log(`🎵 Playing note ${note.pitch} (MIDI) at ${nextTime.toFixed(2)}s on ${note.instrumentId}`)
              const audioPlayFn = useAdvancedAudio ? playNoteTone : playNote
              audioPlayFn(note.pitch, { duration: note.duration, volume, instrument: note.instrumentId })
            }
            scheduledNotesRef.current.set(note.id, true)
          }
        })
        // Update currently playing notes for highlighting
        const currentlyPlaying = new Set<string>()
        allNotesRef.current.forEach((note) => {
          const noteEndTime = note.startTime + note.duration / 1000
          if (nextTime >= note.startTime && nextTime < noteEndTime) {
            currentlyPlaying.add(note.id)
          }
        })
        setPlayingNoteIds(currentlyPlaying)
        return nextTime
      })
    }, 50)

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
    }
  }, [isPlaying, duration, volume, useAdvancedAudio])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    scheduledNotesRef.current.clear()
  }, [])

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)))
    scheduledNotesRef.current.clear() // Reset which notes have been played
  }, [duration])

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    playingNoteIds,
    // Actions
    play,
    pause,
    stop,
    seek,
    setDuration,
    setVolume,
  }
}
