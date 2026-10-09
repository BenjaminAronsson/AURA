/**
 * AURA — PORTAL CONTENT (in-fiction flavor)
 * =========================================
 * Copy for the home-portal pages (Security Footage, Emails, FAQ, Incident
 * Reports). This is ATMOSPHERE, not puzzle data — the physical room owns the
 * real clues, and nothing here gates progression. Keep it authentic-looking but
 * deliberately unhelpful; do not encode step answers here.
 *
 * Game date is 2026-10-22 (Europe/Stockholm); dates below predate it.
 */

/* ---- Home ------------------------------------------------------------ */

export const HOME = {
  title: 'AURA',
  subtitle: 'ADAPTIVE UNIFIED RESPONSE ARCHITECTURE',
  tagline: 'FACILITY SECURITY & ACCESS CONTROL — NORDCREST SYSTEMS AB',
  lastSession: 'LAST OPERATOR SESSION: E. NORBERG — 2026-03-27 18:04',
}

/** The portal pages, in nav order. `game` is the operator-login entry point. */
export interface NavItem {
  id: 'footage' | 'emails' | 'faq' | 'incidents' | 'settings'
  label: string
  blurb: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'footage', label: 'SECURITY FOOTAGE', blurb: 'Live camera feeds' },
  { id: 'emails', label: 'MAIL RELAY', blurb: 'Internal correspondence' },
  { id: 'faq', label: 'FAQ', blurb: 'System help' },
  { id: 'incidents', label: 'INCIDENT REPORTS', blurb: 'Filed tickets' },
  { id: 'settings', label: 'SETTINGS', blurb: 'Preferences' },
]

/* ---- Security footage ------------------------------------------------ */

export interface Camera {
  id: string
  name: string
  /** 'lost' = disconnected/unplugged; 'static' = dead signal noise. */
  state: 'lost' | 'static'
}

export const CAMERAS: Camera[] = [
  { id: 'C01', name: 'SERVER ROOM', state: 'static' },
  { id: 'C02', name: 'MAIN ENTRANCE', state: 'lost' },
  { id: 'C03', name: 'DEVELOPER FLOOR', state: 'lost' },
  { id: 'C04', name: 'RECEPTION', state: 'static' },
  { id: 'C05', name: 'PARKING B2', state: 'lost' },
  { id: 'C06', name: 'ARCHIVE', state: 'lost' },
  { id: 'C07', name: 'EXEC CORRIDOR', state: 'static' },
  { id: 'C08', name: 'LOADING BAY', state: 'lost' },
]

export const FOOTAGE_NOTE =
  'All feeds offline since facility lockdown. Camera subsystem awaiting operator re-authentication.'

/* ---- Emails (deliberately useless) ----------------------------------- */

export interface Email {
  from: string
  subject: string
  date: string
  body: string[]
}

export const EMAILS: Email[] = [
  {
    from: 'facilities@nordcrest.se',
    subject: 'Coffee machine (3rd floor) — out of order',
    date: '2026-03-24',
    body: [
      'Hi all,',
      'The bean-to-cup machine on 3 is making the noise again. A technician is',
      'booked for Thursday. Until then please use the kitchenette on 2.',
      'Thanks for your patience.',
    ],
  },
  {
    from: 'reception@nordcrest.se',
    subject: 'Reminder: visitor badges must be returned',
    date: '2026-03-25',
    body: [
      'A friendly reminder that temporary visitor badges should be handed back',
      'at reception on your way out. We are currently missing four (4).',
      'They do not work after 24h anyway, so there is really no point keeping them.',
    ],
  },
  {
    from: 'noreply@nordcrest-it.se',
    subject: 'Scheduled maintenance window',
    date: '2026-03-26',
    body: [
      'The print server (PRN-02) will be unavailable Saturday 02:00–03:00 for',
      'routine updates. No action is required. This message is automated.',
    ],
  },
  {
    from: 'aura-system@nordcrest.se',
    subject: 'Credential rotation completed',
    date: '2026-04-01',
    body: [
      'This is an automated notice. A master credential on this account was',
      'rotated as part of routine policy. If you did not expect this change,',
      'contact your security administrator.',
      '— AURA',
    ],
  },
  {
    from: 'hr@nordcrest.se',
    subject: 'Parking survey (2 min!)',
    date: '2026-03-20',
    body: [
      'Help us plan next year’s parking allocation by filling in the survey.',
      'It takes about two minutes. There are no wrong answers. There is also,',
      'frankly, no budget, but we appreciate your input all the same.',
    ],
  },
  {
    from: 'allstaff@nordcrest.se',
    subject: 'Fruit basket Fridays are back',
    date: '2026-03-18',
    body: [
      'Good news: the fruit baskets return this Friday. Bananas, apples, and the',
      'pears nobody eats. Please do not take more than your fair share of bananas.',
    ],
  },
]

/* ---- FAQ (authentic security-system help) ---------------------------- */

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: 'What is AURA?',
    a: 'AURA (Adaptive Unified Response Architecture) is Nordcrest Systems’ facility security and access-control layer. It manages authentication, door and camera subsystems, incident logging, and lockdown procedures.',
  },
  {
    q: 'Why is the core in dormant mode?',
    a: 'The core enters a dormant state after an interrupted operator session or a facility lockdown. Full functionality is restored once an authorised operator re-authenticates.',
  },
  {
    q: 'What should I do during a lockdown?',
    a: 'Remain calm and remain in your current zone. Do not attempt to force secured doors. Authorised operators should authenticate at any active terminal to review system status.',
  },
  {
    q: 'How are operator credentials reset?',
    a: 'Credentials are issued and rotated by your security administrator. AURA never displays, emails, or recovers credentials through this interface. Lost credentials must be re-issued in person.',
  },
  {
    q: 'Is facility data encrypted?',
    a: 'Yes. Data at rest is encrypted with AES-256 and all operator sessions use mutually authenticated TLS. AURA retains security logs for 180 days.',
  },
  {
    q: 'Who do I contact for support?',
    a: 'Operational issues go to your on-site security administrator. AURA does not provide external support channels while the facility is in lockdown.',
  },
]

/* ---- Incident reports ------------------------------------------------ */

export interface Incident {
  id: string
  date: string
  status: 'CLOSED' | 'REVIEWED' | 'OPEN'
  summary: string
}

export const INCIDENTS: Incident[] = [
  { id: 'INC-4471', date: '2026-03-12', status: 'CLOSED', summary: 'Door 3 (Dev floor) sensor fault — recalibrated.' },
  { id: 'INC-4472', date: '2026-03-15', status: 'CLOSED', summary: 'False fire alarm, kitchenette — burnt toast.' },
  { id: 'INC-4480', date: '2026-03-19', status: 'REVIEWED', summary: 'Badge reader offline at reception — power-cycled.' },
  { id: 'INC-4488', date: '2026-03-26', status: 'REVIEWED', summary: 'After-hours access flagged, server room — reviewed, no action.' },
  { id: 'INC-4490', date: '2026-03-28', status: 'CLOSED', summary: 'Visitor badge not returned — auto-expired.' },
  { id: 'INC-4501', date: '2026-04-02', status: 'OPEN', summary: 'Camera subsystem offline following lockdown — pending operator.' },
]
