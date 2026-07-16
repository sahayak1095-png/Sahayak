import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { categoriesAPI, serviceItemsAPI, ServiceCategory } from '../services/api'

interface ServicesPageProps {
  onNavigate: (page: string, payload?: { service?: string; category?: string }) => void
}

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

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    categoriesAPI.getAll()
      .then(setCategories)
      .catch(err => {
        console.error('Failed to load categories:', err)
      })
  }, [])

  const filterCategories = () => {
    const lowerQuery = searchQuery.trim().toLowerCase()
    return categories.filter(cat => {
      if (!lowerQuery) {
        return true
      }
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        return true
      }
      return cat.items?.some(item => item.toLowerCase().includes(lowerQuery))
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedCategory(null)
    setSelectedCategoryItems([])
  }

  useEffect(() => {
    if (selectedCategoryRef.current) {
      selectedCategoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedCategory])

  const handleCategoryClick = (cat: ServiceCategory) => {
    setSelectedCategory(cat)
    setSearchQuery('')
    setSelectedCategoryItems([])
    setSelectedService(null)

    serviceItemsAPI.getByCategoryId(cat.id)
      .then(items => setSelectedCategoryItems(items.map(item => item.name)))
      .catch(err => console.error('Failed to load category items:', err))
  }

  const handleServiceClick = (service: string, categoryName?: string) => {
    setSelectedService(service)
    if (categoryName) {
      const matched = categories.find(cat => cat.name === categoryName)
      if (matched) {
        setSelectedCategory(matched)
      }
    }
  }

  const visibleCategories = filterCategories()
  const displayedSelectedItems = selectedCategory ?
    (selectedCategoryItems.length > 0 ? selectedCategoryItems : selectedCategory.items)
      .filter(item => !searchQuery.trim() || item.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const { t } = useLanguage()
  const totalServices = categories.reduce((sum, category) => sum + (category.items?.length ?? 0), 0)

  return (
    <section className="page active">
      <div className="services-redesigned">
        {/* Header with hero */}
        <div className="services-hero">
          <div className="wrap">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="dot"></span>
                {t('services.heading')}
              </div>
              <h1>{t('services.hero')}</h1>
              <p>{t('services.subheading')}</p>
            </div>
          </div>
        </div>

        {/* Search bar — full width, sticky */}
        <div className="services-search-section">
          <div className="wrap">
            <div className="search-bar search-bar-service">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                placeholder={t('services.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="section">
          <div className="wrap">
            <div className="services-section-head">
              <div>
                <div className="eyebrow">
                  <span className="dot"></span>
                  {t('services.popular')}
                </div>
                <h2>{t('services.topCategories')}</h2>
              </div>
              <div className="services-total">
                <strong>{totalServices}</strong>
                <span>{t('services.stats.services')}</span>
              </div>
            </div>

            <div className="categories-grid-redesigned">
              {visibleCategories.slice(0, 12).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tile ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div className="tile-icon">{ICONS[cat.icon] || '•'}</div>
                  <div className="tile-body">
                    <h3>{cat.name}</h3>
                    <p>{cat.items[0] ?? t('services.trustedHelper')}</p>
                    <span className="tile-count">{cat.items.length} services</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Category Items */}
        {selectedCategory && (
          <div className="section services-items-section">
            <div className="wrap">
              <div className="services-items-head">
                <h3>{selectedCategory.name}</h3>
                <button 
                  className="btn-close"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedService(null)
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="services-items-grid" ref={selectedCategoryRef}>
                {displayedSelectedItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`service-item ${selectedService === item ? 'selected' : ''}`}
                    onClick={() => handleServiceClick(item, selectedCategory.name)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="section services-cta-section">
          <div className="wrap">
            <div className="cta-card">
              {selectedService ? (
                <div>
                  <p className="cta-text">
                    Ready to book <strong>{selectedService}</strong>?
                  </p>
                  <button
                    className="btn-primary btn-large"
                    onClick={() => onNavigate('register', { service: selectedService ?? undefined, category: selectedCategory?.name ?? undefined })}
                  >
                    {t('services.btnRegister')}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="cta-text">Choose a service to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
