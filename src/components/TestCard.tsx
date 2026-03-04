import type { Card } from '@/utils/cardUtils'

interface TestCardProps {
  card: Card | null
  position: number
  totalQuestions: number
  progress: number
  choices?: string[]
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
  choices,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  onExit,
}: TestCardProps) {
  if (!card) return null

  const optionValues = choices && choices.length > 0 ? choices : ['T', 'F']

  const labelForChoice = (choice: string) => {
    if (choice === 'T') return 'True (T)'
    if (choice === 'F') return 'False (F)'
    return choice
  }

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

      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={`Test reference for question ${card.id}`}
          className="card__image"
          loading="lazy"
        />
      ) : null}

      <div className="test__choices" role="radiogroup" aria-label="Answer">
        {optionValues.map((choice) => (
          <label key={choice} className="choice">
            <input
              type="radio"
              name="answer"
              value={choice}
              checked={selectedAnswer === choice}
              onChange={() => onSelectAnswer(choice)}
            />
            <span>{labelForChoice(choice)}</span>
          </label>
        ))}
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
