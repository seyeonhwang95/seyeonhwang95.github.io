interface NoteInputBarProps {
  selectedDuration: string
  onDurationChange: (duration: string) => void
  onAccidentalChange: (accidental: 'sharp' | 'flat' | 'natural' | null) => void
  selectedAccidental: 'sharp' | 'flat' | 'natural' | null
}

export function NoteInputBar({
  selectedDuration,
  onDurationChange,
  onAccidentalChange,
  selectedAccidental,
}: NoteInputBarProps) {
  const durations = ['whole', 'half', 'quarter', 'eighth', 'sixteenth']

  return (
    <div className="note-input-bar">
      <div className="toolbar-section">
        <label>Duration:</label>
        <div className="button-group">
          {durations.map((duration) => (
            <button
              key={duration}
              className={`btn ${selectedDuration === duration ? 'active' : ''}`}
              onClick={() => onDurationChange(duration)}
              title={duration}
            >
              {duration[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-section">
        <label>Accidentals:</label>
        <div className="button-group">
          <button
            className={`btn ${selectedAccidental === 'flat' ? 'active' : ''}`}
            onClick={() =>
              onAccidentalChange(selectedAccidental === 'flat' ? null : 'flat')
            }
            title="Flat"
          >
            ♭
          </button>
          <button
            className={`btn ${selectedAccidental === 'natural' ? 'active' : ''}`}
            onClick={() =>
              onAccidentalChange(
                selectedAccidental === 'natural' ? null : 'natural',
              )
            }
            title="Natural"
          >
            ♮
          </button>
          <button
            className={`btn ${selectedAccidental === 'sharp' ? 'active' : ''}`}
            onClick={() =>
              onAccidentalChange(selectedAccidental === 'sharp' ? null : 'sharp')
            }
            title="Sharp"
          >
            ♯
          </button>
        </div>
      </div>
    </div>
  )
}
