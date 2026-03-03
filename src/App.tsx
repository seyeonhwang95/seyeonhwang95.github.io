import { useMemo, useState } from 'react'
import qaText from './assets/bbgunqa.txt?raw'
import { TopNavBar } from './components/TopNavBar'
import { StudyCard } from './components/StudyCard'
import { TestCard } from './components/TestCard'
import { TestResult } from './components/TestResult'
import { MusicComposition } from './features/musicComposition/MusicComposition'
import { StockTradingSimulation } from './features/stockTrading/StockTradingSimulation'
import { parseCards } from './utils/cardUtils'
import type { Card } from './utils/cardUtils'
import { useStudyMode } from './hooks/useStudyMode'
import { useTestMode } from './hooks/useTestMode'
import './features/musicComposition/musicComposition.css'
import './App.css'

/**
 * Parse BB Gun Q&A data from text format
 * Format: ID Question Answer Page
 */
const parseBBGunCards = (text: string): Card[] => {
  return parseCards<Card>(text, (line) => {
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
}

/**
 * BB Gun Study App Component
 */
function BBGunStudy() {
  const cards = useMemo(() => parseBBGunCards(qaText), [])

  // Study mode state and logic
  const study = useStudyMode({ cards })

  // Test mode state and logic
  const test = useTestMode({ cards, testSize: 25 })

  // Determine current mode
  const isStudyMode = !test.hasTestStarted
  const isTestMode = test.hasTestStarted && !test.testComplete
  const isTestCompleteMode = test.testComplete

  return (
    <>
      <header className="app__header">
        <span className="app__eyebrow">4-H BB Gun Safety</span>
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
        {/* Study Mode */}
        {isStudyMode && study.hasCards && study.current ? (
          <StudyCard
            card={study.current}
            position={study.position}
            totalCards={cards.length}
            progress={study.progress}
            isRevealed={study.isRevealed}
            isFocused={study.isFocused}
            focusedCount={study.focusedIds.size}
            onToggleFocus={study.toggleFocus}
            onReshuffle={study.reshuffle}
            onToggleReveal={study.setIsRevealed}
            onNextCard={study.nextCard}
            onStartTest={test.startTest}
            onReviewFocused={study.reviewFocused}
          />
        ) : null}

        {/* Test Mode - Question View */}
        {isTestMode && test.testCard ? (
          <TestCard
            card={test.testCard}
            position={test.testPosition}
            totalQuestions={test.testOrder.length}
            progress={test.testProgress}
            selectedAnswer={test.selectedAnswer}
            onSelectAnswer={test.setSelectedAnswer}
            onSubmit={test.submitTestAnswer}
            onExit={test.exitTest}
          />
        ) : null}

        {/* Test Mode - Result View */}
        {isTestCompleteMode ? (
          <TestResult
            score={test.testScore}
            correctCount={test.correctCount}
            totalQuestions={test.testOrder.length}
            missedCards={test.missedCards}
            isMissedOpen={test.isMissedOpen}
            onOpenMissed={() => test.setIsMissedOpen(true)}
            onCloseMissed={() => test.setIsMissedOpen(false)}
        
            onBackToStudy={test.exitTest}
            onRetakeTest={test.startTest}
          />
        ) : null}

        {/* No Cards State */}
        {!study.hasCards ? (
          <section className="card card--empty">
            <h2>No cards found</h2>
            <p>Check the BB gun Q&A text file for formatting issues.</p>
          </section>
        ) : null}
      </main>
    </>
  )
}

/**
 * Main App Component
 */
function App() {
  const [currentApp, setCurrentApp] = useState<'bbgun' | 'music' | 'stock'>('bbgun')

  return (
    <div className="app">
      <TopNavBar currentApp={currentApp} onAppChange={(app) => setCurrentApp(app as 'bbgun' | 'music' | 'stock')} />
      
      {currentApp === 'bbgun' && <BBGunStudy />}
      {currentApp === 'music' && <MusicComposition />}
      {currentApp === 'stock' && <StockTradingSimulation />}
    </div>
  )
}

export default App
