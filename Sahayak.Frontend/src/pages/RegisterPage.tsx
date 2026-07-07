import { useState, useEffect } from 'react'
import { categoriesAPI, areasAPI, requestsAPI, CreateServiceRequestDTO, ServiceCategory, AreaCoordinate } from '../services/api'

interface RegisterPageProps {
  onNavigate: (page: string) => void
  onConfirm: (data: any) => void
}

declare global {
  interface Window {
    L: any
    __leafletMap: any
    __leafletMarker: any
  }
}

export default function RegisterPage({ onNavigate, onConfirm }: RegisterPageProps) {
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [areas, setAreas] = useState<AreaCoordinate[]>([])
  const [pickedServices, setPickedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const BLR_CENTER = [12.9716, 77.5946]

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    floor: '',
    building: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    pinCode: '',
    landmark: '',
    latitude: BLR_CENTER[0],
    longitude: BLR_CENTER[1],
    category: '',
    selectedServices: [] as string[],
    preferredDate: '',
    preferredTime: '',
    notes: ''
  })

  const [locationError, setLocationError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [areaLoadError, setAreaLoadError] = useState('')

  useEffect(() => {
    Promise.all([
      categoriesAPI.getAll(),
      areasAPI.getAll()
    ]).then(([cats, areas]) => {
      setCategories(cats)
      setAreas(areas)
      if (!Array.isArray(areas) || areas.length === 0) {
        setAreaLoadError('No area data available yet. Please make sure the backend is running and returns /api/areas.')
      } else {
        setAreaLoadError('')
      }
    }).catch(err => {
      console.error('Failed to load data:', err)
      setAreaLoadError('Failed to load areas. Check backend connectivity and API response. See console for details.')
    })
  }, [])

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => initMap(), 100)
    }
  }, [step])

  const getAreaName = (a: any) => a?.areaName ?? a?.area ?? a?.name ?? ''
  const getAreaKey = (a: any) => a?.id ?? a?.pinCode ?? getAreaName(a)
  const initMap = () => {
    if (!window.L || !document.getElementById('mapPicker')) return
    if (window.__leafletMap) {
      window.__leafletMap.invalidateSize()
      setTimeout(() => window.__leafletMap?.invalidateSize(), 200)
      return
    }

    const map = window.L.map('mapPicker').setView(BLR_CENTER, 12)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    const marker = window.L.marker(BLR_CENTER, { draggable: true }).addTo(map)

    marker.on('drag', (e: any) => {
      updateMapReadout(e.target.getLatLng())
    })

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng)
      updateMapReadout(e.latlng)
    })

    window.__leafletMap = map
    window.__leafletMarker = marker

    setTimeout(() => map.invalidateSize(), 100)
    setTimeout(() => map.invalidateSize(), 250)
  }

  const updateMapReadout = (latlng: any) => {
    const lat = latlng.lat || latlng[0]
    const lng = latlng.lng || latlng[1]
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
  }

  const applyAreaSelection = (area: AreaCoordinate) => {
    if (window.__leafletMap && window.__leafletMarker) {
      window.__leafletMap.setView([area.latitude, area.longitude], 14)
      window.__leafletMarker.setLatLng([area.latitude, area.longitude])
      updateMapReadout({ lat: area.latitude, lng: area.longitude })
    }
    const name = getAreaName(area)
    const pin = area.pinCode ?? (area as any).pin ?? ''
    setFormData(prev => ({ ...prev, area: name, pinCode: pin }))
    setLocationError('')
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError('Locating you...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        if (window.__leafletMap && window.__leafletMarker) {
          window.__leafletMap.setView([latitude, longitude], 14)
          window.__leafletMarker.setLatLng([latitude, longitude])
          updateMapReadout({ lat: latitude, lng: longitude })
        }

        const nearbyArea = areas.find(a =>
          Math.abs(a.latitude - latitude) < 0.01 && Math.abs(a.longitude - longitude) < 0.01
        )

        setFormData(prev => ({
          ...prev,
          area: nearbyArea ? getAreaName(nearbyArea) : prev.area,
          pinCode: nearbyArea ? nearbyArea.pinCode : prev.pinCode,
          latitude,
          longitude
        }))

        setLocationError('')
        setLocationMessage(
          nearbyArea
            ? `Location detected: ${getAreaName(nearbyArea)} — PIN ${nearbyArea.pinCode}`
            : `Location detected. Please confirm the correct PIN after submitting.`
        )
      },
      (error) => {
        setLocationError('Unable to locate you. Please allow location access and try again.')
        setLocationMessage('')
        console.error('Geolocation error', error)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleConfirmAddress = () => {
    // validate step 2 before moving on
    if (!validateStep(2)) return
    goStep(4)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'pinCode') {
        const matched = areas.find(a => (a.pinCode === value.trim()) || ((a as any).pin === value.trim()))
            if (matched) {
              return { ...updated, area: getAreaName(matched) }
            }
      }
      // clear field-level error when user edits
      setErrors(prevErr => {
        if (!prevErr[name]) return prevErr
        const next = { ...prevErr }
        delete next[name]
        return next
      })
      return updated
    })
  }

  const handleAreaChange = (area: string) => {
    const found = areas.find(a => getAreaName(a) === area)
    if (found) {
      applyAreaSelection(found)
      return
    }
    setFormData(prev => ({ ...prev, area }))
  }

  const resetMapToCenter = () => {
    if (!window.__leafletMap || !window.__leafletMarker) return
    window.__leafletMap.setView(BLR_CENTER, 12)
    window.__leafletMarker.setLatLng(BLR_CENTER)
    updateMapReadout({ lat: BLR_CENTER[0], lng: BLR_CENTER[1] })
    setLocationError('')
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }))
    setPickedServices([])
  }

  const handleServiceToggle = (service: string) => {
    setPickedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  const goStep = (n: number) => {
    // moving forward -> validate current step
    if (n > step) {
      const ok = validateStep(step)
      if (!ok) return
    }
    setStep(n)
  }

  const validateStep = (s: number) => {
    const nextErrors: Record<string, string> = {}
    if (s === 1) {
      if (!formData.name.trim()) nextErrors['name'] = 'Full name is required'
      if (!/^\d{10}$/.test(formData.phone)) nextErrors['phone'] = 'Enter a valid 10-digit phone number'
    }
    if (s === 2) {
      if (!formData.floor.trim()) nextErrors['floor'] = 'Flat / floor is required'
      if (!formData.building.trim()) nextErrors['building'] = 'Building / house name is required'
      if (!formData.street.trim()) nextErrors['street'] = 'Street is required'
      if (!formData.area.trim()) nextErrors['area'] = 'Please select or search an area'
      if (!formData.city.trim()) nextErrors['city'] = 'City is required'
      if (!/^\d{6}$/.test(formData.pinCode)) nextErrors['pinCode'] = 'Enter a valid 6-digit PIN code'
    }
    if (s === 4) {
      if (!formData.category) nextErrors['category'] = 'Please select a category'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateAllBeforeSubmit = () => {
    // validate step 1,2 and 4 (essential fields)
    const ok1 = ((): boolean => {
      const e: Record<string,string> = {}
      if (!formData.name.trim()) e['name'] = 'Full name is required'
      if (!/^\d{10}$/.test(formData.phone)) e['phone'] = 'Enter a valid 10-digit phone number'
      setErrors(prev => ({ ...prev, ...e }))
      return Object.keys(e).length === 0
    })()
    const ok2 = ((): boolean => {
      const e: Record<string,string> = {}
      if (!formData.floor.trim()) e['floor'] = 'Flat / floor is required'
      if (!formData.building.trim()) e['building'] = 'Building / house name is required'
      if (!formData.street.trim()) e['street'] = 'Street is required'
      if (!formData.area.trim()) e['area'] = 'Please select or search an area'
      if (!formData.city.trim()) e['city'] = 'City is required'
      if (!/^\d{6}$/.test(formData.pinCode)) e['pinCode'] = 'Enter a valid 6-digit PIN code'
      setErrors(prev => ({ ...prev, ...e }))
      return Object.keys(e).length === 0
    })()
    const ok4 = ((): boolean => {
      const e: Record<string,string> = {}
      if (!formData.category) e['category'] = 'Please select a category'
      setErrors(prev => ({ ...prev, ...e }))
      return Object.keys(e).length === 0
    })()

    return ok1 && ok2 && ok4
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (!validateAllBeforeSubmit()) {
      setLoading(false)
      return
    }

    const selectedCat = formData.category ? categories[parseInt(formData.category)]?.name : ''

    const data: CreateServiceRequestDTO = {
      ...formData,
      category: selectedCat,
      selectedServices: pickedServices
    }

    try {
      const result = await requestsAPI.create(data)
      onConfirm({ referenceId: result.referenceId })
      onNavigate('confirm')
    } catch (err) {
      console.error('Failed to submit:', err)
      alert('Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = formData.category ? categories[parseInt(formData.category)] : null

  return (
    <section className="page active">
      <div className="section">
        <div className="wrap">
          <div className="form-shell">
            <div className="form-inner">
              <div className="progress-track">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`progress-seg ${i === step ? 'current' : i < step ? 'complete' : ''}`}>
                    <i style={{ width: i <= step ? '100%' : '0%' }}></i>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Your Details */}
                {step === 1 && (
                  <div className="step active">
                    <div className="form-top">
                      <div>
                        <div className="step-label">Step 1 of 5</div>
                        <h2>Your details</h2>
                        <p className="sub">So a helper knows who to call.</p>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="name">Full name</label>
                      <input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Ananya Rao"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      {errors.name && (
                        <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.name}</div>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="phone">Phone number</label>
                      <input
                        id="phone"
                        name="phone"
                        required
                        type="tel"
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {errors.phone && (
                        <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.phone}</div>
                      )}
                    </div>
                    <div className="wizard-actions">
                      <span></span>
                      <button type="button" className="btn-next" onClick={() => goStep(2)}>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Address */}
                {step === 2 && (
                  <div className="step active">
                    <div className="form-top">
                      <div>
                        <div className="step-label">Step 2 of 5</div>
                        <h2>Your address</h2>
                        <p className="sub">Full details so a helper can find you without a back-and-forth call.</p>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="floor">Flat / floor no.</label>
                        <input
                          id="floor"
                          name="floor"
                          required
                          placeholder="e.g. Flat 302, 3rd Floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                        />
                        {errors.floor && (
                          <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.floor}</div>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor="building">Building / house name</label>
                        <input
                          id="building"
                          name="building"
                          required
                          placeholder="e.g. Sunshine Apartments"
                          value={formData.building}
                          onChange={handleInputChange}
                        />
                        {errors.building && (
                          <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.building}</div>
                        )}
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="street">Street / road</label>
                      <input
                        id="street"
                        name="street"
                        required
                        placeholder="e.g. 12th Main Road"
                        value={formData.street}
                        onChange={handleInputChange}
                      />
                      {errors.street && (
                        <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.street}</div>
                      )}
                    </div>
                    <div className="field-row three">
                      <div className="field">
                        <label htmlFor="area">Area / locality (Bengaluru)</label>
                        <select
                          id="area"
                          required
                          value={formData.area}
                          onChange={(e) => handleAreaChange(e.target.value)}
                        >
                          <option value="">Select an area</option>
                          {areas.map(area => (
                            <option key={getAreaKey(area)} value={getAreaName(area)}>
                              {getAreaName(area)}{(area.pinCode || (area as any).pin) ? ` — ${area.pinCode ?? (area as any).pin}` : ''}
                            </option>
                          ))}
                        </select>
                        {areaLoadError && (
                          <div style={{ color: '#ffb3b3', fontSize: '12px', marginTop: '6px' }}>{areaLoadError}</div>
                        )}
                        {errors.area && (
                          <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.area}</div>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor="city">City</label>
                        <input
                          id="city"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                          {errors.city && (
                            <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.city}</div>
                          )}
                      </div>
                      <div className="field">
                        <label htmlFor="pinCode">PIN code</label>
                        <input
                          id="pinCode"
                          name="pinCode"
                          required
                          pattern="[0-9]{6}"
                          placeholder="560001"
                          value={formData.pinCode}
                          onChange={handleInputChange}
                        />
                          {errors.pinCode && (
                            <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.pinCode}</div>
                          )}
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="landmark">Landmark (optional)</label>
                      <input
                        id="landmark"
                        name="landmark"
                        placeholder="e.g. Near Metro Station"
                        value={formData.landmark}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="wizard-actions">
                      <button type="button" className="btn-back" onClick={() => goStep(1)}>
                        ← Back
                      </button>
                      <button type="button" className="btn-next" onClick={() => goStep(3)}>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Map */}
                {step === 3 && (
                  <div className="step active">
                    <div className="form-top">
                      <div>
                        <div className="step-label">Step 3 of 5</div>
                        <h2>Pin your exact location</h2>
                        <p className="sub">Locate yourself, search your area, or drag the marker so a helper can navigate straight to your door.</p>
                      </div>
                    </div>

                    <div className="field">
                      <label>Locate your current area</label>
                      <div className="address-search-row single-row">
                        <button
                          type="button"
                          className="btn-locate"
                          onClick={handleLocateMe}
                        >
                          Locate me
                        </button>
                        <button type="button" className="btn-secondary" onClick={resetMapToCenter}>
                          Reset map
                        </button>
                      </div>
                      {locationMessage && (
                        <div className="location-summary">
                          {locationMessage}
                        </div>
                      )}
                      {locationError && (
                        <div className="location-error">
                          {locationError}
                        </div>
                      )}
                    </div>

                    <div className="map-picker" id="mapPicker"></div>
                    <div className="map-actions">
                      <span className="map-readout">
                        📍 Latitude: {formData.latitude?.toFixed(4)}, Longitude: {formData.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <div className="wizard-actions">
                      <button type="button" className="btn-back" onClick={() => goStep(2)}>
                        ← Back
                      </button>
                      <button type="button" className="btn-next" onClick={handleConfirmAddress}>
                        Confirm & Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Category & Services */}
                {step === 4 && (
                  <div className="step active">
                    <div className="form-top">
                      <div>
                        <div className="step-label">Step 4 of 5</div>
                        <h2>What do you need help with?</h2>
                        <p className="sub">Pick a category, then any specific tasks that apply.</p>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="category">Category needed</label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat, idx) => (
                          <option key={cat.id} value={idx}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.category}</div>
                      )}
                    </div>
                    <div className="field">
                      <label>Specific tasks (optional)</label>
                      {currentCategory ? (
                        <div className="service-chips">
                          {currentCategory.items.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`service-chip ${pickedServices.includes(item) ? 'picked' : ''}`}
                              onClick={() => handleServiceToggle(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="hint">Choose a category to see options</span>
                      )}
                    </div>
                    <div className="wizard-actions">
                      <button type="button" className="btn-back" onClick={() => goStep(3)}>
                        ← Back
                      </button>
                      <button type="button" className="btn-next" onClick={() => goStep(5)}>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Schedule */}
                {step === 5 && (
                  <div className="step active">
                    <div className="step-label">Step 5 of 5</div>
                    <h2>Schedule it in</h2>
                    <p className="sub">Rough timing is fine — we'll confirm exact timing on the call.</p>
                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="date">Preferred date</label>
                        <input
                          id="date"
                          name="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="time">Preferred time</label>
                        <input
                          id="time"
                          name="preferredTime"
                          type="time"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="notes">Anything else Sahayak should know?</label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Gate code, special instructions, etc."
                        value={formData.notes}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    <div className="fee-note">
                      <div className="icon">💳</div>
                      <div>Only a service fee will be charged — no hidden fees, no extra markups.</div>
                    </div>
                    <div className="wizard-actions">
                      <button type="button" className="btn-back" onClick={() => goStep(4)}>
                        ← Back
                      </button>
                      <button type="submit" className="btn-next" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit request'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
