import { useMemo, useState } from 'react'
import qaText from './assets/bbgunqa.txt?raw'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

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

function BBCard() {
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
    <div className="min-h-screen flex flex-col py-8 md:py-14 px-4 md:px-6 pb-16 gap-8 md:gap-10">
      <header className="max-w-3xl mx-auto text-center animate-[float-in_700ms_ease_forwards] px-4">
        <span className="inline-flex items-center gap-2 text-sm tracking-[0.22em] uppercase text-ink-muted">
          4-H BB Gun Safety
        </span>
        <h1 className="text-xl md:text-2xl font-display font-bold mt-4 mb-3">Flash Cards</h1>
        <p className="text-[1.05rem] text-ink-muted mb-4">
          Draw a card, answer True or False, then reveal the study guide page
          number.
        </p>
        <a
          href="/PM-02-BBSG.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 py-2.5 px-5 rounded-full bg-black/8 text-ink-strong font-semibold text-[0.95rem] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
        >
          📖 View Study Guide (PDF)
        </a>
      </header>

      <main className="flex-1 flex justify-center items-start px-4 md:px-6">
        {mode === 'study' && hasCards && current ? (
          <Card className="w-full max-w-3xl">
            <div className="flex flex-wrap justify-between gap-3 text-sm text-ink-muted">
              <span>Card {position + 1} of {cards.length}</span>
              <span>Question {current.id} · Page {current.page}</span>
            </div>
            
            <label className="flex items-center gap-2 mt-3 mb-2">
              <Checkbox
                checked={isFocused}
                onCheckedChange={toggleFocus}
              />
              <span className="text-ink-muted text-[0.95rem]">Mark for focused review</span>
            </label>
            
            <Progress value={progress} className="mt-4 mb-8" />
            
            <p className="font-display text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.5] mb-8 md:mb-10 text-ink-strong px-2">
              {current.question}
            </p>
            
            <div className={`grid gap-3 p-6 md:p-7 lg:p-8 rounded-2xl bg-slate-100 border border-dashed border-black/18 transition-all duration-300 ${
              isRevealed ? 'opacity-100 translate-y-0 max-h-[250px]' : 'opacity-0 translate-y-2.5 max-h-0 overflow-hidden p-0'
            }`}>
              <Badge className="max-w-max w-fit">
                {current.answer === 'T' ? 'True' : 'False'}
              </Badge>
              <p style={{margin: 0, fontSize: '1rem', lineHeight: 1.5, color: 'black'}}>
                Answer: {current.answer} · Study guide page {current.page}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-4 mt-10 md:mt-12">
              <Button variant="outline" onClick={reshuffle}>
                Shuffle deck
              </Button>
              {focusedIds.size > 0 ? (
                <Button variant="secondary" onClick={reviewFocused}>
                  Review {focusedIds.size} card{focusedIds.size > 1 ? 's' : ''}
                </Button>
              ) : null}
              <Button variant="secondary" onClick={startTest}>
                Start test
              </Button>
              <Button variant="secondary" onClick={() => setIsRevealed((prev) => !prev)}>
                {isRevealed ? 'Hide answer' : 'Show answer'}
              </Button>
              <Button onClick={nextCard}>
                Next card
              </Button>
            </div>
          </Card>
        ) : null}

        {mode === 'test' && hasCards && testCard && !testComplete ? (
          <Card className="w-full max-w-3xl">
            <div className="flex flex-wrap justify-between gap-3 text-sm text-ink-muted">
              <span>Test question {testPosition + 1} of {testOrder.length}</span>
              <span>Question {testCard.id}</span>
            </div>
            
            <Progress value={testProgress} className="mt-4 mb-6 md:mb-8" />
            
            <p className="font-display text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.5] mb-8 md:mb-10 text-ink-strong px-2">
              {testCard.question}
            </p>
            
            <div className="grid gap-4 mt-6 mb-4" role="radiogroup" aria-label="Answer">
              <label className="flex items-center gap-4 py-5 px-6 rounded-2xl border-2 border-black/16 bg-white/70 cursor-pointer transition-all duration-200 hover:border-pink-500/60 hover:shadow-soft">
                <input
                  type="radio"
                  name="answer"
                  value="T"
                  checked={selectedAnswer === 'T'}
                  onChange={() => setSelectedAnswer('T')}
                  className="accent-pink-500 w-[20px] h-[20px]"
                />
                <span className="text-lg font-medium">True</span>
              </label>
              <label className="flex items-center gap-4 py-5 px-6 rounded-2xl border-2 border-black/16 bg-white/70 cursor-pointer transition-all duration-200 hover:border-pink-500/60 hover:shadow-soft">
                <input
                  type="radio"
                  name="answer"
                  value="F"
                  checked={selectedAnswer === 'F'}
                  onChange={() => setSelectedAnswer('F')}
                  className="accent-pink-500 w-[20px] h-[20px]"
                />
                <span className="text-lg font-medium">False</span>
              </label>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-4 mt-10 md:mt-12">
              <Button variant="outline" onClick={exitTest}>
                Exit test
              </Button>
              <Button onClick={submitTestAnswer} disabled={selectedAnswer === ''}>
                Submit & Next
              </Button>
            </div>
          </Card>
        ) : null}

        {mode === 'test' && hasCards && testComplete ? (
          <Card className="w-full max-w-3xl">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-ink-strong">Test complete</h2>
              <p className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#ff8a5b] to-[#f84371] bg-clip-text text-transparent">
                {testScore}%
              </p>
              <p className="text-lg text-ink-muted mb-8">
                Correct: {Object.values(testAnswers).filter((entry) => entry.isCorrect).length} / {testOrder.length}
              </p>
              
              {missedQuestions.length > 0 ? (
                <div className="mb-8 p-6 md:p-8 lg:p-10 rounded-2xl bg-black/6 border border-black/10">
                  <h3 className="text-lg md:text-xl font-display font-bold mb-4 text-ink-strong">Review missed questions</h3>
                  <p className="text-ink-muted mb-5 leading-relaxed text-base">Your missed questions are saved for review.</p>
                  <div className="flex flex-wrap gap-2.5 mb-5">
                    {missedQuestions.map((questionId) => (
                      <Badge key={questionId} className="max-w-max w-fit">
                        Q{questionId}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="secondary" onClick={() => setIsMissedOpen(true)}>
                    Open missed questions
                  </Button>
                </div>
              ) : (
                <p className="mb-8 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 leading-relaxed text-base">
                  Perfect score - no missed questions! 🎉
                </p>
              )}
              
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Button variant="outline" onClick={exitTest}>
                  Back to study
                </Button>
                <Button onClick={startTest}>
                  Retake test
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!hasCards ? (
          <Card className="w-full max-w-3xl">
              <div className="text-center">
              <h2 className="text-xl md:text-2xl font-display font-bold mb-4 text-ink-strong">No cards found</h2>
              <p className="text-ink-muted">Check the BB gun Q&A text file for formatting issues.</p>
            </div>
          </Card>
        ) : null}

        {mode === 'test' && testComplete && isMissedOpen ? (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50" 
            role="dialog" 
            aria-modal="true" 
            aria-label="Missed questions"
          >
            <div className="bg-white rounded-[20px] md:rounded-[28px] p-8 md:p-10 lg:p-12 max-w-3xl w-full max-h-[85vh] overflow-auto shadow-2xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h3 className="text-lg md:text-xl font-display font-bold text-ink-strong">Missed questions</h3>
                <Button variant="secondary" size="sm" onClick={() => setIsMissedOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="grid gap-5">
                {missedCards.map((card) => (
                  <div key={card.id} className="p-5 md:p-6 lg:p-8 rounded-2xl bg-black/6 border border-black/10">
                    <div className="text-sm text-ink-muted mb-3">
                      Question {card.id} · Page {card.page}
                    </div>
                    <p className="font-display text-lg mb-3 text-ink-strong">{card.question}</p>
                    <p className="text-ink-muted">
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

export default BBCard
