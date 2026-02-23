import { useState } from 'react'
import type { Note, Rest, KeySignature } from '../types/musicTypes'
import { getAvailableBeatPositions } from '../utils/noteInputUtils'
import { renderKeySignatureAccidentals } from '../utils/keySignatureUtils'

interface StaffViewProps {
  staffId: string
  staffName: string
  clef: 'treble' | 'bass' | 'alto' | 'tenor'
  measures: Array<{
    id: string
    number: number
    content: (Note | Rest)[]
    timeSignature?: { numerator: number; denominator: number }
    keySignature?: KeySignature
  }>
  selectedElementId?: string
  selectedDuration?: string
  mode?: 'select' | 'note' | 'rest' | 'edit'
  playingNoteIds?: Set<string>
  onSelectElement?: (elementId: string, measureId: string) => void
  onAddNoteAtMeasure?: (staffId: string, measureId: string, beat: number) => void
}

const STAFF_LINE_HEIGHT = 8
const STAFF_LINE_GAP = STAFF_LINE_HEIGHT * 2
const STAFF_TOP_Y = STAFF_LINE_HEIGHT * 2
const STAFF_MIDDLE_LINE_Y = STAFF_TOP_Y + STAFF_LINE_GAP * 2
const NOTE_HEAD_RX = 7
const NOTE_HEAD_RY = 5
const STEM_LENGTH = STAFF_LINE_HEIGHT * 3.5
const LEDGER_LINE_LENGTH = 18

/**
 * Calculate Y position for a MIDI note on a staff
 * For treble clef: top line is F5 (77), middle line is B3 (59)
 */
const getNoteYPosition = (midiPitch: number, clef: string): number => {
  let baseLineY: number
  let basePitch: number

  // Define the pitch at the middle line for each clef
  if (clef === 'treble') {
    basePitch = 59 // B3 on middle line
    baseLineY = STAFF_TOP_Y + STAFF_LINE_HEIGHT * 4
  } else if (clef === 'bass') {
    basePitch = 45 // D2 on middle line
    baseLineY = STAFF_TOP_Y + STAFF_LINE_HEIGHT * 4
  } else if (clef === 'alto') {
    basePitch = 48 // C3 on middle line
    baseLineY = STAFF_TOP_Y + STAFF_LINE_HEIGHT * 4
  } else {
    // tenor clef
    basePitch = 50 // D3 on middle line
    baseLineY = STAFF_TOP_Y + STAFF_LINE_HEIGHT * 4
  }

  // Each semitone is half a line (STAFF_LINE_HEIGHT / 2)
  // Pitch increases = Y decreases (higher notes go up)
  const semitoneOffset = (basePitch - midiPitch) * (STAFF_LINE_HEIGHT / 2)
  return baseLineY + semitoneOffset
}

const getLedgerLineYs = (noteY: number): number[] => {
  const topLineY = STAFF_TOP_Y
  const bottomLineY = STAFF_TOP_Y + STAFF_LINE_GAP * 4
  const lineStep = STAFF_LINE_GAP
  const ledgerYs: number[] = []

  if (noteY <= topLineY - STAFF_LINE_HEIGHT) {
    for (let y = topLineY - lineStep; y >= noteY - STAFF_LINE_HEIGHT; y -= lineStep) {
      ledgerYs.push(y)
    }
  } else if (noteY >= bottomLineY + STAFF_LINE_HEIGHT) {
    for (let y = bottomLineY + lineStep; y <= noteY + STAFF_LINE_HEIGHT; y += lineStep) {
      ledgerYs.push(y)
    }
  }

  return ledgerYs
}

export function StaffView({
  staffId,
  staffName,
  clef,
  measures,
  selectedElementId,
  selectedDuration = 'quarter',
  mode = 'select',
  playingNoteIds = new Set(),
  onSelectElement,
  onAddNoteAtMeasure,
}: StaffViewProps) {
  const [hoveredMeasureId, setHoveredMeasureId] = useState<string | null>(null)

  const handleMeasureClick = (measureId: string, beat: number) => {
    if (mode === 'note' || mode === 'rest') {
      onAddNoteAtMeasure?.(staffId, measureId, beat)
    }
  }

  const getMeasureXOffset = (measureIndex: number) => 80 + measureIndex * 200

  return (
    <div className="staff-view">
      <div className="staff-label">{staffName}</div>
      <svg
        className="staff-lines"
        width="100%"
        height={STAFF_LINE_HEIGHT * 10}
        viewBox={`0 0 1200 ${STAFF_LINE_HEIGHT * 10}`}
      >
        {/* Draw 5 staff lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`line-${i}`}
            x1="0"
            y1={STAFF_LINE_HEIGHT * (2 + i * 2)}
            x2="100%"
            y2={STAFF_LINE_HEIGHT * (2 + i * 2)}
            stroke="black"
            strokeWidth="1"
          />
        ))}

        {/* Clef symbol (simplified) */}
        <text x="20" y={STAFF_LINE_HEIGHT * 6} fontSize="24" fontWeight="bold">
          {clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : clef === 'alto' ? '𝄡' : '𝄡'}
        </text>

        {/* Time signature (before first measure) */}
        {measures.length > 0 && (
          <g key="time-signature">
            <text
              x="50"
              y={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 2}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {(measures[0].timeSignature || { numerator: 4, denominator: 4 }).numerator}
            </text>
            <text
              x="50"
              y={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 5}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {(measures[0].timeSignature || { numerator: 4, denominator: 4 }).denominator}
            </text>
          </g>
        )}

        {/* Key signature (before first measure) */}
        {measures.length > 0 && measures[0].keySignature && (
          <g key="key-signature">
            {renderKeySignatureAccidentals(measures[0].keySignature, 60, STAFF_TOP_Y, STAFF_LINE_HEIGHT).map(
              (accidental, idx) => (
                <text
                  key={`accidental-${idx}`}
                  x={accidental.x}
                  y={accidental.y}
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {accidental.symbol}
                </text>
              ),
            )}
          </g>
        )}

        {/* Render measures */}
        {measures.map((measure, measureIndex) => {
          const xOffset = getMeasureXOffset(measureIndex)
          const isHovered = hoveredMeasureId === measure.id
          const timeSignature = measure.timeSignature || { numerator: 4, denominator: 4 }
          const availableBeats = getAvailableBeatPositions(
            {
              ...measure,
              timeSignature,
              content: measure.content,
              number: measure.number,
              keySignature: { sharpsFlats: 0, isMinor: false },
              id: measure.id,
            } as any,
            selectedDuration,
          )

          return (
            <g
              key={measure.id}
              className={`measure ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredMeasureId(measure.id)}
              onMouseLeave={() => setHoveredMeasureId(null)}
            >
              {/* Measure background (for clickable area in note mode) */}
              {(mode === 'note' || mode === 'rest') && (
                <rect
                  x={xOffset}
                  y={STAFF_TOP_Y}
                  width="180"
                  height={STAFF_LINE_HEIGHT * 8}
                  fill="transparent"
                  className="measure-clickzone"
                />
              )}

              {/* Measure number */}
              <text x={xOffset + 10} y={STAFF_LINE_HEIGHT * 12} fontSize="12">
                {measure.number}
              </text>

              {/* Available beat position indicators (in note mode) */}
              {(mode === 'note' || mode === 'rest') &&
                isHovered &&
                availableBeats.map((beat) => {
                  const beatXOffset = xOffset + 30 + (beat / timeSignature.numerator) * 120
                  return (
                    <g key={`beat-${beat}`}>
                      {/* Vertical guideline */}
                      <line
                        x1={beatXOffset}
                        y1={STAFF_TOP_Y}
                        x2={beatXOffset}
                        y2={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 8}
                        stroke="blue"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.5"
                      />
                      {/* Click target circle */}
                      <circle
                        cx={beatXOffset}
                        cy={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 4}
                        r="8"
                        fill="blue"
                        opacity="0.3"
                        className="beat-target"
                        onClick={() => handleMeasureClick(measure.id, beat)}
                        style={{ cursor: 'pointer' }}
                      />
                    </g>
                  )
                })}

              {/* Render notes and rests */}
              {measure.content.map((item) => {
                const isNote = 'pitch' in item
                // Calculate X position based on beat position within the measure
                const beatXOffset = xOffset + 30 + (item.startTime / timeSignature.numerator) * 120
                // Calculate Y position based on pitch
                const noteY = isNote ? getNoteYPosition((item as Note).pitch, clef) : STAFF_TOP_Y + STAFF_LINE_HEIGHT * 5
                const ledgerLineYs = isNote ? getLedgerLineYs(noteY) : []

                // Determine note head appearance based on duration
                const note = item as Note
                const isHollow = isNote && (note.duration === 'whole' || note.duration === 'half')
                const hasStem = isNote && note.duration !== 'whole'
                const flagCount = 
                  isNote && note.duration === 'eighth' ? 1 :
                  isNote && note.duration === 'sixteenth' ? 2 :
                  isNote && note.duration === 'thirtysecond' ? 3 :
                  0

                const isPlaying = playingNoteIds.has(item.id)
                const stemUp = isNote ? noteY > STAFF_MIDDLE_LINE_Y : true
                const stemX = stemUp ? beatXOffset + NOTE_HEAD_RX - 1 : beatXOffset - NOTE_HEAD_RX + 1
                const stemY1 = noteY
                const stemY2 = stemUp ? noteY - STEM_LENGTH : noteY + STEM_LENGTH

                return (
                  <g
                    key={item.id}
                    className={`element ${selectedElementId === item.id ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (mode === 'select') {
                        onSelectElement?.(item.id, measure.id)
                      }
                    }}
                    style={{ cursor: mode === 'select' ? 'pointer' : 'default' }}
                  >
                    {isNote ? (
                      <>
                        {/* Highlight glow when note is playing */}
                        {isPlaying && (
                          <circle
                            cx={beatXOffset}
                            cy={noteY}
                            r="12"
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="2"
                            opacity="0.8"
                            style={{
                              filter: 'drop-shadow(0 0 4px #FFD700)',
                              animation: 'pulse 0.6s ease-in-out infinite',
                            }}
                          />
                        )}
                        
                        {/* Ledger lines for notes outside staff */}
                        {ledgerLineYs.map((y) => (
                          <line
                            key={`ledger-${item.id}-${y}`}
                            x1={beatXOffset - LEDGER_LINE_LENGTH / 2}
                            y1={y}
                            x2={beatXOffset + LEDGER_LINE_LENGTH / 2}
                            y2={y}
                            stroke="black"
                            strokeWidth="1.2"
                          />
                        ))}

                        {/* Note head - hollow for whole/half, filled for others */}
                        <ellipse
                          cx={beatXOffset}
                          cy={noteY}
                          rx={NOTE_HEAD_RX}
                          ry={NOTE_HEAD_RY}
                          fill={isHollow ? 'white' : 'black'}
                          stroke="black"
                          strokeWidth={isHollow ? '1.5' : '0'}
                          transform={`rotate(-20 ${beatXOffset} ${noteY})`}
                        />
                        
                        {/* Stem */}
                        {hasStem && (
                          <line
                            x1={stemX}
                            y1={stemY1}
                            x2={stemX}
                            y2={stemY2}
                            stroke="black"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        )}

                        {/* Flags for eighth notes and shorter */}
                        {flagCount > 0 && (
                          <>
                            {Array.from({ length: flagCount }).map((_, flagIdx) => {
                              const flagOffset = flagIdx * 6
                              const flagY = stemUp ? stemY2 + flagOffset : stemY2 - flagOffset
                              const flagPath = stemUp
                                ? `M ${stemX} ${flagY} Q ${stemX + 12} ${flagY + 4} ${stemX + 4} ${flagY + 10}`
                                : `M ${stemX} ${flagY} Q ${stemX - 12} ${flagY - 4} ${stemX - 4} ${flagY - 10}`

                              return (
                                <path
                                  key={`flag-${flagIdx}`}
                                  d={flagPath}
                                  stroke="black"
                                  strokeWidth="1.4"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  pathLength={1}
                                  strokeDasharray={1}
                                  strokeDashoffset={0}
                                  strokeMiterlimit={2}
                                  strokeOpacity={1}
                                />
                              )
                            })}
                          </>
                        )}

                        {/* Accidental symbol if present */}
                        {note.accidental && (
                          <text
                            x={beatXOffset - 16}
                            y={noteY + 4}
                            fontSize="13"
                            fontWeight="600"
                          >
                            {note.accidental === 'sharp'
                              ? '♯'
                              : note.accidental === 'flat'
                                ? '♭'
                                : '♮'}
                          </text>
                        )}
                      </>
                    ) : (
                      /* Rest symbol (simplified) */
                      <text x={beatXOffset} y={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 5} fontSize="16">
                        𝄽
                      </text>
                    )}

                    {/* Selection highlight */}
                    {selectedElementId === item.id && (
                      <rect
                        x={beatXOffset - 10}
                        y={STAFF_TOP_Y}
                        width="20"
                        height={STAFF_LINE_HEIGHT * 8}
                        fill="none"
                        stroke="blue"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                    )}
                  </g>
                )
              })}

              {/* Measure boundary line */}
              <line
                x1={xOffset}
                y1={STAFF_TOP_Y}
                x2={xOffset}
                y2={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 8}
                stroke="black"
                strokeWidth="1"
              />

              {/* Measure end line */}
              <line
                x1={xOffset + 180}
                y1={STAFF_TOP_Y}
                x2={xOffset + 180}
                y2={STAFF_TOP_Y + STAFF_LINE_HEIGHT * 8}
                stroke="black"
                strokeWidth="1"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
