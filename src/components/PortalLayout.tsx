import type { ReactNode } from 'react'
import { PortalNav } from './PortalNav'
import type { View } from '../App'

interface Props {
  title: string
  active: View
  inProgress: boolean
  onNavigate: (v: View) => void
  onEnter: () => void
  children: ReactNode
}

/** Shared chrome for the in-fiction content pages: header + nav + scroll area. */
export function PortalLayout({ title, active, inProgress, onNavigate, onEnter, children }: Props) {
  return (
    <div className="screen portal">
      <header className="portal-header">
        <span className="brand">AURA</span>
        <span className="portal-title">{title}</span>
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
