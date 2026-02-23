import type { Card } from '@/utils/cardUtils'

interface TestCardProps {
  card: Card | null
  position: number
  totalQuestions: number
  progress: number
  selectedAnswer: string
  onSelectAnswer: (answer: string) => void
  onSubmit: () => void
  onExit: () => void
}

export function TestCard({
  card,
  position,
  totalQuestions,
  progress,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  onExit,
}: TestCardProps) {
  if (!card) return null

  return (
    <section className="card">
      <div className="card__meta">
        <span>
          Test question {position + 1} of {totalQuestions}
        </span>
        <span>Question {card.id}</span>
      </div>

      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <p className="card__question">{card.question}</p>

      <div className="test__choices" role="radiogroup" aria-label="Answer">
        <label className="choice">
          <input
            type="radio"
            name="answer"
            value="T"
            checked={selectedAnswer === 'T'}
            onChange={() => onSelectAnswer('T')}
          />
          <span>True</span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name="answer"
            value="F"
            checked={selectedAnswer === 'F'}
            onChange={() => onSelectAnswer('F')}
          />
          <span>False</span>
        </label>
      </div>

      <div className="card__actions">
        <button
          className="btn btn--primary"
          type="button"
          onClick={onSubmit}
          disabled={selectedAnswer === ''}
        >
          Submit & Next
        </button>
        <button className="btn btn--ghost" type="button" onClick={onExit}>
          Exit test
        </button>
      </div>
    </section>
  )
}
