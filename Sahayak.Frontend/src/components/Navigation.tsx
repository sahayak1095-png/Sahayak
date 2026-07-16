import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const MENU_OPTIONS = [
  { page: 'home', labelKey: 'nav.home' },
  { page: 'services', labelKey: 'nav.services' },
  { page: 'register', labelKey: 'nav.register' },
  { page: 'admin', labelKey: 'nav.admin' }
]

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { lang, setLang, t } = useLanguage()
  const [navOpen, setNavOpen] = useState(false)

  const handleNavigate = (page: string) => {
    onPageChange(page)
    setNavOpen(false)
  }

  return (
    <div className="nav">
      <button className="brand" onClick={() => onPageChange('home')}>
        <div className="brand-mark">ಸ</div>
        <div className="brand-copy">
          <span className="brand-name">{t('brand.name')}</span>
          <span className="brand-sub">{t('brand.sub')}</span>
        </div>
      </button>

      {/* center graphic removed — moved to right side */}

      <div className="controls">
        <button
          className={`hamburger ${navOpen ? 'open' : ''}`}
          aria-label={t('nav.menu')}
          aria-expanded={navOpen}
          aria-controls="main-nav"
          onClick={() => setNavOpen(o => !o)}
        >
          <span className="menu-icon">☰</span>
          <span className="menu-label">{t('nav.menu')}</span>
        </button>

        <div className={`nav-links ${navOpen ? 'open' : ''}`} id="main-nav">
          {MENU_OPTIONS.map(option => (
            <button
              key={option.page}
              className={`navlink ${currentPage === option.page ? 'on' : ''}`}
              onClick={() => handleNavigate(option.page)}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>

        <button className="nav-cta" onClick={() => handleNavigate('about')}>
          {t('nav.about')}
        </button>

        <div className="language-picker">
          <select value={lang} onChange={(e) => setLang(e.target.value as 'en' | 'kn')} aria-label="Select language">
            <option value="en">English</option>
            <option value="kn">Kannada</option>
          </select>
        </div>
      </div>

      {/* mobile/menu handled by the .nav-links inside .controls */}
    </div>
  )
}
