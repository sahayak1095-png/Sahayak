import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { categoriesAPI, logsAPI, ServiceCategory, ServiceLog } from '../services/api'

interface HomePageProps {
  onNavigate: (page: string) => void
}

const PHRASE_KEYS = ['home.phrase1', 'home.phrase2', 'home.phrase3', 'home.phrase4', 'home.phrase5']
const ICONS: Record<string, string> = {
  errand: '🚗',
  heart: '❤️',
  broom: '🧹',
  wrench: '🔧',
  pot: '🍲',
  book: '📚',
  paw: '🐾',
  spa: '✨',
  box: '📦',
  chip: '💻',
  'party-popper': '🎉',
  home: '🏠',
  scale: '⚖️',
  wallet: '💳',
  leaf: '🌿',
  shield: '🛡️',
  camera: '📷',
  globe: '🌍',
  briefcase: '💼'
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [kineticIndex, setKineticIndex] = useState(0)
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [logs, setLogs] = useState<ServiceLog[]>([])

  const useCountUp = (target: number, duration = 1200) => {
    const [value, setValue] = useState(0)
    useEffect(() => {
      let raf = 0
      let start: number | null = null
      const step = (ts: number) => {
        if (start === null) start = ts
        const progress = Math.min((ts - start) / duration, 1)
        setValue(Math.round(progress * target))
        if (progress < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => cancelAnimationFrame(raf)
    }, [target, duration])
    return value
  }

  const requestsCount = useCountUp(5, 1500)
  const helpersCount = useCountUp(12, 1200)
  const neighborhoodsCount = useCountUp(10, 900)

  useEffect(() => {
    const interval = setInterval(() => {
      setKineticIndex(i => (i + 1) % PHRASE_KEYS.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    Promise.all([
      categoriesAPI.getAll(),
      logsAPI.getRecent(6)
    ]).then(([cats, logs]) => {
      setCategories(cats)
      setLogs(logs)
    }).catch(err => {
      console.error('Failed to load data:', err)
    })
  }, [])

  const { t } = useLanguage()
  const phrases = PHRASE_KEYS.map(key => t(key))

  return (
    <section className="page active">
      <div className="hero">
        <div className="mesh"></div>
        <div className="wrap hero-inner">
          <div>
            <p className="hero-topline">{t('home.topline')}</p>
            <div className="eyebrow eyebrow-pill">
              <span className="dot"></span>
              {t('home.servicesLabel')}
            </div>
            <h1>
              {t('home.hero')}<br />
              <span className="kinetic">{phrases[kineticIndex]}</span>
            </h1>
            <p className="lede">{t('home.tagline')}</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('register')}>
                {t('home.btnRegister')}
              </button>
              <button className="btn-ghost" onClick={() => onNavigate('services')}>
                {t('home.btnBrowse')}
              </button>
            </div>
            <div className="fee-note" style={{ marginTop: '18px' }}>
              <div className="icon">💳</div>
              <div>{t('home.fee')}</div>
            </div>
            <div className="hero-stats-card">
              <div className="stats-row">
                <div className="stat">
                  <b className="stat-count">{new Intl.NumberFormat().format(requestsCount)}+</b>
                  <span>{t('home.stats.requests')}</span>
                </div>
                <div className="stat">
                  <b className="stat-count">{helpersCount}</b>
                  <span>{t('home.stats.helpers')}</span>
                </div>
                <div className="stat">
                  <b className="stat-count">{neighborhoodsCount}</b>
                  <span>{t('home.stats.neighborhoods')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <span><span className="live-dot"></span>{t('home.liveRequests')}</span>
              <span className="mono">{time}</span>
            </div>
            <div>
              {logs.map((log, idx) => (
                <div key={log.id} className="ledger-row" style={{ animationDelay: `${idx * 0.12}s` }}>
                  <span className="who">{log.personName}</span>
                  <span className="task">{log.taskDescription}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="wrap wide-section">
          <div className="section-head large">
            <div className="eyebrow pill-large">
              <span className="dot"></span>
              {t('home.coveredHeading')}
            </div>
            <h2 className="large-heading">{t('home.categoryHeading')}</h2>
            <p className="muted-lede">{t('home.categories')}</p>
          </div>
          <div className="mini-cats grid-large">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.id}
                className="mini-cat tile"
                type="button"
                onClick={() => onNavigate('services')}
              >
                <div className="ic large-ic">{ICONS[cat.icon] || '•'}</div>
                <h4>{cat.name}</h4>
              </button>
            ))}
          </div>
          <button className="see-all" onClick={() => onNavigate('services')}>
            {t('home.seeAll')}
          </button>
        </div>
      </div>
    </section>
  )
}
