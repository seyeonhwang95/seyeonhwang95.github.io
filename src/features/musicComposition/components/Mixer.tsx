
import type { Instrument } from '../types/musicTypes'

interface MixerProps {
  instruments: Instrument[]
  onUpdateInstrument: (instrumentId: string, updates: Partial<Instrument>) => void
}

export function Mixer({ instruments, onUpdateInstrument }: MixerProps) {
  return (
    <div className="mixer-panel">
      <h3>Mixer</h3>
      <div className="mixer-tracks">
        {instruments.map((instrument) => (
          <div key={instrument.id} className="mixer-track">
            <div className="track-name">{instrument.name}</div>

            <div className="volume-control">
              <label>Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={instrument.volume}
                onChange={(e) =>
                  onUpdateInstrument(instrument.id, {
                    volume: Number(e.target.value),
                  })
                }
              />
              <span className="value">{instrument.volume}%</span>
            </div>

            <div className="pan-control">
              <label>Pan</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={instrument.pan}
                onChange={(e) =>
                  onUpdateInstrument(instrument.id, {
                    pan: Number(e.target.value),
                  })
                }
              />
              <span className="value">{instrument.pan > 0 ? 'R' : 'L'}</span>
            </div>

            <div className="mute-control">
              <label>
                <input
                  type="checkbox"
                  checked={instrument.muted}
                  onChange={(e) =>
                    onUpdateInstrument(instrument.id, {
                      muted: e.target.checked,
                    })
                  }
                />
                Mute
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
