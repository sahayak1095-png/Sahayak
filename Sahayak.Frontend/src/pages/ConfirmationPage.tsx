import { useLanguage } from '../contexts/LanguageContext'

interface ConfirmationPageProps {
  data: any
  onNavigate: (page: string) => void
}

export default function ConfirmationPage({ data, onNavigate }: ConfirmationPageProps) {
  const { t } = useLanguage()
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
            <h2 style={{ color: '#F7F5EF' }}>{t('confirm.heading')}</h2>
            <p className="confirm-note">
              {t('confirm.body')}
            </p>
            <div className="fee-note" style={{ marginBottom: '12px' }}>
              <div className="icon">💳</div>
              <div>{t('confirm.fee')}</div>
            </div>
            <p className="confirm-reference">
              {t('confirm.reference')} <span className="mono">{referenceId}</span>
            </p>
            <div className="timeline">
              <div className="tl-step complete">
                <div className="tl-dot"></div>
                <div className="tl-label">{t('confirm.round1')}</div>
              </div>
              <div className="tl-step upcoming">
                <div className="tl-dot"></div>
                <div className="tl-label">{t('confirm.round2')}</div>
              </div>
              <div className="tl-step upcoming">
                <div className="tl-dot"></div>
                <div className="tl-label">{t('confirm.round3')}</div>
              </div>
            </div>
            <div className="confirm-actions">
              <button
                className="btn-ghost"
                style={{ color: '#F7F5EF', borderColor: 'rgba(247,245,239,0.3)', background: 'transparent' }}
                onClick={() => onNavigate('register')}
              >
                {t('confirm.btnRegister')}
              </button>
              <button className="btn-primary" onClick={() => onNavigate('home')}>
                {t('confirm.btnHome')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
