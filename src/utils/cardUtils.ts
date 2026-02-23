/**
 * Generic utility functions for card operations
 */

export type Card = {
  id: number
  question: string
  answer: string
  page: string
  [key: string]: any
}

export type TestAnswer = {
  answer: string
  isCorrect: boolean
}

/**
 * Parse card data from delimited text
 * Generic parser that can handle different formats
 */
export const parseCards = <T extends Card>(
  text: string,
  parser: (line: string) => T | null,
): T[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parser)
    .filter((card): card is T => Boolean(card))
}

/**
 * Fisher-Yates shuffle algorithm
 * Returns shuffled indices for any array size
 */
export const shuffle = (count: number): number[] => {
  const order = Array.from({ length: count }, (_, index) => index)
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

/**
 * Get a random sample of indices
 */
export const sampleOrder = (count: number, total: number): number[] => {
  return shuffle(total).slice(0, Math.min(count, total))
}

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, total: number): number => {
  return total > 0 ? ((current + 1) / total) * 100 : 0
}

/**
 * Filter cards by indices
 */
export const filterCardsByIndices = <T extends Card>(
  cards: T[],
  indices: number[],
): T[] => {
  return indices
    .map((idx) => cards[idx])
    .filter((card): card is T => Boolean(card))
}

/**
 * Get missed cards from test answers
 */
export const getMissedCards = <T extends Card>(
  cards: T[],
  testAnswers: Record<number, TestAnswer>,
): T[] => {
  const missedIds = Object.entries(testAnswers)
    .filter(([, entry]) => !entry.isCorrect)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b)

  return missedIds
    .map((questionId) => cards.find((card) => card.id === questionId))
    .filter((card): card is T => Boolean(card))
}

/**
 * Calculate test score
 */
export const calculateTestScore = (
  testAnswers: Record<number, TestAnswer>,
): number => {
  if (Object.keys(testAnswers).length === 0) return 0
  const correctCount = Object.values(testAnswers).filter(
    (entry) => entry.isCorrect,
  ).length
  return Math.round((correctCount / Object.keys(testAnswers).length) * 100)
}

/**
 * Toggle item in a Set
 */
export const toggleInSet = <T>(set: Set<T>, item: T): Set<T> => {
  const newSet = new Set(set)
  if (newSet.has(item)) {
    newSet.delete(item)
  } else {
    newSet.add(item)
  }
  return newSet
}
