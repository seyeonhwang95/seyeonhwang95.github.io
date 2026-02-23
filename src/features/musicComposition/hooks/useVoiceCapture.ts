import { useEffect, useRef, useState, useCallback } from 'react'
import { detectPitch, constrainMidiRange } from '../utils/pitchDetection'
import type { DetectedPitch } from '../utils/pitchDetection'

export interface CapturedNote {
  midi: number
  startTime: number
  duration: number
  frequency: number
  certainty: number
}

export interface UseVoiceCaptureOptions {
  onNoteDetected?: (note: CapturedNote) => void
  minConfidence?: number
  minNoteDuration?: number // ms
  violinRange?: { min: number; max: number }
  fftSize?: number
}

/**
 * Hook for capturing voice and detecting notes in real-time
 */
export function useVoiceCapture(options: UseVoiceCaptureOptions = {}) {
  const {
    onNoteDetected,
    minConfidence = 0.8,
    minNoteDuration = 200, // 200ms minimum note duration
    violinRange = { min: 55, max: 84 }, // G3 to C6
    fftSize = 4096,
  } = options

  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPitch, setCurrentPitch] = useState<DetectedPitch | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dataArrayRef = useRef<Float32Array | null>(null)

  const currentNoteRef = useRef<{
    midi: number
    startTime: number
    frequency: number
    certainty: number
  } | null>(null)

  // Initialize audio context and start pitch detection loop
  const startRecording = useCallback(async () => {
    try {
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create audio context
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      // Create analyser node
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = fftSize
      analyser.smoothingTimeConstant = 0.85

      analyserRef.current = analyser

      // Create data array for FFT
      const dataArray = new Float32Array(analyser.frequencyBinCount)
      dataArrayRef.current = dataArray

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      setIsRecording(true)

      // Start pitch detection loop
      const detectLoop = function (this: unknown) {
        if (!analyserRef.current || !dataArrayRef.current) return

        const dataArray = dataArrayRef.current
        // @ts-ignore
        analyserRef.current.getFloatTimeDomainData(dataArray)

        const detected = detectPitch(dataArray, audioContext.sampleRate, minConfidence)

        if (detected.frequency !== null) {
          // Constrain to violin range
          const constrainedMidi = constrainMidiRange(
            detected.midi!,
            violinRange.min,
            violinRange.max
          )

          detected.midi = constrainedMidi

          setCurrentPitch(detected)

          // Detect note onsets and offsets
          const now = Date.now()

          if (!currentNoteRef.current) {
            // Note onset
            currentNoteRef.current = {
              midi: constrainedMidi,
              startTime: now,
              frequency: detected.frequency,
              certainty: detected.certainty,
            }
          } else if (currentNoteRef.current.midi === constrainedMidi) {
            // Same note continues - update frequency for smoothing
            currentNoteRef.current.frequency = detected.frequency
            currentNoteRef.current.certainty = detected.certainty
          } else {
            // Note changed - fire callback for previous note if duration sufficient
            const noteDuration = now - currentNoteRef.current.startTime
            if (noteDuration >= minNoteDuration && onNoteDetected) {
              onNoteDetected({
                midi: currentNoteRef.current.midi,
                startTime: currentNoteRef.current.startTime,
                duration: noteDuration,
                frequency: currentNoteRef.current.frequency,
                certainty: currentNoteRef.current.certainty,
              })
            }

            // Start new note
            currentNoteRef.current = {
              midi: constrainedMidi,
              startTime: now,
              frequency: detected.frequency,
              certainty: detected.certainty,
            }
          }
        } else {
          // No pitch detected
          if (currentNoteRef.current) {
            const now = Date.now()
            const noteDuration = now - currentNoteRef.current.startTime

            // Fire callback for released note if duration sufficient
            if (noteDuration >= minNoteDuration && onNoteDetected) {
              onNoteDetected({
                midi: currentNoteRef.current.midi,
                startTime: currentNoteRef.current.startTime,
                duration: noteDuration,
                frequency: currentNoteRef.current.frequency,
                certainty: currentNoteRef.current.certainty,
              })
            }

            currentNoteRef.current = null
          }

          setCurrentPitch(null)
        }

        animationFrameRef.current = requestAnimationFrame(detectLoop)
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone'
      setError(message)
      setIsRecording(false)
    }
  }, [minConfidence, minNoteDuration, violinRange, fftSize, onNoteDetected])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    // Fire callback for last note if it exists
    if (currentNoteRef.current && onNoteDetected) {
      const now = Date.now()
      const noteDuration = now - currentNoteRef.current.startTime

      if (noteDuration >= minNoteDuration) {
        onNoteDetected({
          midi: currentNoteRef.current.midi,
          startTime: currentNoteRef.current.startTime,
          duration: noteDuration,
          frequency: currentNoteRef.current.frequency,
          certainty: currentNoteRef.current.certainty,
        })
      }
    }

    setIsRecording(false)
    setCurrentPitch(null)
    currentNoteRef.current = null
  }, [minNoteDuration, onNoteDetected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [isRecording, stopRecording])

  return {
    isRecording,
    error,
    currentPitch,
    startRecording,
    stopRecording,
  }
}
