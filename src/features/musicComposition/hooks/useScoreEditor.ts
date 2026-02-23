import { useState, useCallback, useMemo } from 'react'
import type { Score, CompositionMode, SelectionInfo } from '../types/musicTypes'
import { createEmptyScore } from '../utils/scoreUtils'

interface UseScoreEditorProps {
  initialScore?: Score
}

export const useScoreEditor = ({ initialScore }: UseScoreEditorProps = {}) => {
  const [score, setScore] = useState<Score>(initialScore || createEmptyScore())
  const [mode, setMode] = useState<CompositionMode>('select')
  const [selection, setSelection] = useState<SelectionInfo>({ type: 'none' })
  const [history, setHistory] = useState<Score[]>([score])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add to history
  const addToHistory = useCallback((newScore: Score) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newScore])
    setHistoryIndex((prev) => prev + 1)
  }, [historyIndex])

  // Update score
  const updateScore = useCallback(
    (updates: (score: Score) => Score) => {
      const newScore = updates(score)
      setScore(newScore)
      addToHistory(newScore)
    },
    [score, addToHistory],
  )

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setScore(history[newIndex])
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setScore(history[newIndex])
    }
  }, [history, historyIndex])

  // Select element
  const selectElement = useCallback((info: SelectionInfo) => {
    setSelection(info)
  }, [])

  // Deselect
  const deselect = useCallback(() => {
    setSelection({ type: 'none' })
  }, [])

  // Change composition mode
  const changeMode = useCallback((newMode: CompositionMode) => {
    setMode(newMode)
    deselect()
  }, [deselect])

  const resetScore = useCallback((newScore: Score) => {
    setScore(newScore)
    setHistory([newScore])
    setHistoryIndex(0)
    setSelection({ type: 'none' })
  }, [])

  // Computed values
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex])
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length])

  return {
    // State
    score,
    mode,
    selection,
    canUndo,
    canRedo,
    // Actions
    updateScore,
    undo,
    redo,
    changeMode,
    selectElement,
    deselect,
    setScore,
    resetScore,
  }
}
