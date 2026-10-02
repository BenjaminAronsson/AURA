interface StatusBarProps {
  accessLevel: number
  module: string
  complete: boolean
  progress: { current: number; total: number }
}

export function StatusBar({ accessLevel, module, complete, progress }: StatusBarProps) {
  const status = complete ? 'RELEASED' : 'LOCKDOWN'
  return (
    <div className="statusbar" role="status" aria-live="polite">
      <span className="status-item">
        <span className="status-label">FACILITY</span>
        <span className={complete ? 'status-value ok' : 'status-value alert'}>{status}</span>
      </span>
      <span className="status-item">
        <span className="status-label">ACCESS LEVEL</span>
        <span className="status-value">{String(accessLevel).padStart(2, '0')}</span>
      </span>
      <span className="status-item">
        <span className="status-label">MODULE</span>
        <span className="status-value">{module}</span>
      </span>
      <span className="status-item">
        <span className="status-label">STAGE</span>
        <span className="status-value">
          {String(progress.current).padStart(2, '0')}/{String(progress.total).padStart(2, '0')}
        </span>
      </span>
    </div>
  )
}
