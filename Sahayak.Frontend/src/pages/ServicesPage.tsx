import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { categoriesAPI, serviceItemsAPI, ServiceCategory } from '../services/api'

interface ServicesPageProps {
  onNavigate: (page: string) => void
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

const POPULAR_QUERIES = [
  'medicine pickup',
  'home cleaning',
  'pet care',
  'document help',
  'move-in support'
]

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null)
  const [highlightedService, setHighlightedService] = useState<string | null>(null)
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    categoriesAPI.getAll()
      .then(cats => {
        setCategories(cats)
      })
      .catch(err => {
        console.error('Failed to load categories:', err)
      })
  }, [])

  const findMatchingCategory = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return categories.find(cat => {
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        return true
      }
      if (Array.isArray(cat.items)) {
        return cat.items.some(item => typeof item === 'string' && item.toLowerCase().includes(lowerQuery))
      }
      return false
    }) || null
  }

  const buildSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase()
    const results = new Set<string>()

    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        results.add(cat.name)
      }
      cat.items?.forEach(item => {
        if (typeof item === 'string' && item.toLowerCase().includes(lowerQuery)) {
          results.add(item)
        }
      })
    })

    return Array.from(results).slice(0, 8)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setHighlightedService(null)

    if (!query.trim()) {
      setSelectedCategory(null)
      setSuggestions([])
      setActiveSuggestion(null)
      return
    }

    const nextSuggestions = buildSuggestions(query)
    setSuggestions(nextSuggestions)
    setActiveSuggestion(nextSuggestions.length > 0 ? nextSuggestions[0] : null)
    setSelectedCategory(findMatchingCategory(query))
  }

  const handlePopularQueryClick = (query: string) => {
    setSearchQuery(query)
    setHighlightedService(null)
    const nextSuggestions = buildSuggestions(query)
    setSuggestions(nextSuggestions)
    setActiveSuggestion(nextSuggestions.length > 0 ? nextSuggestions[0] : null)
    setSelectedCategory(findMatchingCategory(query))
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return

    const currentIndex = suggestions.findIndex(item => item === activeSuggestion)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0
      setActiveSuggestion(suggestions[nextIndex])
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1
      setActiveSuggestion(suggestions[prevIndex])
      return
    }

    if (event.key === 'Enter' && activeSuggestion) {
      event.preventDefault()
      handleSuggestionSelect(activeSuggestion)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion)
    setSuggestions([])
    setActiveSuggestion(suggestion)
    setHighlightedService(suggestion)

    const matchedCategory = categories.find(cat =>
      cat.name === suggestion ||
      cat.items?.some(item => item === suggestion)
    )

    setSelectedCategory(matchedCategory || null)
    setSelectedCategoryItems([])
  }

  useEffect(() => {
    if (selectedCategoryRef.current) {
      selectedCategoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedCategory])

  const handleCategoryClick = (cat: ServiceCategory) => {
    setSelectedCategory(cat)
    setSelectedCategoryItems([])
    setSearchQuery('')
    setSuggestions([])
    setActiveSuggestion(null)
    setHighlightedService(null)

    serviceItemsAPI.getByCategoryId(cat.id)
      .then(items => {
        setSelectedCategoryItems(items.map(item => item.name))
      })
      .catch(err => {
        console.error('Failed to load category items:', err)
      })
  }

  const handleServiceClick = (_service: string) => {
    // Navigate to registration page with service pre-selected
    onNavigate('register')
  }

  return (
    <section className="page active">
      <div className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot"></span>
              Choose a category
            </div>
            <h2>What can Sahayak take off your plate?</h2>
            <p>Search a task or hover a category to preview what's covered — register once you know what you need.</p>
          </div>
          
          <div className="search-row">
            <div className="search-bar">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                placeholder="Try 'medicine pickup', 'house help', or 'pet care'…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <div className="search-context">
              {searchQuery ? (
                <p>Searching for <strong>{searchQuery}</strong>. Tap a suggestion or category to narrow results.</p>
              ) : (
                <p>Type a service name to get quick suggestions and preview matching categories.</p>
              )}
            </div>
          </div>

          <div className="quick-queries">
            {POPULAR_QUERIES.map(query => (
              <button
                key={query}
                type="button"
                className="query-chip"
                onClick={() => handlePopularQueryClick(query)}
              >
                {query}
              </button>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`suggestion-item ${activeSuggestion === suggestion ? 'active' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="bento">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                className={`cat-card ${idx === 0 ? 'big' : ''} ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                type="button"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="cat-icon">{ICONS[cat.icon] || '•'}</div>
                <div className="cat-preview">
                  {cat.items.slice(0, 4).map((item, i) => (
                    <div key={i}>· {item}</div>
                  ))}
                  {cat.items.length > 4 && (
                    <div className="more">+{cat.items.length - 4} more →</div>
                  )}
                </div>
                <h3>{cat.name}</h3>
                <div className="count">{cat.items.length} ways to help</div>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="items-panel open" ref={selectedCategoryRef}>
              <div className="items-panel-head">
                <div>
                  <h4>{selectedCategory.name}</h4>
                  <p>Tap a service to move directly to registration.</p>
                </div>
                <span className="item-count">{selectedCategory.items.length} services</span>
              </div>
              <div className="chip-row">
                {(selectedCategoryItems.length > 0 ? selectedCategoryItems : selectedCategory.items).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`chip ${searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase()) ? 'hit' : ''} ${highlightedService === item ? 'hit' : ''}`}
                    onClick={() => handleServiceClick(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button className="btn-primary" onClick={() => onNavigate('register')}>
              Register a request
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
