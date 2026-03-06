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
  onStartTest?: () => void
  onReviewFocused: () => void
  showTestButton?: boolean
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
  showTestButton = true,
}: StudyCardProps) {
  if (!card) return null

  const handleCardClick = () => {
    onToggleReveal(!isRevealed)
  }

  const answerBadge = card.answer === 'T' ? 'True' : card.answer === 'F' ? 'False' : 'Answer'
  const answerDetail = card.answer === 'T' || card.answer === 'F'
    ? `Answer: ${card.answer}`
    : card.answer

  return (
    <section className="card">
      <div className="card__meta">
        <span>
          Card {position + 1} of {totalCards}
        </span>
        <span>
          Question {card.id}
          {card.category ? ` · ${card.category}` : ''}
          {card.page ? ` · ${card.page}` : ''}
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

      <div
        className={`card__flipper ${isRevealed ? 'is-flipped' : ''}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
      >
        <div className="card__face card__front">
          <p className="card__question">{card.question}</p>
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={`Flashcard reference for question ${card.id}`}
              className="card__image"
              loading="lazy"
            />
          ) : null}
          <div className="card__hint">Click to reveal answer</div>
        </div>

        <div className="card__face card__back">
          <div className="card__answer">
            <div className="answer__badge">{answerBadge}</div>
            <p className="answer__detail">{answerDetail}</p>
            {card.category ? (
              <p className="answer__detail">Category: {card.category}</p>
            ) : null}
            {card.page ? (
              <p className="answer__detail">Page: {card.page}</p>
            ) : null}
            {card.source ? (
              <a
                href={card.source}
                target="_blank"
                rel="noopener noreferrer"
                className="answer__source"
              >
                Source reference
              </a>
            ) : null}
          </div>
          <div className="card__hint">Click to hide answer</div>
        </div>
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
        {showTestButton && onStartTest ? (
          <button className="btn" type="button" onClick={onStartTest}>
            Start test
          </button>
        ) : null}

        <button className="btn btn--primary" type="button" onClick={onNextCard}>
          Next card
        </button>
      </div>
    </section>
  )
}
