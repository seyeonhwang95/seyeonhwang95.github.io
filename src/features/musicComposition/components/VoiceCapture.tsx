import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, Square, Music } from 'lucide-react'
import { useVoiceToNote } from '../hooks/useVoiceToNote'
import type { CapturedNote } from '../hooks/useVoiceCapture'

export interface VoiceCaptureProps {
  onNotesDetected?: (notes: CapturedNote[]) => void
  targetInstrument?: string
}

export function VoiceCapture({ onNotesDetected, targetInstrument = 'violin' }: VoiceCaptureProps) {
  const [detectedNotes, setDetectedNotes] = useState<CapturedNote[]>([])
  const [lastAddedNote, setLastAddedNote] = useState<{ note: string; time: number } | null>(null)
  const { startRecording, stopRecording, isRecording, detectedNote } = useVoiceToNote()

  // When a note is detected, add it to the list
  useEffect(() => {
    if (detectedNote && detectedNote !== "No pitch detected") {
      const now = Date.now()
      
      // Only add if note changed or 500ms has passed since last note
      if (!lastAddedNote || 
          lastAddedNote.note !== detectedNote || 
          now - lastAddedNote.time > 500) {
        
        // Parse note string (e.g., "C4" -> midi number)
        const noteWithoutOctave = detectedNote.slice(0, -1)
        const octave = parseInt(detectedNote.slice(-1))
        
        const noteToMidi: { [key: string]: number } = {
          'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
          'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        }
        
        const midi = (octave + 1) * 12 + (noteToMidi[noteWithoutOctave] ?? 0)
        
        // Only add if within violin range (G3 to C6: 55-84)
        if (midi >= 55 && midi <= 84) {
          const newNote: CapturedNote = {
            midi,
            startTime: now,
            duration: 500, // Default duration
            frequency: 440 * Math.pow(2, (midi - 69) / 12),
            certainty: 0.85 // Default certainty
          }
          
          setDetectedNotes((prev) => [...prev, newNote])
          setLastAddedNote({ note: detectedNote, time: now })
          console.log(`Note detected: ${detectedNote} (MIDI ${midi})`)
        }
      }
    }
  }, [detectedNote, lastAddedNote])

  const handleAddNotesToStaff = () => {
    if (onNotesDetected && detectedNotes.length > 0) {
      onNotesDetected(detectedNotes)
    }
  }

  const handleClearNotes = () => {
    setDetectedNotes([])
    setLastAddedNote(null)
  }

  return (
    <div className="voice-capture-panel">
      <Card className="p-4 space-y-4 bg-white border border-gray-200">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Voice to Sheet Music</h3>
          <p className="text-sm text-gray-600">Sing to capture notes for {targetInstrument}</p>
        </div>

        {/* Current Note Display */}
        {detectedNote && detectedNote !== "No pitch detected" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Detected Note</p>
                <p className="text-2xl font-bold text-blue-900">{detectedNote}</p>
              </div>
              {isRecording && (
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              onClick={() => {
                setDetectedNotes([])
                setLastAddedNote(null)
                startRecording()
              }}
              className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1 gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Detected Notes Display */}
        {detectedNotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">
                Detected Notes: {detectedNotes.length}
              </p>
              <Button
                onClick={handleClearNotes}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Clear
              </Button>
            </div>

            {/* Notes List */}
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
              <div className="space-y-1">
                {detectedNotes.map((note, idx) => {
                  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
                  const noteName = noteNames[note.midi % 12] + Math.floor(note.midi / 12 - 1)
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs p-2 bg-white border border-gray-200 rounded"
                    >
                      <span className="font-medium text-gray-900">{noteName}</span>
                      <span className="text-gray-600">MIDI {note.midi}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add to Staff Button */}
            <Button
              onClick={handleAddNotesToStaff}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Add {detectedNotes.length} Note{detectedNotes.length !== 1 ? 's' : ''} to Staff
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Sing or hum clearly for best detection</li>
            <li>Works best in quiet environments</li>
            <li>Notes filtered to violin range (G3-C6)</li>
            <li>Browser must allow microphone access</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
