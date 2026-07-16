import { useState, useEffect } from 'react'
import { categoriesAPI, areasAPI, requestsAPI, CreateServiceRequestDTO, ServiceCategory, AreaCoordinate } from '../services/api'

interface RegisterPageProps {
  onNavigate: (page: string) => void
  onConfirm: (data: any) => void
  initialService?: string | null
  initialCategory?: string | null
}

declare global {
  interface Window {
    L: any
    __leafletMap: any
    __leafletMarker: any
  }
}

export default function RegisterPage({ onNavigate, onConfirm, initialService, initialCategory }: RegisterPageProps) {
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
    city: '',
    pinCode: '',
    landmark: '',
    latitude: BLR_CENTER[0],
    longitude: BLR_CENTER[1],
    category: '',
    selectedServices: [] as string[],
    preferredDate: '',
    preferredTime: '',
    notes: '',
    capturedAddress: ''
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

      if (initialCategory) {
        const matchedIndex = cats.findIndex(cat => cat.name === initialCategory)
        if (matchedIndex >= 0) {
          setFormData(prev => ({ ...prev, category: matchedIndex.toString() }))
        }
      }

      if (initialService) {
        setPickedServices([initialService])
      }
    }).catch(err => {
      console.error('Failed to load data:', err)
      setAreaLoadError('Failed to load areas. Check backend connectivity and API response. See console for details.')
    })
  }, [initialCategory, initialService])

  useEffect(() => {
    if (step === 3) {
      const timer = window.setTimeout(() => initMap(), 100)
      return () => window.clearTimeout(timer)
    }

    return () => {
      if (window.__leafletMap) {
        window.__leafletMap.remove()
        window.__leafletMap = null
        window.__leafletMarker = null
      }
    }
  }, [step])

  const getAreaName = (a: any) => a?.areaName ?? a?.area ?? a?.name ?? ''
  const getAreaPinCode = (a: any) => a?.pinCode ?? a?.pin ?? ''
  const getAreaKey = (a: any) => a?.id ?? getAreaPinCode(a) ?? getAreaName(a)
  const getDistanceSq = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dLat = lat1 - lat2
    const dLng = lng1 - lng2
    return dLat * dLat + dLng * dLng
  }

  const findNearestArea = (latitude: number, longitude: number) => {
    let nearest: AreaCoordinate | null = null
    let bestDist = Infinity
    for (const area of areas) {
      const dist = getDistanceSq(latitude, longitude, area.latitude, area.longitude)
      if (dist < bestDist) {
        bestDist = dist
        nearest = area
      }
    }
    // if the nearest area is within a reasonable distance (~2km), use it
    return bestDist <= 0.02 * 0.02 ? nearest : null
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: latitude.toString(),
        lon: longitude.toString(),
        addressdetails: '1',
        zoom: '18'
      })
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Sahayak/1.0 (sahayak.local)'
        }
      })
      if (!response.ok) throw new Error('Reverse geocode failed')
      const json = await response.json()
      const address = json.address ?? {}
      const street = [
        address.house_number,
        address.road,
        address.pedestrian,
        address.footway,
        address.cycleway,
        address.path,
        address.residential
      ].filter(Boolean).join(' ').trim()
      const building = address.building || address.housename || address.house || address.apartment || address.office || address.shop || address.amenity || ''
      const areaName = address.suburb || address.neighbourhood || address.village || address.town || address.hamlet || address.city_district || address.district || address.county || address.state_district || address.state || ''
      const pin = address.postcode ?? ''
      const city = address.city || address.town || address.village || address.county || address.state_district || address.state || ''
      const landmark = address.neighbourhood || address.suburb || address.hamlet || address.village || address.town || address.city_district || ''
      return {
        displayName: json.display_name ?? '',
        street,
        building,
        areaName,
        pin,
        city,
        landmark
      }
    } catch (err) {
      console.warn('Reverse geocode failed', err)
      return null
    }
  }

  const updateLocationFromCoords = async (latitude: number, longitude: number) => {
    const nearestArea = findNearestArea(latitude, longitude)
    const geoResult = await reverseGeocode(latitude, longitude)
    const chosenArea = geoResult?.areaName || (nearestArea ? getAreaName(nearestArea) : '')
    const chosenPin = geoResult?.pin || (nearestArea ? getAreaPinCode(nearestArea) : '')

    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
      street: geoResult?.street || prev.street,
      building: geoResult?.building || prev.building,
      area: chosenArea || prev.area,
      pinCode: chosenPin || prev.pinCode,
      city: geoResult?.city || prev.city,
      landmark: prev.landmark || geoResult?.landmark || prev.landmark,
      capturedAddress: prev.capturedAddress
    }))

    if (geoResult?.displayName) {
      setLocationMessage(`Location captured: ${geoResult.displayName}`)
      setLocationError('')
    } else if (chosenArea && chosenPin) {
      setLocationMessage(`Location captured: ${chosenArea} — PIN ${chosenPin}`)
      setLocationError('')
    } else if (nearestArea) {
      setLocationMessage(`Location detected: ${getAreaName(nearestArea)} — PIN ${getAreaPinCode(nearestArea)}`)
      setLocationError('')
    } else {
      setLocationMessage('Location captured. Please confirm the address details.')
    }
  }

  const initMap = () => {
    if (!window.L || !document.getElementById('mapPicker')) return
    if (window.__leafletMap) {
      window.__leafletMap.invalidateSize()
      setTimeout(() => window.__leafletMap?.invalidateSize(), 200)
      return
    }

    const initialLat = formData.latitude || BLR_CENTER[0]
    const initialLng = formData.longitude || BLR_CENTER[1]
    const map = window.L.map('mapPicker').setView([initialLat, initialLng], 14)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    const marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(map)

    marker.on('dragend', async (e: any) => {
      await updateLocationFromCoords(e.target.getLatLng().lat, e.target.getLatLng().lng)
    })

    map.on('click', async (e: any) => {
      marker.setLatLng(e.latlng)
      await updateLocationFromCoords(e.latlng.lat, e.latlng.lng)
    })

    window.__leafletMap = map
    window.__leafletMarker = marker

    setTimeout(() => map.invalidateSize(), 100)
    setTimeout(() => map.invalidateSize(), 250)
  }

  const updateMapReadout = (latlng: any) => {
    const lat = latlng.lat ?? latlng[0]
    const lng = latlng.lng ?? latlng[1]
    const nearestArea = findNearestArea(lat, lng)

    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      area: nearestArea ? getAreaName(nearestArea) : prev.area,
      pinCode: nearestArea ? getAreaPinCode(nearestArea) : prev.pinCode
    }))

    if (nearestArea) {
      setLocationMessage(`Location detected: ${getAreaName(nearestArea)} — PIN ${getAreaPinCode(nearestArea)}`)
      setLocationError('')
    } else {
      setLocationMessage('Location captured. Please confirm the correct area and PIN.')
    }
  }

  const applyAreaSelection = (area: AreaCoordinate) => {
    if (window.__leafletMap && window.__leafletMarker) {
      window.__leafletMap.setView([area.latitude, area.longitude], 14)
      window.__leafletMarker.setLatLng([area.latitude, area.longitude])
      updateMapReadout({ lat: area.latitude, lng: area.longitude })
    }
    const name = getAreaName(area)
    const pin = getAreaPinCode(area)
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
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        if (window.__leafletMap && window.__leafletMarker) {
          window.__leafletMap.setView([latitude, longitude], 14)
          window.__leafletMarker.setLatLng([latitude, longitude])
        }

        await updateLocationFromCoords(latitude, longitude)
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
      if (formData.category && pickedServices.length === 0) nextErrors['services'] = 'Choose at least one task'
    }
    if (s === 5) {
      if (!formData.preferredDate) nextErrors['preferredDate'] = 'Preferred date is required'
      if (!formData.preferredTime) nextErrors['preferredTime'] = 'Preferred time is required'
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
      if (formData.category && pickedServices.length === 0) e['services'] = 'Choose at least one task'
      setErrors(prev => ({ ...prev, ...e }))
      return Object.keys(e).length === 0
    })()
    const ok5 = ((): boolean => {
      const e: Record<string,string> = {}
      if (!formData.preferredDate) e['preferredDate'] = 'Preferred date is required'
      if (!formData.preferredTime) e['preferredTime'] = 'Preferred time is required'
      setErrors(prev => ({ ...prev, ...e }))
      return Object.keys(e).length === 0
    })()

    return ok1 && ok2 && ok4 && ok5
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
                      <label htmlFor="name" className="required">Full name</label>
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
                      <label htmlFor="phone" className="required">Phone number</label>
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
                        <label htmlFor="floor" className="required">Flat / floor no.</label>
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
                        <label htmlFor="building" className="required">Building / house name</label>
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
                      <label htmlFor="street" className="required">Street / road</label>
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
                        <label htmlFor="area" className="required">Area / locality</label>
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
                        <label htmlFor="city" className="required">City</label>
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
                        <label htmlFor="pinCode" className="required">PIN code</label>
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
                        {formData.area
                          ? `📍 ${formData.area}${formData.pinCode ? ` — PIN ${formData.pinCode}` : ''}`
                          : '📍 No captured address yet. Use Locate me to capture your current area.'}
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
                      <label htmlFor="category" className="required">Category needed</label>
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
                      <label>Specific tasks</label>
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
                      {errors.services && (
                        <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.services}</div>
                      )}
                    </div>
                    <div className="fee-note">
                      <div className="icon">💳</div>
                      <div>Only a service fee will be charged after task completion — no hidden fees, no extra markups.</div>
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
                        <label htmlFor="date" className="required">Preferred date</label>
                        <input
                          id="date"
                          name="preferredDate"
                          type="date"
                          required
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                        />
                        {errors.preferredDate && (
                          <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.preferredDate}</div>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor="time" className="required">Preferred time</label>
                        <input
                          id="time"
                          name="preferredTime"
                          type="time"
                          required
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                        />
                        {errors.preferredTime && (
                          <div style={{ color: 'var(--marigold)', fontSize: '12px', marginTop: '6px' }}>{errors.preferredTime}</div>
                        )}
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
