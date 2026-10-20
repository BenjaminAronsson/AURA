import officeOpen from '../assets/feed/office-open.jpg'

export type FeedVariant = 'photo' | 'scene'

/**
 * A "live" CCTV view for an active camera. Two visual versions:
 *  - `photo`: a real (royalty-free, Pexels) empty-office photo pushed through a
 *    cold CCTV look (desaturate + green tint + grain + scanlines + vignette) so
 *    it reads as low-light surveillance of an empty room.
 *  - `scene`: a synthesized SVG office (open-plan desks in perspective, a
 *    flickering monitor) — lightweight and offline, a visibly different feed.
 * Grain/scanlines/vignette overlays + the REC/LIVE/timestamp OSD are shared.
 */
export function OfficeFeed({ variant }: { variant: FeedVariant }) {
  return (
    <div className={`feed feed-${variant}`}>
      {variant === 'photo' ? (
        <img className="feed-img" src={officeOpen} alt="" aria-hidden="true" draggable={false} />
      ) : (
        <OfficeScene />
      )}
      <div className="feed-scanlines" aria-hidden="true" />
      <div className="feed-vignette" aria-hidden="true" />
      <div className="camera-noise camera-noise-faint" aria-hidden="true" />
    </div>
  )
}

/** Synthesized open-plan office in rough perspective, desaturated CCTV green. */
function OfficeScene() {
  return (
    <svg className="office-feed" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="160" height="120" fill="#0b110d" />
      {/* back wall + ceiling line */}
      <rect x="0" y="0" width="160" height="40" fill="#0e150f" />
      <line x1="0" y1="40" x2="160" y2="40" stroke="#243329" strokeWidth="1" />
      {/* ceiling duct + strip light */}
      <line x1="30" y1="0" x2="54" y2="40" stroke="#1d2a22" strokeWidth="2" />
      <line x1="120" y1="0" x2="104" y2="40" stroke="#1d2a22" strokeWidth="2" />
      <rect x="66" y="6" width="30" height="3" fill="#35493d" />
      {/* far windows */}
      <rect x="10" y="14" width="30" height="18" fill="#16271f" stroke="#2c3e33" strokeWidth="1" />
      <rect x="120" y="14" width="30" height="18" fill="#16271f" stroke="#2c3e33" strokeWidth="1" />
      {/* floor converging lines (perspective) */}
      <g stroke="#1a2820" strokeWidth="1">
        <line x1="0" y1="120" x2="60" y2="40" />
        <line x1="160" y1="120" x2="100" y2="40" />
        <line x1="54" y1="120" x2="70" y2="40" />
        <line x1="106" y1="120" x2="90" y2="40" />
      </g>
      {/* two rows of desks with monitors; nearer = bigger */}
      {/* far desks */}
      <g fill="#0f1813" stroke="#2c3e33" strokeWidth="1">
        <rect x="58" y="46" width="18" height="6" />
        <rect x="84" y="46" width="18" height="6" />
      </g>
      <rect x="63" y="40" width="8" height="6" fill="#2f6f4e" />
      <rect className="office-monitor" x="89" y="40" width="8" height="6" fill="#2f6f4e" />
      {/* near desks + chairs */}
      <g fill="#0f1813" stroke="#2c3e33" strokeWidth="1.3">
        <rect x="34" y="74" width="34" height="9" />
        <rect x="92" y="74" width="34" height="9" />
      </g>
      <rect x="44" y="60" width="16" height="12" fill="#0e1612" stroke="#2c3e33" strokeWidth="1.2" />
      <rect className="office-monitor" x="46" y="62" width="12" height="8" fill="#2f6f4e" />
      <rect x="100" y="60" width="16" height="12" fill="#0e1612" stroke="#2c3e33" strokeWidth="1.2" />
      <rect x="102" y="62" width="12" height="8" fill="#245b40" />
      <g stroke="#2c3e33" strokeWidth="1.4" fill="#0e1612">
        <rect x="40" y="88" width="16" height="12" rx="2" />
        <rect x="104" y="88" width="16" height="12" rx="2" />
      </g>
    </svg>
  )
}
