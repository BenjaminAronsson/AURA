import { useState } from 'react'
import { FAQS } from '../game/portalContent'

export function FaqPage() {
  const [open, setOpen] = useState<number>(0)
  return (
    <div className="faq">
      <p className="portal-note">AURA SYSTEM HELP — frequently asked questions.</p>
      <ul className="faq-list">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <li key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span className="faq-caret" aria-hidden="true">
                  {isOpen ? '▾' : '▸'}
                </span>
                {item.q}
              </button>
              {isOpen && <p className="faq-a">{item.a}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
