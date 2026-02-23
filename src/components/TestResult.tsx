import type { Card } from '@/utils/cardUtils'

interface TestResultProps {
  score: number
  correctCount: number
  totalQuestions: number
  missedCards: Card[]
  isMissedOpen: boolean
  onOpenMissed: () => void
  onCloseMissed: () => void
  onBackToStudy: () => void
  onRetakeTest: () => void
}

export function TestResult({
  score,
  correctCount,
  totalQuestions,
  missedCards,
  isMissedOpen,
  onOpenMissed,
  onCloseMissed,
  onBackToStudy,
  onRetakeTest,
}: TestResultProps) {
  const missedQuestionIds = missedCards.map((card) => card.id)

  return (
    <>
      <section className="card test__result">
        <h2>Test complete</h2>
        <p className="result__score">Score: {score}%</p>
        <p>
          Correct: {correctCount} / {totalQuestions}
        </p>
        {missedCards.length > 0 ? (
          <div className="missed">
            <h3>Review missed questions</h3>
            <p>Your missed questions are saved for review.</p>
            <div className="missed__list">
              {missedQuestionIds.map((questionId) => (
                <span key={questionId} className="missed__pill">
                  Q{questionId}
                </span>
              ))}
            </div>
            <button
              className="btn btn--primary"
              type="button"
              onClick={onOpenMissed}
            >
              Open missed questions
            </button>
          </div>
        ) : (
          <p className="missed">Perfect score - no missed questions.</p>
        )}
        <div className="card__actions">
          <button
            className="btn btn--ghost"
            type="button"
            onClick={onBackToStudy}
          >
            Back to study
          </button>
          <button className="btn btn--primary" type="button" onClick={onRetakeTest}>
            Retake test
          </button>
        </div>
      </section>

      {isMissedOpen ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Missed questions"
        >
          <div className="modal__content">
            <div className="modal__header">
              <h3>Missed questions</h3>
              <button
                className="modal__close"
                type="button"
                onClick={onCloseMissed}
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
    </>
  )
}
