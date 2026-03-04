import { useState, useCallback, useMemo } from 'react'
import type { Card, TestAnswer } from '@/utils/cardUtils'
import { sampleOrder, getMissedCards, calculateTestScore } from '@/utils/cardUtils'

type TestMode = 'boolean' | 'multiple-choice'

interface UseTestModeProps {
  cards: Card[]
  testSize?: number
  mode?: TestMode
  choiceCount?: number
  minPreferredCount?: number
  preferredCardFilter?: (card: Card) => boolean
}

const shuffleValues = <T>(values: T[]): T[] => {
  const next = [...values]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export const useTestMode = ({
  cards,
  testSize = 25,
  mode = 'boolean',
  choiceCount = 4,
  minPreferredCount = 0,
  preferredCardFilter,
}: UseTestModeProps) => {
  const [testOrder, setTestOrder] = useState<number[]>([])
  const [testPosition, setTestPosition] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<number, TestAnswer>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [testChoices, setTestChoices] = useState<Record<number, string[]>>({})
  const [isMissedOpen, setIsMissedOpen] = useState(false)

  const uniqueAnswers = useMemo(
    () =>
      Array.from(
        new Set(
          cards
            .map((card) => String(card.answer ?? '').trim())
            .filter(Boolean),
        ),
      ),
    [cards],
  )

  const testIndex = useMemo(
    () => testOrder[testPosition] ?? 0,
    [testOrder, testPosition],
  )

  const testCard = useMemo(
    () => (cards.length > 0 ? cards[testIndex] : null),
    [cards, testIndex],
  )

  const currentChoices = useMemo(() => {
    if (!testCard) return []
    return testChoices[testCard.id] ?? []
  }, [testCard, testChoices])

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
    let orderSample = sampleOrder(testSize, cards.length)

    if (preferredCardFilter && minPreferredCount > 0) {
      const preferredPool = cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => preferredCardFilter(card))
        .map(({ index }) => index)

      const requiredCount = Math.min(minPreferredCount, testSize, preferredPool.length)

      if (requiredCount > 0) {
        const selectedPreferred = shuffleValues(preferredPool).slice(0, requiredCount)
        const selectedPreferredSet = new Set(selectedPreferred)

        const remainingPool = cards
          .map((_, index) => index)
          .filter((index) => !selectedPreferredSet.has(index))

        const remainingCount = Math.max(0, testSize - selectedPreferred.length)
        const selectedRemaining = shuffleValues(remainingPool).slice(0, remainingCount)

        orderSample = shuffleValues([...selectedPreferred, ...selectedRemaining])
      }
    }

    const nextChoices: Record<number, string[]> = {}

    if (mode === 'multiple-choice') {
      orderSample.forEach((cardIndex) => {
        const card = cards[cardIndex]
        if (!card) return

        const correctAnswer = String(card.answer)
        const distractors = shuffleValues(
          uniqueAnswers.filter((answer) => answer !== correctAnswer),
        ).slice(0, Math.max(1, choiceCount - 1))

        nextChoices[card.id] = shuffleValues([correctAnswer, ...distractors])
      })
    }

    setTestOrder(orderSample)
    setTestPosition(0)
    setTestAnswers({})
    setSelectedAnswer('')
    setTestChoices(nextChoices)
  }, [
    cards,
    choiceCount,
    minPreferredCount,
    mode,
    preferredCardFilter,
    testSize,
    uniqueAnswers,
  ])

  const exitTest = useCallback(() => {
    setTestOrder([])
    setTestPosition(0)
    setTestAnswers({})
    setSelectedAnswer('')
    setTestChoices({})
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
    currentChoices,
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
