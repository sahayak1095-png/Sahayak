import { useState, useEffect } from 'react'
import { adminAPI, requestsAPI, ServiceRequest, AdminStats } from '../services/api'

interface AdminPageProps {
  onNavigate: (page: string) => void
}

export default function AdminPage({ onNavigate: _onNavigate }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [currentFilter, setCurrentFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadData()
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
    return
  }, [isAuthenticated])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await adminAPI.login(password)
      if (result.success) {
        setIsAuthenticated(true)
        await loadData()
      } else {
        setError('Incorrect password')
      }
    } catch (err) {
      setError('Failed to login')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const [stats, reqs] = await Promise.all([
        adminAPI.getStats(),
        requestsAPI.getAll()
      ])
      setStats(stats)
      setRequests(reqs)
      applyFiltersAndSearch(reqs, currentFilter, searchQuery)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  const applyFiltersAndSearch = (reqs: ServiceRequest[], filter: string, search: string) => {
    let filtered = reqs

    if (filter !== 'All') {
      filtered = filtered.filter(r => r.status === filter)
    }

    if (search?.trim()) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(r => {
        const matchName = r.name?.toLowerCase().includes(lowerSearch)
        const matchPhone = r.phone?.toLowerCase().includes(lowerSearch)
        const matchArea = r.area?.toLowerCase().includes(lowerSearch)
        const matchCity = r.city?.toLowerCase().includes(lowerSearch)
        const matchRef = r.referenceId?.toLowerCase().includes(lowerSearch)
        
        return matchName || matchPhone || matchArea || matchCity || matchRef
      })
    }

    setFilteredRequests(filtered)
  }

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter)
    applyFiltersAndSearch(requests, filter, searchQuery)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    applyFiltersAndSearch(requests, currentFilter, query)
  }

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      const updated = await requestsAPI.updateStatus(requestId, newStatus)
      setRequests(prev =>
        prev.map(r => r.id === requestId ? updated : r)
      )
      applyFiltersAndSearch(
        requests.map(r => r.id === requestId ? updated : r),
        currentFilter,
        searchQuery
      )
      // Reload stats
      const newStats = await adminAPI.getStats()
      setStats(newStats)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="page active">
        <div className="section">
          <div className="wrap admin-shell">
            <div className="admin-gate" style={{ marginTop: '60px', marginBottom: '60px' }}>
              <h2 style={{ color: 'var(--teal)', marginBottom: '8px' }}>Admin Dashboard</h2>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '30px' }}>
                Enter the admin password to manage service requests
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  style={{
                    padding: '13px 15px',
                    border: '1px solid var(--line)',
                    borderRadius: '11px',
                    fontSize: '14px'
                  }}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '13px 15px',
                    background: 'var(--teal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '11px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Signing in...' : 'Access Dashboard'}
                </button>
              </form>
              {error && (
                <p style={{ color: 'var(--coral)', fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
                  ❌ {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page active">
      <div className="section" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <div className="wrap admin-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ margin: 0, color: 'var(--teal)' }}>📊 Admin Dashboard</h1>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: '4px 0 0 0' }}>
                Manage service requests and helper assignments
              </p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setPassword('')
              }}
              style={{
                padding: '10px 16px',
                background: 'rgba(239, 111, 83, 0.15)',
                color: 'var(--coral)',
                border: '1px solid var(--coral)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Logout
            </button>
          </div>

          {stats && (
            <div className="admin-stats" style={{ marginBottom: '28px' }}>
              <div className="astat" style={{ background: 'linear-gradient(135deg, rgba(15, 61, 57, 0.08), rgba(29, 114, 104, 0.08))' }}>
                <b style={{ fontSize: '28px', color: 'var(--teal)' }}>{stats.totalRequests}</b>
                <span>Total Requests</span>
              </div>
              <div className="astat" style={{ background: 'linear-gradient(135deg, rgba(242, 169, 59, 0.08), rgba(255, 200, 100, 0.08))' }}>
                <b style={{ fontSize: '28px', color: '#F2A93B' }}>{stats.newRequests}</b>
                <span>New Requests</span>
              </div>
              <div className="astat" style={{ background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.08), rgba(150, 180, 230, 0.08))' }}>
                <b style={{ fontSize: '28px', color: '#6496C8' }}>{stats.contactedRequests}</b>
                <span>Contacted</span>
              </div>
              <div className="astat" style={{ background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.08), rgba(150, 230, 150, 0.08))' }}>
                <b style={{ fontSize: '28px', color: '#64C864' }}>{stats.completedRequests}</b>
                <span>Completed</span>
              </div>
            </div>
          )}

          <div className="admin-toolbar" style={{ marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
            <div className="filter-tabs" style={{ gap: '8px' }}>
              {['All', 'New', 'Contacted', 'Completed'].map(filter => (
                <button
                  key={filter}
                  className={`filter-tab ${currentFilter === filter ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    border: '1px solid var(--line-soft)',
                    background: currentFilter === filter ? 'var(--teal)' : 'var(--surface)',
                    color: currentFilter === filter ? '#fff' : 'var(--ink-soft)',
                    cursor: 'pointer',
                    fontWeight: currentFilter === filter ? '600' : '500',
                    fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
            <input
              className="admin-search"
              placeholder="🔍 Search by name, phone, area, ID…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 14px',
                border: '1px solid var(--line-soft)',
                borderRadius: '999px',
                background: 'var(--surface)',
                fontSize: '13px'
              }}
            />
          </div>

          <div id="adminList">
            {filteredRequests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--line-soft)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                <p style={{ color: 'var(--ink-faint)', fontSize: '14px' }}>
                  {searchQuery ? 'No matching requests found' : `No ${currentFilter.toLowerCase()} requests yet`}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredRequests.map(req => (
                  <div key={req.id} className="reg-card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: '14px',
                    padding: '16px',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      alignItems: 'flex-start',
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--teal)' }}>
                          {req.name || '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                          ID: {req.referenceId}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginBottom: '4px' }}>Phone</div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{req.phone || '—'}</div>
                      </div>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          background: req.status === 'New' ? 'rgba(242, 169, 59, 0.1)' : req.status === 'Contacted' ? 'rgba(100, 150, 200, 0.1)' : 'rgba(100, 200, 100, 0.1)',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="New">🟠 New</option>
                        <option value="Contacted">🔵 Contacted</option>
                        <option value="Completed">✅ Completed</option>
                      </select>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--line-soft)',
                      fontSize: '13px',
                      color: 'var(--ink-soft)'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: '600' }}>Address</div>
                        <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                          {[req.floor, req.building, req.street, req.area, req.city, req.pinCode].filter(Boolean).join(', ') || 'No address'}
                          {req.landmark && <div style={{ marginTop: '4px', color: 'var(--ink-faint)' }}>📍 {req.landmark}</div>}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: '600' }}>Location</div>
                        <div style={{ marginTop: '4px' }}>
                          {req.latitude && req.longitude ? (
                            <>
                              <div>{req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}</div>
                              <button
                                onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${req.latitude}&mlon=${req.longitude}&zoom=15`, '_blank')}
                                style={{
                                  marginTop: '6px',
                                  padding: '4px 10px',
                                  background: 'var(--line-soft)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'var(--ink)',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                🗺️ View Map
                              </button>
                            </>
                          ) : '—'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: '600' }}>Date & Time</div>
                        <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                          <div>{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : '—'}</div>
                          {req.preferredTime && <div>{req.preferredTime}</div>}
                        </div>
                      </div>
                    </div>

                    {(req.selectedServices && req.selectedServices.length > 0 || req.notes) && (
                      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--line-soft)', marginTop: '12px' }}>
                        {req.selectedServices && req.selectedServices.length > 0 && (
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Services</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {req.selectedServices.map((service, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: 'rgba(15, 61, 57, 0.1)',
                                    color: 'var(--teal)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {req.notes && (
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Notes</div>
                            <div style={{ fontSize: '13px', background: 'rgba(0,0,0,0.03)', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.4' }}>
                              {req.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {requests.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '12px',
              background: 'rgba(15, 61, 57, 0.05)',
              borderRadius: '10px',
              fontSize: '12px',
              color: 'var(--ink-faint)',
              textAlign: 'center'
            }}>
              Showing {filteredRequests.length} of {requests.length} requests • Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
