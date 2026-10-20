/**
 * A small, always-visible "you are being recorded" indicator. Deliberately
 * quiet — a blinking red dot + MONITORED — so AURA reads as a live security
 * system without becoming chatty. Rendered on home, portal pages and the terminal.
 */
export function SurveillanceTag() {
  return (
    <span className="surveil" title="Session monitored">
      <span className="surveil-dot" aria-hidden="true" />
      <span className="surveil-rec">REC</span>
      <span className="surveil-sep" aria-hidden="true">—</span>
      <span className="surveil-label">MONITORED</span>
    </span>
  )
}
