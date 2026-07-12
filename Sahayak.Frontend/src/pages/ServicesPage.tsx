import { useState, useEffect, useRef } from 'react'
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
  const [categoryFilterId, setCategoryFilterId] = useState<number | null>(null)
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
      if (categoryFilterId && cat.id !== categoryFilterId) {
        return false
      }
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

  const handleCategoryFilterChange = (value: string) => {
    const nextCategoryId = value ? parseInt(value, 10) : null
    setCategoryFilterId(nextCategoryId)
    setSearchQuery('')

    if (nextCategoryId != null) {
      const category = categories.find(c => c.id === nextCategoryId) || null
      setSelectedCategory(category)
      setSelectedCategoryItems([])
      if (category) {
        serviceItemsAPI.getByCategoryId(category.id)
          .then(items => setSelectedCategoryItems(items.map(item => item.name)))
          .catch(err => console.error('Failed to load category items:', err))
      }
      return
    }

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
    setCategoryFilterId(cat.id)
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
        setCategoryFilterId(matched.id)
      }
    }
  }

  const visibleCategories = filterCategories()
  const displayedSelectedItems = selectedCategory ?
    (selectedCategoryItems.length > 0 ? selectedCategoryItems : selectedCategory.items)
      .filter(item => !searchQuery.trim() || item.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const totalServices = categories.reduce((sum, category) => sum + (category.items?.length ?? 0), 0)
  const totalCategories = categories.length

  return (
    <section className="page active">
      <div className="section">
        <div className="wrap">
          <div className="hero hero-services hero-service-page">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="dot"></span>
                Browse Services
              </div>
              <h1>Find trusted and verified helpers for every task you need.</h1>
              <p className="lede">Search for a service, choose a category, and book trusted help in Bengaluru.</p>
              <div className="stats-row stats-services">
                <div className="stat">
                  <b>{totalServices}</b>
                  <span>Services</span>
                </div>
                <div className="stat">
                  <b>{totalCategories}</b>
                  <span>Categories</span>
                </div>
              </div>
            </div>
          </div>

          <div className="service-topbar">
            <div className="search-bar search-bar-service">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                placeholder="Search for services (e.g. Plumbing, AC repair...)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="services-grid" id="services-categories">
            <aside className="service-sidebar">
              <div className="sidebar-panel">
                <div className="sidebar-title">Categories</div>
                <ul className="category-menu">
                  <li
                    className={`category-menu-item ${categoryFilterId == null ? 'active' : ''}`}
                    onClick={() => handleCategoryFilterChange('')}
                  >
                    <span>All Services</span>
                    <strong>{totalServices}</strong>
                  </li>
                  {categories.map(cat => (
                    <li
                      key={cat.id}
                      className={`category-menu-item ${categoryFilterId === cat.id ? 'active' : ''}`}
                      onClick={() => handleCategoryFilterChange(cat.id.toString())}
                    >
                      <span>{cat.name}</span>
                      <strong>{cat.items.length}</strong>
                    </li>
                  ))}
                </ul>
                <div className="sidebar-help">
                  <strong>Can’t find what you need?</strong>
                  <p>Send a custom request and we’ll match a helper for you.</p>
                </div>
              </div>
            </aside>

            <main className="service-content">
              <div className="service-header-row">
                <div>
                  <div className="eyebrow">
                    <span className="dot"></span>
                    Popular Services
                  </div>
                  <h2>Top categories picked by customers</h2>
                </div>
              </div>

              <div className="service-card-grid">
                {visibleCategories.slice(0, 12).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`service-card ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="service-card-top">
                      <span className="service-card-icon">{ICONS[cat.icon] || '•'}</span>
                      <span className="service-card-name">{cat.name}</span>
                    </div>
                    <p className="service-card-copy">{cat.items[0] ?? 'Trusted helper at your doorstep'}</p>
                    <div className="service-card-footer">
                      <span>{cat.items.length} services</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <div className="selected-category-panel" ref={selectedCategoryRef}>
                  <div className="panel-title">{selectedCategory.name} services</div>
                  <div className="chip-grid">
                    {displayedSelectedItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`chip ${selectedService === item ? 'picked' : ''}`}
                        onClick={() => handleServiceClick(item, selectedCategory.name)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedService && (
                <div className="selected-service-banner">
                  <p>
                    Selected service: <strong>{selectedService}</strong>. Click register to continue with this task.
                  </p>
                </div>
              )}

              <div className="register-action-row">
                <button
                  className="btn-primary"
                  onClick={() => onNavigate('register', { service: selectedService ?? undefined, category: selectedCategory?.name ?? undefined })}
                >
                  Register a request
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  )
}
