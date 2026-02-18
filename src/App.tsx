import { useMemo, useState } from 'react'
import qaText from './assets/bbgunqa.txt?raw'
import './App.css'

type QaCard = {
  id: number
  question: string
  answer: 'T' | 'F'
  page: string
}

type TestAnswer = {
  answer: 'T' | 'F'
  isCorrect: boolean
}

const parseQa = (text: string): QaCard[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+?)\s+([TF])\s+([0-9&]+)$/)
      if (!match) {
        return null
      }

      return {
        id: Number(match[1]),
        question: match[2],
        answer: match[3] as 'T' | 'F',
        page: match[4],
      }
    })
    .filter((card): card is QaCard => Boolean(card))
}

const shuffle = (count: number): number[] => {
  const order = Array.from({ length: count }, (_, index) => index)
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

const sampleOrder = (count: number, total: number): number[] => {
  return shuffle(total).slice(0, Math.min(count, total))
}

function App() {
  const cards = useMemo(() => parseQa(qaText), [])
  const [order, setOrder] = useState(() => shuffle(cards.length))
  const [position, setPosition] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [mode, setMode] = useState<'study' | 'test'>('study')
  const [testOrder, setTestOrder] = useState<number[]>([])
  const [testPosition, setTestPosition] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<number, TestAnswer>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<'T' | 'F' | ''>('')
  const [isMissedOpen, setIsMissedOpen] = useState(false)
  const [focusedIds, setFocusedIds] = useState<Set<number>>(new Set())

  const hasCards = cards.length > 0
  const currentIndex = hasCards ? order[position] ?? 0 : 0
  const current = hasCards ? cards[currentIndex] : null
  const progress = hasCards ? ((position + 1) / cards.length) * 100 : 0
  const isFocused = current ? focusedIds.has(current.id) : false

  const testIndex = testOrder[testPosition] ?? 0
  const testCard = hasCards ? cards[testIndex] : null
  const testProgress = testOrder.length
    ? ((testPosition + 1) / testOrder.length) * 100
    : 0

  const reshuffle = () => {
    setOrder(shuffle(cards.length))
    setPosition(0)
    setIsRevealed(false)
  }

  const startTest = () => {
    const orderSample = sampleOrder(25, cards.length)
    setMode('test')
    setTestOrder(orderSample)
    setTestPosition(0)
    setTestAnswers({})
    setSelectedAnswer('')
  }

  const exitTest = () => {
    setMode('study')
    setSelectedAnswer('')
  }

  const nextCard = () => {
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
  }

  const submitTestAnswer = () => {
    if (!testCard || selectedAnswer === '') {
      return
    }

    setTestAnswers((prev) => ({
      ...prev,
      [testCard.id]: {
        answer: selectedAnswer as 'T' | 'F',
        isCorrect: selectedAnswer === testCard.answer,
      },
    }))

    setSelectedAnswer('')
    setTestPosition((prev) => prev + 1)
  }

  const testComplete = mode === 'test' && testPosition >= testOrder.length
  const testScore = testOrder.length
    ? Math.round(
        (Object.values(testAnswers).filter((entry) => entry.isCorrect).length /
          testOrder.length) *
          100,
      )
    : 0

  const missedQuestions = Object.entries(testAnswers)
    .filter(([, entry]) => !entry.isCorrect)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b)

  const missedCards = missedQuestions
    .map((questionId) => cards.find((card) => card.id === questionId))
    .filter((card): card is QaCard => Boolean(card))

  const toggleFocus = () => {
    if (!current) return
    setFocusedIds((prev) => {
      const next = new Set(prev)
      if (next.has(current.id)) {
        next.delete(current.id)
      } else {
        next.add(current.id)
      }
      return next
    })
  }

  const reviewFocused = () => {
    const focusedIndices = cards
      .map((card, index) => (focusedIds.has(card.id) ? index : -1))
      .filter((idx) => idx >= 0)

    if (focusedIndices.length === 0) {
      return
    }

    setOrder(shuffle(focusedIndices.length).map((i) => focusedIndices[i]))
    setPosition(0)
    setIsRevealed(false)
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__eyebrow">
          4-H BB Gun Safety
        </span>
        <h1>Flash Cards</h1>
        <p className="app__subtitle">
          Draw a card, answer True or False, then reveal the study guide page
          number.
        </p>
        <a
          href="/PM-02-BBSG.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="study-guide-link"
        >
          📖 View Study Guide (PDF)
        </a>
      </header>

      <main className="app__main">
        {mode === 'study' && hasCards && current ? (
          <section className="card">
            <div className="card__meta">
              <span>Card {position + 1} of {cards.length}</span>
              <span>Question {current.id} · Page {current.page}</span>
            </div>
            
            <label className="card__focus">
              <input
                type="checkbox"
                checked={isFocused}
                onChange={toggleFocus}
              />
              <span>Mark for focused review</span>
            </label>
            
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            
            <p className="card__question">{current.question}</p>
            
            <div className={`card__answer ${isRevealed ? 'is-revealed' : ''}`}>
              <div className="answer__badge">
                {current.answer === 'T' ? 'True' : 'False'}
              </div>
              <p className="answer__detail">
                Answer: {current.answer} · Study guide page {current.page}
              </p>
            </div>
            
            <div className="card__actions">
              <button
                className="btn btn--ghost"
                type="button"
                onClick={reshuffle}
              >
                Shuffle deck
              </button>
              {focusedIds.size > 0 ? (
                <button 
                  className="btn"
                  type="button" 
                  onClick={reviewFocused}
                >
                  Review {focusedIds.size} card{focusedIds.size > 1 ? 's' : ''}
                </button>
              ) : null}
              <button 
                className="btn"
                type="button" 
                onClick={startTest}
              >
                Start test
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => setIsRevealed((prev) => !prev)}
              >
                {isRevealed ? 'Hide answer' : 'Show answer'}
              </button>
              <button 
                className="btn btn--primary"
                type="button" 
                onClick={nextCard}
              >
                Next card
              </button>
            </div>
          </section>
        ) : null}

        {mode === 'test' && hasCards && testCard && !testComplete ? (
          <section className="card">
            <div className="card__meta">
              <span>Test question {testPosition + 1} of {testOrder.length}</span>
              <span>Question {testCard.id}</span>
            </div>
            
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${testProgress}%` }} />
            </div>
            
            <p className="card__question">{testCard.question}</p>
            
            <div className="test__choices" role="radiogroup" aria-label="Answer">
              <label className="choice">
                <input
                  type="radio"
                  name="answer"
                  value="T"
                  checked={selectedAnswer === 'T'}
                  onChange={() => setSelectedAnswer('T')}
                />
                <span>True</span>
              </label>
              <label className="choice">
                <input
                  type="radio"
                  name="answer"
                  value="F"
                  checked={selectedAnswer === 'F'}
                  onChange={() => setSelectedAnswer('F')}
                />
                <span>False</span>
              </label>
            </div>
            
            <div className="card__actions">
              <button 
                className="btn btn--ghost"
                type="button" 
                onClick={exitTest}
              >
                Exit test
              </button>
              <button
                className="btn btn--primary"
                type="button"
                onClick={submitTestAnswer}
                disabled={selectedAnswer === ''}
              >
                Submit & Next
              </button>
            </div>
          </section>
        ) : null}

        {mode === 'test' && hasCards && testComplete ? (
          <section className="card test__result">
            <h2>Test complete</h2>
            <p className="result__score">Score: {testScore}%</p>
            <p>
              Correct: {Object.values(testAnswers).filter((entry) => entry.isCorrect).length} / {testOrder.length}
            </p>
            {missedQuestions.length > 0 ? (
              <div className="missed">
                <h3>Review missed questions</h3>
                <p>Your missed questions are saved for review.</p>
                <div className="missed__list">
                  {missedQuestions.map((questionId) => (
                    <span key={questionId} className="missed__pill">
                      Q{questionId}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => setIsMissedOpen(true)}
                >
                  Open missed questions
                </button>
              </div>
            ) : (
              <p className="missed">Perfect score - no missed questions.</p>
            )}
            <div className="card__actions">
              <button className="btn btn--ghost" type="button" onClick={exitTest}>
                Back to study
              </button>
              <button className="btn btn--primary" type="button" onClick={startTest}>
                Retake test
              </button>
            </div>
          </section>
        ) : null}

        {!hasCards ? (
          <section className="card card--empty">
            <h2>No cards found</h2>
            <p>Check the BB gun Q&A text file for formatting issues.</p>
          </section>
        ) : null}

        {mode === 'test' && testComplete && isMissedOpen ? (
          <div className="modal" role="dialog" aria-modal="true" aria-label="Missed questions">
            <div className="modal__content">
              <div className="modal__header">
                <h3>Missed questions</h3>
                <button
                  className="modal__close"
                  type="button"
                  onClick={() => setIsMissedOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="modal__body">
                {missedCards.map((card) => (
                  <div key={card.id} className="missed__item">
                    <div className="missed__item-header">
                      Question {card.id} · Page {card.page}
                    </div>
                    <p className="missed__item-question">{card.question}</p>
                    <p className="missed__item-answer">
                      Correct answer: {card.answer === 'T' ? 'True' : 'False'} ({card.answer})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
