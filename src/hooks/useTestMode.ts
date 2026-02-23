import { useState, useCallback, useMemo } from 'react'
import type { Card, TestAnswer } from '@/utils/cardUtils'
import { sampleOrder, getMissedCards, calculateTestScore } from '@/utils/cardUtils'

interface UseTestModeProps {
  cards: Card[]
  testSize?: number
}

export const useTestMode = ({ cards, testSize = 25 }: UseTestModeProps) => {
  const [testOrder, setTestOrder] = useState<number[]>([])
  const [testPosition, setTestPosition] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<number, TestAnswer>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [isMissedOpen, setIsMissedOpen] = useState(false)

  const testIndex = useMemo(
    () => testOrder[testPosition] ?? 0,
    [testOrder, testPosition],
  )

  const testCard = useMemo(
    () => (cards.length > 0 ? cards[testIndex] : null),
    [cards, testIndex],
  )

  const testProgress = useMemo(
    () => (testOrder.length ? ((testPosition + 1) / testOrder.length) * 100 : 0),
    [testOrder.length, testPosition],
  )

  const testComplete = useMemo(
    () => testPosition >= testOrder.length && testOrder.length > 0,
    [testPosition, testOrder.length],
  )

  const testScore = useMemo(
    () => calculateTestScore(testAnswers),
    [testAnswers],
  )

  const missedCards = useMemo(
    () => getMissedCards(cards, testAnswers),
    [cards, testAnswers],
  )

  const correctCount = useMemo(
    () =>
      Object.values(testAnswers).filter((entry) => entry.isCorrect).length,
    [testAnswers],
  )

  const startTest = useCallback(() => {
    const orderSample = sampleOrder(testSize, cards.length)
    setTestOrder(orderSample)
    setTestPosition(0)
    setTestAnswers({})
    setSelectedAnswer('')
  }, [cards.length, testSize])

  const exitTest = useCallback(() => {
    setTestOrder([])
    setTestPosition(0)
    setTestAnswers({})
    setSelectedAnswer('')
    setIsMissedOpen(false)
  }, [])

  const submitTestAnswer = useCallback(() => {
    if (!testCard || selectedAnswer === '') {
      return
    }

    setTestAnswers((prev) => ({
      ...prev,
      [testCard.id]: {
        answer: selectedAnswer, 
        isCorrect: selectedAnswer === testCard.answer,
      },
    }))

    setSelectedAnswer('')
    setTestPosition((prev) => prev + 1)
  }, [testCard, selectedAnswer])

  return {
    // State
    testOrder,
    testPosition,
    testAnswers,
    selectedAnswer,
    isMissedOpen,
    // Computed
    testCard,
    testProgress,
    testComplete,
    testScore,
    missedCards,
    correctCount,
    hasTestStarted: testOrder.length > 0,
    // Actions
    setSelectedAnswer,
    setIsMissedOpen,
    startTest,
    exitTest,
    submitTestAnswer,
  }
}
