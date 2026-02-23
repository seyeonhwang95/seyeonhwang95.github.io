import { useState, useCallback, useMemo } from 'react'
import type { Card } from '@/utils/cardUtils'
import {
  shuffle,
  toggleInSet,
} from '@/utils/cardUtils'

interface UseStudyModeProps {
  cards: Card[]
}

export const useStudyMode = ({ cards }: UseStudyModeProps) => {
  const [order, setOrder] = useState(() => shuffle(cards.length))
  const [position, setPosition] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [focusedIds, setFocusedIds] = useState<Set<number>>(new Set())

  const currentIndex = useMemo(
    () => (cards.length > 0 ? order[position] ?? 0 : 0),
    [cards.length, order, position],
  )

  const current = useMemo(
    () => (cards.length > 0 ? cards[currentIndex] : null),
    [cards, currentIndex],
  )

  const progress = useMemo(
    () => (cards.length > 0 ? ((position + 1) / cards.length) * 100 : 0),
    [cards.length, position],
  )

  const isFocused = useMemo(
    () => (current ? focusedIds.has(current.id) : false),
    [current, focusedIds],
  )

  const reshuffle = useCallback(() => {
    setOrder(shuffle(cards.length))
    setPosition(0)
    setIsRevealed(false)
  }, [cards.length])

  const nextCard = useCallback(() => {
    setIsRevealed(false)
    setPosition((prev) => {
      const next = prev + 1
      if (next >= order.length) {
        const newOrder = shuffle(cards.length)
        setOrder(newOrder)
        return 0
      }
      return next
    })
  }, [cards.length, order.length])

  const toggleFocus = useCallback(() => {
    if (!current) return
    setFocusedIds((prev) => toggleInSet(prev, current.id))
  }, [current])

  const reviewFocused = useCallback(() => {
    const focusedIndices = cards
      .map((card, index) => (focusedIds.has(card.id) ? index : -1))
      .filter((idx) => idx >= 0)

    if (focusedIndices.length === 0) {
      return
    }

    setOrder(shuffle(focusedIndices.length).map((i) => focusedIndices[i]))
    setPosition(0)
    setIsRevealed(false)
  }, [cards, focusedIds])

  return {
    // State
    order,
    position,
    isRevealed,
    focusedIds,
    // Computed
    current,
    progress,
    isFocused,
    hasCards: cards.length > 0,
    // Actions
    setIsRevealed,
    reshuffle,
    nextCard,
    toggleFocus,
    reviewFocused,
  }
}
