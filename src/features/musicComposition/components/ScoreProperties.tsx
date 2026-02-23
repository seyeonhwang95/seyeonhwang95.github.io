import type { Score } from '../types/musicTypes'
import { getAllKeys, getKeyName, getKeySignature } from '../utils/keySignatureUtils'

interface ScorePropertiesProps {
  score: Score
  onUpdateScore: (updates: Partial<Score>) => void
}

export function ScoreProperties({ score, onUpdateScore }: ScorePropertiesProps) {
  return (
    <div className="score-properties-panel">
      <h3>Score Properties</h3>
      
      <div className="property-group">
        <label>Title</label>
        <input
          type="text"
          value={score.title}
          onChange={(e) => onUpdateScore({ title: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Subtitle</label>
        <input
          type="text"
          value={score.subtitle || ''}
          onChange={(e) => onUpdateScore({ subtitle: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Composer</label>
        <input
          type="text"
          value={score.composer || ''}
          onChange={(e) => onUpdateScore({ composer: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Lyricist</label>
        <input
          type="text"
          value={score.lyricist || ''}
          onChange={(e) => onUpdateScore({ lyricist: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Copyright</label>
        <input
          type="text"
          value={score.copyright || ''}
          onChange={(e) => onUpdateScore({ copyright: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Tempo (BPM)</label>
        <input
          type="number"
          min="40"
          max="300"
          value={score.tempo}
          onChange={(e) => onUpdateScore({ tempo: Number(e.target.value) })}
        />
      </div>

      <div className="property-group">
        <label>Time Signature</label>
        <div className="time-signature-input">
          <input
            type="number"
            min="1"
            max="12"
            value={score.timeSignature.numerator}
            onChange={(e) =>
              onUpdateScore({
                timeSignature: {
                  ...score.timeSignature,
                  numerator: Number(e.target.value),
                },
              })
            }
          />
          <span>/</span>
          <select
            value={score.timeSignature.denominator}
            onChange={(e) =>
              onUpdateScore({
                timeSignature: {
                  ...score.timeSignature,
                  denominator: Number(e.target.value),
                },
              })
            }
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
          </select>
        </div>
      </div>

      <div className="property-group">
        <label>Key Signature</label>
        <select
          value={getKeyName(score.keySignature) + '_' + (score.keySignature.isMinor ? 'Minor' : 'Major')}
          onChange={(e) => {
            const keyStr = e.target.value
            const isMinor = keyStr.endsWith('_Minor')
            const keyName = keyStr.replace('_Minor', '').replace('_Major', '')
            const newKeySignature = getKeySignature(keyName, isMinor)
            onUpdateScore({
              keySignature: newKeySignature,
            })
          }}
        >
          {getAllKeys().map((key) => (
            <option key={key.name} value={key.name.replace(' ', '_')}>
              {key.name}
            </option>
          ))}
        </select>
      </div>

      <div className="property-group">
        <label>Page Size</label>
        <select
          value={score.metadata.pageSize}
          onChange={(e) =>
            onUpdateScore({
              metadata: {
                ...score.metadata,
                pageSize: e.target.value as 'A4' | 'Letter',
              },
            })
          }
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>
      </div>
    </div>
  )
}
