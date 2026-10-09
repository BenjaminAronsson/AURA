import { useState } from 'react'
import { EMAILS } from '../game/portalContent'

export function EmailsPage() {
  const [open, setOpen] = useState<number>(0)
  return (
    <div className="emails">
      <p className="portal-note">
        MAIL RELAY — read-only archive. {EMAILS.length} messages. Attachments disabled during lockdown.
      </p>
      <ul className="email-list">
        {EMAILS.map((mail, i) => {
          const isOpen = open === i
          return (
            <li key={i} className={`email ${isOpen ? 'open' : ''}`}>
              <button className="email-head" onClick={() => setOpen(isOpen ? -1 : i)}>
                <span className="email-from">{mail.from}</span>
                <span className="email-subject">{mail.subject}</span>
                <span className="email-date">{mail.date}</span>
              </button>
              {isOpen && (
                <div className="email-body">
                  {mail.body.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
