import { useState, useEffect } from 'react'
import { categoriesAPI, logsAPI, ServiceCategory, ServiceLog } from '../services/api'

interface HomePageProps {
  onNavigate: (page: string) => void
}

const PHRASES = ["the RTO queue.", "a medicine pickup.", "the evening walk.", "a deep clean.", "moving day chaos."]
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

  // Animate kinetic text
  useEffect(() => {
    const interval = setInterval(() => {
      setKineticIndex(i => (i + 1) % PHRASES.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch data
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

  return (
    <section className="page active">
      <div className="hero">
        <div className="mesh"></div>
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">
              <span className="dot"></span>
              329 services · 20 categories · Bengaluru
            </div>
            <h1>
              Someone to handle<br/>
              <span className="kinetic">{PHRASES[kineticIndex]}</span>
            </h1>
            <p className="lede">
              Tell Sahayak what you need. A verified helper takes it from there — while you get your time back.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('register')}>
                Register a request
              </button>
              <button className="btn-ghost" onClick={() => onNavigate('services')}>
                Browse services
              </button>
            </div>
            <div className="stats-row">
              <div className="stat">
                <b>12,400+</b>
                <span>requests handled</span>
              </div>
              <div className="stat">
                <b>480</b>
                <span>verified helpers</span>
              </div>
              <div className="stat">
                <b>35</b>
                <span>neighborhoods covered</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <span><span className="live-dot"></span>Live requests</span>
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
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot"></span>
              A taste of what's covered
            </div>
            <h2>Twenty categories, three hundred twenty-nine everyday tasks</h2>
            <p>From queueing at the RTO to move-in planning and document support.</p>
          </div>
          <div className="mini-cats">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.id}
                className="mini-cat"
                type="button"
                onClick={() => onNavigate('services')}
              >
                <div className="ic">{ICONS[cat.icon] || '•'}</div>
                <h4>{cat.name}</h4>
              </button>
            ))}
          </div>
          <button className="see-all" onClick={() => onNavigate('services')}>
            See all categories & tasks →
          </button>
        </div>
      </div>
    </section>
  )
}
