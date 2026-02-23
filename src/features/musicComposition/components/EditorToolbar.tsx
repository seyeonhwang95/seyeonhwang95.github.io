interface ToolbarProps {
  mode: string
  onModeChange: (mode: string) => void
  canUndo: boolean
  onUndo: () => void
  canRedo: boolean
  onRedo: () => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onReset: () => void
  onExportPDF: () => void
  onExportXML: () => void
}

export function EditorToolbar({
  mode,
  onModeChange,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onReset,
  onExportPDF,
  onExportXML,
}: ToolbarProps) {
  const modes = ['select', 'note', 'rest', 'edit']

  return (
    <div className="editor-toolbar">
      {/* Mode Selection */}
      <div className="toolbar-section">
        <label>Mode:</label>
        <div className="button-group">
          {modes.map((m) => (
            <button
              key={m}
              className={`btn ${mode === m ? 'active' : ''}`}
              onClick={() => onModeChange(m)}
              title={`${m} mode`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-separator" />

      {/* Undo/Redo */}
      <div className="toolbar-section">
        <button
          className="btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          className="btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Playback Controls */}
      <div className="toolbar-section">
        <button
          className="btn"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn" onClick={onStop} title="Stop">
          ⏹ Stop
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Export */}
      <div className="toolbar-section">
        <button
          className="btn"
          onClick={onExportPDF}
          title="Export as PDF"
        >
          📄 Export PDF
        </button>
        <button
          className="btn"
          onClick={onExportXML}
          title="Export as MusicXML"
        >
          🎵 Export XML
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Reset */}
      <div className="toolbar-section">
        <button
          className="btn btn-danger"
          onClick={onReset}
          title="Clear all notes"
        >
          ↻ Reset
        </button>
      </div>
    </div>
  )
}
