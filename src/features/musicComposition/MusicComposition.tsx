import { useState, useMemo, useRef, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useScoreEditor } from './hooks/useScoreEditor'
import { usePlayback } from './hooks/usePlayback'
import { createOrchestraTemplate, clearAllNotes } from './utils/scoreUtils'
import { exportScoreToPDF, exportScoreAsXML } from './utils/pdfExport'
import { createNoteInMeasure } from './utils/noteInputUtils'
import { EditorToolbar } from './components/EditorToolbar'
import { NoteInputBar } from './components/NoteInputBar'
import { StaffView } from './components/StaffView'
import { Mixer } from './components/Mixer'
import { ScoreProperties } from './components/ScoreProperties'
import { PianoKeyboard } from './components/PianoKeyboard'
import { VoiceCapture } from './components/VoiceCapture'
import type { Instrument, CompositionMode, Score } from './types/musicTypes'
import type { CapturedNote } from './hooks/useVoiceCapture'
import { toast } from 'sonner'
import './musicComposition.css'

export function MusicComposition() {
  const [showProperties, setShowProperties] = useState(true)
  const [showMixer, setShowMixer] = useState(true)
  const [showPianoKeyboard, setShowPianoKeyboard] = useState(false)
  const [showVoiceCapture, setShowVoiceCapture] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState('quarter')
  const [selectedAccidental, setSelectedAccidental] = useState<'sharp' | 'flat' | 'natural' | null>(null)
  const [selectedMidiNote, setSelectedMidiNote] = useState<number | null>(60) // Middle C

  // Score canvas ref for PDF export
  const scoreCanvasRef = useRef<HTMLDivElement>(null)

  // Initialize with orchestra template
  const initialScore = useMemo(() => createOrchestraTemplate(), [])

  const editor = useScoreEditor({
    initialScore,
  })

  const playback = usePlayback({
    tempo: editor.score.tempo,
    score: editor.score,
  })

  const handleModeChange = (newMode: string) => {
    editor.changeMode(newMode as CompositionMode)
  }

  const handleReset = () => {
    setShowResetDialog(true)
  }

  const handleConfirmReset = () => {
    setShowResetDialog(false)
    const clearedScore = clearAllNotes(editor.score)
    editor.resetScore(clearedScore)
  }

  const handleExportPDF = async () => {
    try {
      setExportError(null)
      if (!scoreCanvasRef.current) {
        throw new Error('Score canvas not available')
      }
      await exportScoreToPDF(scoreCanvasRef.current, editor.score)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setExportError(errorMessage)
      console.error('PDF export error:', error)
    }
  }

  const handleExportXML = () => {
    try {
      setExportError(null)
      exportScoreAsXML(editor.score)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setExportError(errorMessage)
      console.error('XML export error:', error)
    }
  }

  // Display export errors as toast notifications
  useEffect(() => {
    if (exportError) {
      toast.error(`Export failed: ${exportError}`)
    }
  }, [exportError])

  const handleUpdateScore = (updates: Partial<Score>) => {
    editor.updateScore((score) => {
      const updated = {
        ...score,
        ...updates,
      }
      
      // When key signature changes, update all measures
      if (updates.keySignature) {
        updated.staves = score.staves.map((staff) => ({
          ...staff,
          measures: staff.measures.map((measure) => ({
            ...measure,
            keySignature: updates.keySignature!,
          })),
        })) as any
      }

      // When time signature changes, update all measures
      if (updates.timeSignature) {
        updated.staves = score.staves.map((staff) => ({
          ...staff,
          measures: staff.measures.map((measure) => ({
            ...measure,
            timeSignature: updates.timeSignature!,
          })),
        })) as any
      }

      return updated
    })
  }

  const handleUpdateInstrument = (instrumentId: string, updates: Partial<Instrument>) => {
    editor.updateScore((score) => ({
      ...score,
      staves: score.staves.map((staff) =>
        staff.instrument.id === instrumentId
          ? {
              ...staff,
              instrument: {
                ...staff.instrument,
                ...updates,
              },
            }
          : staff,
      ),
    }))
  }

  /**
   * Handle adding a note to a measure on a specific staff
   */
  const handleAddNoteAtMeasure = (staffId: string, measureId: string, beat: number) => {
    if (!selectedMidiNote) return

    editor.updateScore((score) => {
      const newStaves = score.staves.map((staff) => {
        // Only update the correct staff
        if (staff.id !== staffId) {
          return staff
        }

        const newMeasures = staff.measures.map((measure) => {
          if (measure.id === measureId) {
            const { measure: updatedMeasure } = createNoteInMeasure(
              measure,
              selectedMidiNote,
              selectedDuration,
              selectedAccidental,
              beat,
            )
            return updatedMeasure
          }
          return measure
        })
        return { ...staff, measures: newMeasures }
      })
      return { ...score, staves: newStaves }
    })
  }

  /**
   * Handle adding captured notes from voice input to the violin staff
   */
  const handleVoiceNotesDetected = (capturedNotes: CapturedNote[]) => {
    // Find the violin staff
    const violinStaff = editor.score.staves.find(
      (staff) => staff.instrument.id === 'violin' || staff.instrument.name.toLowerCase().includes('violin')
    )

    if (!violinStaff) {
      alert('Violin staff not found. Please add Violin to the score first.')
      return
    }

    editor.updateScore((score) => {
      const newStaves = score.staves.map((staff) => {
        if (staff.id !== violinStaff.id) {
          return staff
        }

        // Get measures for the violin staff
        let newMeasures = [...staff.measures]
        let currentMeasureIdx = 0
        let currentBeat = 0
        const beatsPerMeasure = 4 // Assuming 4/4 time

        // Add captured notes to measures
        for (const capturedNote of capturedNotes) {
          // Convert duration from ms to beat count (assuming 120 BPM, quarter note = 500ms)
          const beatDuration = (capturedNote.duration / 500) * 1 // Adjust based on score tempo
          const noteDuration = beatDuration >= 4 ? 'whole' : beatDuration >= 2 ? 'half' : beatDuration >= 1 ? 'quarter' : 'eighth'

          // Find appropriate measure
          while (currentBeat + beatDuration > beatsPerMeasure && currentMeasureIdx < newMeasures.length) {
            currentBeat = 0
            currentMeasureIdx++
          }

          if (currentMeasureIdx < newMeasures.length) {
            const measure = newMeasures[currentMeasureIdx]
            const { measure: updatedMeasure } = createNoteInMeasure(
              measure,
              capturedNote.midi,
              noteDuration,
              null,
              currentBeat,
            )
            newMeasures[currentMeasureIdx] = updatedMeasure
            currentBeat += beatDuration
          }
        }

        return { ...staff, measures: newMeasures }
      })

      return { ...score, staves: newStaves }
    })

    // Close voice capture panel after adding notes
    setShowVoiceCapture(false)
  }

  /**
   * Handle selecting a measure for quick note entry
   */
  const handleSelectElement = (elementId: string) => {
    editor.selectElement({
      type: 'note',
      elementId,
      staffId: editor.selection.staffId,
    })
  }

  return (
    <div className="music-composition">
      {/* Header */}
      <header className="composition-header">
        <div className="header-title">
          <h1>{editor.score.title || 'Untitled Score'}</h1>
          {editor.score.composer && <p className="composer">by {editor.score.composer}</p>}
        </div>
        <div className="header-controls">
          <button onClick={() => setShowProperties(!showProperties)}>
            {showProperties ? '✕' : '○'} Properties
          </button>
          <button onClick={() => setShowMixer(!showMixer)}>
            {showMixer ? '✕' : '○'} Mixer
          </button>
          <button onClick={() => setShowVoiceCapture(!showVoiceCapture)}>
            {showVoiceCapture ? '✕' : '○'} Voice
          </button>
          {editor.mode === 'note' && (
            <button onClick={() => setShowPianoKeyboard(!showPianoKeyboard)}>
              {showPianoKeyboard ? '✕' : '○'} Piano
            </button>
          )}
        </div>
      </header>

      {/* Main Toolbar */}
      <EditorToolbar
        mode={editor.mode}
        onModeChange={handleModeChange}
        canUndo={editor.canUndo}
        onUndo={editor.undo}
        canRedo={editor.canRedo}
        onRedo={editor.redo}
        isPlaying={playback.isPlaying}
        onPlay={playback.play}
        onPause={playback.pause}
        onStop={playback.stop}
        onReset={handleReset}
        onExportPDF={handleExportPDF}
        onExportXML={handleExportXML}
      />

      {/* Note Input Bar */}
      {editor.mode !== 'select' && (
        <NoteInputBar
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
          selectedAccidental={selectedAccidental}
          onAccidentalChange={setSelectedAccidental}
        />
      )}

      {/* Piano Keyboard (in note mode) */}
      {editor.mode === 'note' && showPianoKeyboard && (
        <div className="piano-keyboard-container">
          <PianoKeyboard
            selectedMidiNote={selectedMidiNote || undefined}
            onSelectNote={setSelectedMidiNote}
          />
        </div>
      )}

      {/* Voice Capture Panel */}
      {showVoiceCapture && (
        <div className="voice-capture-container">
          <VoiceCapture
            targetInstrument="violin"
            onNotesDetected={handleVoiceNotesDetected}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="composition-main">
        {/* Sidebar - Properties */}
        {showProperties && (
          <aside className="properties-sidebar">
            <ScoreProperties
              score={editor.score}
              onUpdateScore={handleUpdateScore}
            />
          </aside>
        )}

        {/* Center - Score Editor */}
        <main className="score-editor">
          <div className="score-canvas" ref={scoreCanvasRef}>
            {editor.score.staves.length > 0 ? (
              <div className="staves-container">
                {editor.score.staves.map((staff) => (
                  <StaffView
                    key={staff.id}
                    staffId={staff.id}
                    staffName={staff.instrument.name}
                    clef={staff.clef}
                    measures={staff.measures}
                    selectedElementId={
                      editor.selection.staffId === staff.id
                        ? editor.selection.elementId
                        : undefined
                    }
                    selectedDuration={selectedDuration}
                    mode={editor.mode as 'select' | 'note' | 'rest' | 'edit'}
                    playingNoteIds={playback.playingNoteIds}
                    onSelectElement={handleSelectElement}
                    onAddNoteAtMeasure={handleAddNoteAtMeasure}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-score">
                <p>No staves in score. Add instruments to get started.</p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar - Mixer */}
        {showMixer && (
          <aside className="mixer-sidebar">
            <Mixer
              instruments={editor.score.staves.map((s) => s.instrument)}
              onUpdateInstrument={handleUpdateInstrument}
            />
          </aside>
        )}
      </div>

      {/* Playback Controls */}
      <footer className="composition-footer">
        <div className="playback-info">
          <span>Tempo: {editor.score.tempo} BPM</span>
          <span>Time: {Math.floor(playback.currentTime)}s / {Math.floor(playback.duration)}s</span>
          {editor.mode === 'note' && selectedMidiNote && (
            <span>Note: MIDI #{selectedMidiNote}</span>
          )}
        </div>
        <input
          type="range"
          min="0"
          max={playback.duration}
          value={playback.currentTime}
          onChange={(e) => playback.seek(Number(e.target.value))}
          className="playback-slider"
        />
      </footer>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all notes and rests from the music sheet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
