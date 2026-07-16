import { useLanguage } from '../contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <section className="page active">
      <div className="section">
        <div className="wrap" style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="eyebrow" style={{ marginBottom: '16px' }}>
            <span className="dot"></span>
            {t('nav.about')}
          </div>
          <h1 style={{ marginBottom: '24px', lineHeight: 1.1 }}>
            {t('about.heading')}
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '16px', color: 'var(--ink-soft)' }}>
            {t('about.body1')}
          </p>
          <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '32px', color: 'var(--ink-soft)' }}>
            {t('about.body2')}
          </p>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '32px' }}>
            <div style={{ padding: '18px', background: 'rgba(108, 183, 224, 0.08)', borderRadius: '16px' }}>
              <strong>{t('about.contact')}</strong> 8884721366
            </div>
            <div style={{ padding: '18px', background: 'rgba(108, 183, 224, 0.08)', borderRadius: '16px' }}>
              <strong>{t('about.email')}</strong> sahayak85@gmail.com
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
