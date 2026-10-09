import { INCIDENTS } from '../game/portalContent'

export function IncidentsPage() {
  return (
    <div className="incidents">
      <p className="portal-note">
        INCIDENT REGISTER — {INCIDENTS.length} filed. Facility security log, last 90 days.
      </p>
      <div className="incident-table" role="table">
        <div className="incident-row incident-head" role="row">
          <span role="columnheader">ID</span>
          <span role="columnheader">DATE</span>
          <span role="columnheader">STATUS</span>
          <span role="columnheader">SUMMARY</span>
        </div>
        {INCIDENTS.map((inc) => (
          <div key={inc.id} className="incident-row" role="row">
            <span className="incident-id" role="cell">
              {inc.id}
            </span>
            <span role="cell">{inc.date}</span>
            <span className={`incident-status status-${inc.status.toLowerCase()}`} role="cell">
              {inc.status}
            </span>
            <span className="incident-summary" role="cell">
              {inc.summary}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
