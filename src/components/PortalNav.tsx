import type { View } from '../App'
import { NAV_ITEMS } from '../game/portalContent'

interface Props {
  active: View
  inProgress: boolean
  onNavigate: (v: View) => void
  onEnter: () => void
  /** 'home' = large landing menu; 'bar' = compact top bar on content pages. */
  variant: 'home' | 'bar'
}

export function PortalNav({ active, inProgress, onNavigate, onEnter, variant }: Props) {
  const enterLabel = inProgress ? 'RESUME SESSION' : 'OPERATOR ACCESS'
  return (
    <nav className={`portal-nav portal-nav-${variant}`} aria-label="AURA sections">
      <button className="portal-enter" onClick={onEnter}>
        <span className="portal-enter-caret" aria-hidden="true">▸</span>
        {enterLabel}
      </button>

      {variant === 'bar' && (
        <button
          className={`portal-link ${active === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          HOME
        </button>
      )}

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`portal-link ${active === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="portal-link-label">{item.label}</span>
          {variant === 'home' && <span className="portal-link-blurb">{item.blurb}</span>}
        </button>
      ))}
    </nav>
  )
}
