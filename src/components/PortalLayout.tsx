import type { ReactNode } from 'react'
import { PortalNav } from './PortalNav'
import { SurveillanceTag } from './SurveillanceTag'
import { CountdownChip } from './CountdownChip'
import type { View } from '../App'

interface Props {
  title: string
  active: View
  inProgress: boolean
  onNavigate: (v: View) => void
  onEnter: () => void
  /** Live Step-4 deadline, or null — shown as a chip so time isn't lost while browsing. */
  countdownDeadline: number | null
  children: ReactNode
}

/** Shared chrome for the in-fiction content pages: header + nav + scroll area. */
export function PortalLayout({
  title,
  active,
  inProgress,
  onNavigate,
  onEnter,
  countdownDeadline,
  children,
}: Props) {
  return (
    <div className="screen portal">
      <header className="portal-header">
        <span className="brand">AURA</span>
        <span className="portal-title">{title}</span>
        <SurveillanceTag />
        {countdownDeadline !== null && <CountdownChip deadline={countdownDeadline} />}
      </header>

      <PortalNav
        active={active}
        variant="bar"
        inProgress={inProgress}
        onEnter={onEnter}
        onNavigate={onNavigate}
      />

      <div className="portal-page">{children}</div>
    </div>
  )
}
