import type { Card } from '@/utils/cardUtils'

interface StudyCardProps {
  card: Card | null
  position: number
  totalCards: number
  progress: number
  isRevealed: boolean
  isFocused: boolean
  focusedCount: number
  onToggleFocus: () => void
  onReshuffle: () => void
  onToggleReveal: (revealed: boolean) => void
  onNextCard: () => void
  onStartTest: () => void
  onReviewFocused: () => void
}

export function StudyCard({
  card,
  position,
  totalCards,
  progress,
  isRevealed,
  isFocused,
  focusedCount,
  onToggleFocus,
  onReshuffle,
  onToggleReveal,
  onNextCard,
  onStartTest,
  onReviewFocused,
}: StudyCardProps) {
  if (!card) return null

  return (
    <section className="card">
      <div className="card__meta">
        <span>
          Card {position + 1} of {totalCards}
        </span>
        <span>
          Question {card.id} · Page {card.page}
        </span>
      </div>

      <label className="card__focus">
        <input
          type="checkbox"
          checked={isFocused}
          onChange={onToggleFocus}
        />
        <span>Mark for focused review</span>
      </label>

      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <p className="card__question">{card.question}</p>

      <div className={`card__answer ${isRevealed ? 'is-revealed' : ''}`}>
        <div className="answer__badge">
          {card.answer === 'T' ? 'True' : 'False'}
        </div>
        <p className="answer__detail">
          Answer: {card.answer} · Study guide page {card.page}
        </p>
      </div>

      <div className="card__actions">
        <button
          className="btn btn--ghost"
          type="button"
          onClick={onReshuffle}
        >
          Shuffle deck
        </button>
        {focusedCount > 0 ? (
          <button className="btn" type="button" onClick={onReviewFocused}>
            Review {focusedCount} card{focusedCount > 1 ? 's' : ''}
          </button>
        ) : null}
        <button className="btn" type="button" onClick={onStartTest}>
          Start test
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => onToggleReveal(!isRevealed)}
        >
          {isRevealed ? 'Hide answer' : 'Show answer'}
        </button>
        <button className="btn btn--primary" type="button" onClick={onNextCard}>
          Next card
        </button>
      </div>
    </section>
  )
}
