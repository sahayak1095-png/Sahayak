interface ConfirmationPageProps {
  data: any
  onNavigate: (page: string) => void
}

export default function ConfirmationPage({ data, onNavigate }: ConfirmationPageProps) {
  const referenceId = data?.referenceId || 'SHK-000000'

  return (
    <section className="page active">
      <div className="section">
        <div className="wrap">
          <div className="confirm-card">
            <div className="check-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F2A93B" strokeWidth="2.5">
                <path d="M4 12l5 5L20 6"/>
              </svg>
            </div>
            <h2 style={{ color: '#F7F5EF' }}>Request received</h2>
            <p className="confirm-note">
              We’ve captured your details. A helper will review this request and reach out to confirm the schedule.
            </p>
            <div className="fee-note" style={{ marginBottom: '12px' }}>
              <div className="icon">💳</div>
              <div>Only a service fee was charged — no hidden fees, no extra markups.</div>
            </div>
            <p className="confirm-reference">
              Reference <span className="mono">{referenceId}</span>
            </p>
            <div className="timeline">
              <div className="tl-step complete">
                <div className="tl-dot"></div>
                <div className="tl-label">Under review</div>
              </div>
              <div className="tl-step upcoming">
                <div className="tl-dot"></div>
                <div className="tl-label">Helper assigned</div>
              </div>
              <div className="tl-step upcoming">
                <div className="tl-dot"></div>
                <div className="tl-label">Confirmation call</div>
              </div>
            </div>
            <div className="confirm-actions">
              <button
                className="btn-ghost"
                style={{ color: '#F7F5EF', borderColor: 'rgba(247,245,239,0.3)', background: 'transparent' }}
                onClick={() => onNavigate('register')}
              >
                Register another request
              </button>
              <button className="btn-primary" onClick={() => onNavigate('home')}>
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
