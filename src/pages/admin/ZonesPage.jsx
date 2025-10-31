/** @format */

import { useState, useEffect, useRef } from "react"
import {
  MapPin,
  Loader2,
  Edit3,
  Save,
  X,
  AlertCircle,
  Map,
  Shield,
  Eye,
  Trash2,
  Plus,
} from "lucide-react"

// API Configuration - ONLY BACKEND URL NEEDED
const API_BASE_URL = "http://127.0.0.1:8000/api/zones/"

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("access") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ZoneMapModal Component
function ZoneMapModal({ isOpen, onClose, title, onSave }) {
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState("")
  const [zoneType, setZoneType] = useState("")
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [error, setError] = useState("")
  const [isAddingCustomRec, setIsAddingCustomRec] = useState(false)
  const [newRecText, setNewRecText] = useState("")
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const placeMarkersRef = useRef([])
  const leafletLoadedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      loadLeaflet()
    } else {
      document.body.style.overflow = "unset"
      cleanupMap()
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const cleanupMap = () => {
    placeMarkersRef.current.forEach((marker) => {
      try {
        marker.remove()
      } catch (e) {}
    })
    placeMarkersRef.current = []

    if (markerRef.current) {
      try {
        markerRef.current.remove()
      } catch (e) {}
      markerRef.current = null
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
      } catch (e) {}
      mapInstanceRef.current = null
    }
  }

  const loadLeaflet = () => {
    if (leafletLoadedRef.current && window.L) {
      setTimeout(initMap, 100)
      return
    }

    if (window.L) {
      leafletLoadedRef.current = true
      setTimeout(initMap, 100)
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"

    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link)
    }

    const script = document.createElement("script")
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"

    if (!document.querySelector(`script[src="${script.src}"]`)) {
      script.onload = () => {
        leafletLoadedRef.current = true
        setTimeout(initMap, 100)
      }
      document.body.appendChild(script)
    } else {
      leafletLoadedRef.current = true
      setTimeout(initMap, 100)
    }
  }

  const initMap = () => {
    if (!mapRef.current) return

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
      } catch (e) {}
      mapInstanceRef.current = null
    }

    if (!window.L) return

    try {
      const L = window.L
      const map = L.map(mapRef.current).setView([36.8065, 10.1815], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      map.on("click", handleMapClick)
      mapInstanceRef.current = map

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 100)
    } catch (e) {
      console.error("Map initialization error:", e)
    }
  }

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng
    setLocation({ lat, lng })
    setError("")

    const L = window.L
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      setAddress(data.display_name || "Unknown location")

      const addressType = data.type || ""
      const category = data.class || ""
      setZoneType(category || addressType || "general")
    } catch (error) {
      console.error("Geocoding error:", error)
      setAddress("Location selected")
    }

    await fetchNearbyPlaces(lat, lng)
  }

  const fetchNearbyPlaces = async (lat, lng) => {
    setLoadingPlaces(true)
    placeMarkersRef.current.forEach((marker) => {
      try {
        marker.remove()
      } catch (e) {}
    })
    placeMarkersRef.current = []

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const query = `[out:json][timeout:10];(node(around:500,${lat},${lng})[amenity];node(around:500,${lat},${lng})[shop];node(around:500,${lat},${lng})[building~"school|university|hospital|government"];);out body 10;`

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.warn("Could not parse Overpass response")
        setNearbyPlaces([])
        setLoadingPlaces(false)
        return
      }

      if (!data.elements || data.elements.length === 0) {
        setNearbyPlaces([])
        setLoadingPlaces(false)
        return
      }

      const places = data.elements.slice(0, 10).map((element) => {
        const placeName =
          element.tags.name ||
          element.tags["name:en"] ||
          element.tags["name:ar"] ||
          element.tags.amenity ||
          element.tags.shop ||
          "Unnamed"

        return {
          name: placeName,
          type:
            element.tags.amenity ||
            element.tags.shop ||
            element.tags.building ||
            "place",
          distance: calculateDistance(lat, lng, element.lat, element.lon),
          lat: element.lat,
          lon: element.lon,
        }
      })

      setNearbyPlaces(places)

      if (window.L && mapInstanceRef.current) {
        const L = window.L
        places.forEach((place, index) => {
          const marker = L.marker([place.lat, place.lon], {
            icon: L.divIcon({
              className: "custom-marker",
              html: `<div style="background: #06b6d4; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
                index + 1
              }</div>`,
              iconSize: [24, 24],
            }),
          }).addTo(mapInstanceRef.current)

          marker.on("click", () => handlePlaceClick(index))
          placeMarkersRef.current.push(marker)
        })
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Overpass API request timed out")
      } else {
        console.warn("Error fetching nearby places:", error)
      }
      setNearbyPlaces([])
    } finally {
      setLoadingPlaces(false)
    }
  }

  const handlePlaceClick = (index) => {
    setSelectedPlaceIndex(index)
    const place = nearbyPlaces[index]

    if (window.L && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([place.lat, place.lon])
      mapInstanceRef.current.setView([place.lat, place.lon], 16)
    }

    setLocation({ lat: place.lat, lng: place.lon })
    setAddress(`${place.name} - ${place.type}`)
    setZoneType(place.type)
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  // ✅ NOW USING BACKEND FOR AI RECOMMENDATIONS
  const getAIRecommendations = async () => {
    if (!location) {
      setError("Please select a location on the map first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const selectedPlace =
        selectedPlaceIndex !== null ? nearbyPlaces[selectedPlaceIndex] : null

      // Call BACKEND API instead of Gemini directly
      const response = await fetch(`${API_BASE_URL}get_recommendations/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          address: selectedPlace
            ? `${selectedPlace.name} (${selectedPlace.type})`
            : address,
          zone_type: selectedPlace ? selectedPlace.type : zoneType || "general",
          nearby_places: nearbyPlaces,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations)
      } else {
        throw new Error("Invalid recommendations format from backend")
      }
    } catch (error) {
      console.error("AI Error:", error)
      setError(
        error.message || "Failed to get recommendations. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setEditedText(recommendations[index])
  }

  const handleSaveEdit = (index) => {
    const updated = [...recommendations]
    updated[index] = editedText
    setRecommendations(updated)
    setEditingIndex(null)
  }

  const handleDelete = (index) => {
    setRecommendations(recommendations.filter((_, i) => i !== index))
  }

  const handleAddCustomRec = () => {
    if (newRecText.trim()) {
      setRecommendations([...recommendations, newRecText.trim()])
      setNewRecText("")
      setIsAddingCustomRec(false)
    }
  }

  const handleSaveZone = () => {
    if (!location || !address) {
      setError("Please select a location on the map")
      return
    }

    const selectedPlace =
      selectedPlaceIndex !== null ? nearbyPlaces[selectedPlaceIndex] : null

    const zoneData = {
      location,
      address,
      recommendations,
      nearbyPlaces,
      zoneType: zoneType || "general",
      selectedPlace,
    }

    onSave(zoneData)
    handleClose()
  }

  const handleClose = () => {
    setLocation(null)
    setAddress("")
    setZoneType("")
    setNearbyPlaces([])
    setSelectedPlaceIndex(null)
    setRecommendations([])
    setError("")
    setEditingIndex(null)
    setIsAddingCustomRec(false)
    setNewRecText("")

    cleanupMap()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={handleClose}
      ></div>

      <div className='relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-6 border-b border-slate-800'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center'>
              <MapPin className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-xl font-bold text-white'>{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {error && (
            <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-red-400 shrink-0 mt-0.5' />
              <p className='text-sm text-red-400'>{error}</p>
            </div>
          )}

          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-slate-300'>
              Click on the map to select a location
            </label>
            <div
              ref={mapRef}
              className='w-full h-96 rounded-xl overflow-hidden border-2 border-slate-700'
            ></div>
            {address && (
              <div className='flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700'>
                <MapPin className='w-5 h-5 text-cyan-400 shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm text-slate-300'>{address}</p>
                  {zoneType && (
                    <p className='text-xs text-cyan-400 mt-1'>
                      Type: {zoneType}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {nearbyPlaces.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-slate-300 flex items-center gap-2'>
                📍 Nearby Places
                {loadingPlaces && <Loader2 className='w-4 h-4 animate-spin' />}
              </h3>
              <div className='grid grid-cols-2 gap-2 max-h-48 overflow-y-auto'>
                {nearbyPlaces.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePlaceClick(idx)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPlaceIndex === idx
                        ? "bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/50"
                        : "bg-slate-800/30 border-slate-700 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className='flex items-start gap-2'>
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          selectedPlaceIndex === idx
                            ? "bg-cyan-500 text-white"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-white truncate'>
                          {place.name}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {place.type} • {place.distance}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={getAIRecommendations}
            disabled={loading || !location}
            className='w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Generating Recommendations...
              </>
            ) : (
              "🤖 Get AI Security Recommendations"
            )}
          </button>

          {recommendations.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  🛡️ Security Recommendations ({recommendations.length})
                </h3>
                <button
                  onClick={() => setIsAddingCustomRec(true)}
                  className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm font-medium flex items-center gap-1'
                >
                  <Plus className='w-4 h-4' />
                  Add Custom
                </button>
              </div>

              {isAddingCustomRec && (
                <div className='bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2'>
                  <textarea
                    value={newRecText}
                    onChange={(e) => setNewRecText(e.target.value)}
                    placeholder='Enter your custom security recommendation...'
                    className='w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500'
                    rows='3'
                    autoFocus
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleAddCustomRec}
                      disabled={!newRecText.trim()}
                      className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1 font-medium disabled:opacity-50'
                    >
                      <Save className='w-4 h-4' />
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCustomRec(false)
                        setNewRecText("")
                      }}
                      className='px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className='bg-slate-800/50 border border-slate-700 rounded-lg p-4'
                  >
                    {editingIndex === index ? (
                      <div className='space-y-2'>
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className='w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
                          rows='3'
                        />
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleSaveEdit(index)}
                            className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1'
                          >
                            <Save className='w-4 h-4' />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className='px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 flex items-start gap-2'>
                          <span className='text-cyan-400 font-bold text-sm mt-0.5'>
                            -
                          </span>
                          <p className='text-sm text-slate-300 leading-relaxed'>
                            {rec}
                          </p>
                        </div>
                        <div className='flex gap-1'>
                          <button
                            onClick={() => handleEdit(index)}
                            className='p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-all'
                          >
                            <Edit3 className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className='p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-3 pt-4'>
            <button
              onClick={handleSaveZone}
              disabled={!location}
              className='flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50'
            >
              💾 Save Zone
            </button>
            <button
              onClick={handleClose}
              className='flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-all'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Zones Page Component
export default function ZonesPage() {
  const [zones, setZones] = useState([])
  const [showMapModal, setShowMapModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    recommendations: [],
  })
  const [editingRecIndex, setEditingRecIndex] = useState(null)
  const [editedRecText, setEditedRecText] = useState("")
  const [isAddingRec, setIsAddingRec] = useState(false)
  const [newRecText, setNewRecText] = useState("")

  // Professional modal states
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    zoneId: null,
    zoneName: "",
  })
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "",
    message: "",
  })
  const [successModal, setSuccessModal] = useState({ show: false, message: "" })

  useEffect(() => {
    fetchZones()
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const zonesArray = Array.isArray(data) ? data : data.results || []
      setZones(zonesArray)
      setError(null)
    } catch (err) {
      console.error("Error fetching zones:", err)
      setError(err.message || "Failed to load zones")
    } finally {
      setLoading(false)
    }
  }

  const filteredZones = Array.isArray(zones)
    ? zones.filter(
        (z) =>
          z.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          z.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (z.address &&
            z.address.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : []

  const getSecurityLevel = (zone) => {
    const recCount = zone.recommendations?.length || 0
    if (recCount >= 6) return { level: "Critical", color: "red" }
    if (recCount >= 4) return { level: "High", color: "orange" }
    if (recCount >= 2) return { level: "Medium", color: "yellow" }
    return { level: "Low", color: "green" }
  }

  const getSecurityLevelStyles = (color) => {
    const styles = {
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return styles[color] || styles.green
  }

  const handleSaveFromMap = async (mapData) => {
    try {
      let zoneName = "Security Zone"
      let displayAddress = mapData.address || ""

      if (mapData.selectedPlace) {
        zoneName = mapData.selectedPlace.name
        if (mapData.address) {
          const parts = mapData.address.split(",").slice(0, 3)
          displayAddress = parts.join(", ").trim()
        }
      } else if (mapData.nearbyPlaces && mapData.nearbyPlaces.length > 0) {
        zoneName = mapData.nearbyPlaces[0].name
        if (mapData.address) {
          const parts = mapData.address.split(",").slice(0, 3)
          displayAddress = parts.join(", ").trim()
        }
      } else if (mapData.address) {
        const addressParts = mapData.address.split(",")
        zoneName = addressParts[0].trim()
        displayAddress = mapData.address
      }

      const recCount = mapData.recommendations?.length || 0
      let securityLevel = "Low"
      if (recCount >= 6) {
        securityLevel = "Critical"
      } else if (recCount >= 4) {
        securityLevel = "High"
      } else if (recCount >= 2) {
        securityLevel = "Medium"
      }

      const newZone = {
        name: zoneName,
        description: `Security Level: ${securityLevel} - ${recCount} recommendations identified`,
        status: "active",
        latitude: mapData.location.lat,
        longitude: mapData.location.lng,
        address: displayAddress,
        zone_type: mapData.zoneType || "general",
        nearby_places: mapData.nearbyPlaces || [],
        recommendations: mapData.recommendations || [],
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newZone),
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          console.error("Server error:", errorData)
          errorMessage =
            errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch (parseErr) {
          console.error("Could not parse error response")
        }
        throw new Error(errorMessage)
      }

      const savedZone = await response.json()
      setZones([savedZone, ...zones])
      setShowMapModal(false)
      setSuccessModal({
        show: true,
        message: "Security zone created successfully",
      })
      setTimeout(() => setSuccessModal({ show: false, message: "" }), 3000)
    } catch (err) {
      console.error("Error saving zone:", err)
      setErrorModal({
        show: true,
        title: "Failed to Create Zone",
        message:
          err.message ||
          "An error occurred while creating the security zone. Please try again.",
      })
    }
  }

  const handleEdit = (zone) => {
    setFormData({
      name: zone.name,
      description: zone.description,
      status: zone.status,
      recommendations: Array.isArray(zone.recommendations)
        ? [...zone.recommendations]
        : [],
    })
    setEditingId(zone.id)
    setShowEditModal(true)
  }

  const handleUpdateZone = async () => {
    if (!formData.name) return

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        recommendations: formData.recommendations,
      }

      const response = await fetch(`${API_BASE_URL}${editingId}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedZone = await response.json()
      setZones(zones.map((z) => (z.id === editingId ? updatedZone : z)))
      setEditingId(null)
      setFormData({
        name: "",
        description: "",
        status: "active",
        recommendations: [],
      })
      setShowEditModal(false)
      setEditingRecIndex(null)
      setIsAddingRec(false)
      setNewRecText("")
      setSuccessModal({
        show: true,
        message: "Zone updated successfully",
      })
      setTimeout(() => setSuccessModal({ show: false, message: "" }), 3000)
    } catch (err) {
      console.error("Error updating zone:", err)
      setErrorModal({
        show: true,
        title: "Update Failed",
        message:
          err.message ||
          "An error occurred while updating the zone. Please try again.",
      })
    }
  }

  const handleEditRec = (index) => {
    setEditingRecIndex(index)
    setEditedRecText(formData.recommendations[index])
  }

  const handleSaveRecEdit = (index) => {
    const updated = [...formData.recommendations]
    updated[index] = editedRecText
    setFormData({ ...formData, recommendations: updated })
    setEditingRecIndex(null)
  }

  const handleDeleteRec = (index) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter((_, i) => i !== index),
    })
  }

  const handleAddRec = () => {
    if (newRecText.trim()) {
      setFormData({
        ...formData,
        recommendations: [...formData.recommendations, newRecText.trim()],
      })
      setNewRecText("")
      setIsAddingRec(false)
    }
  }

  const handleDelete = (zone) => {
    setDeleteModal({
      show: true,
      zoneId: zone.id,
      zoneName: zone.name,
    })
  }

  const confirmDelete = async () => {
    const { zoneId } = deleteModal
    setDeleteModal({ show: false, zoneId: null, zoneName: "" })

    try {
      const response = await fetch(`${API_BASE_URL}${zoneId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete zone (Status: ${response.status})`)
      }

      setZones(zones.filter((z) => z.id !== zoneId))
      setSuccessModal({
        show: true,
        message: "Zone deleted successfully",
      })
      setTimeout(() => setSuccessModal({ show: false, message: "" }), 3000)
    } catch (err) {
      console.error("Error deleting zone:", err)
      setErrorModal({
        show: true,
        title: "Delete Failed",
        message:
          err.message ||
          "An error occurred while deleting the zone. Please try again.",
      })
    }
  }

  return (
    <div className='p-8 bg-slate-950 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>
              <span className='bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent'>
                Zones Sensibles
              </span>
            </h1>
            <p className='text-slate-400 text-lg'>
              Monitor and manage sensitive security zones
            </p>
          </div>
          <button
            onClick={() => setShowMapModal(true)}
            className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center gap-2'
          >
            <Map className='w-5 h-5' />
            Add Zone with Map
          </button>
        </div>

        <div className='mb-6'>
          <input
            type='text'
            placeholder='🔍 Search zones...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-5 py-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all'
          />
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3'>
            <AlertCircle className='w-5 h-5 text-red-400' />
            <p className='text-red-400'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 text-cyan-400 animate-spin' />
          </div>
        )}

        {!loading && filteredZones.length === 0 ? (
          <div className='text-center py-16'>
            <Shield className='w-16 h-16 text-slate-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-slate-400 mb-2'>
              No zones yet
            </h3>
            <p className='text-slate-500'>
              Click "Add Zone with Map" to create your first security zone
            </p>
          </div>
        ) : !loading ? (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredZones.map((zone) => {
              const securityInfo = getSecurityLevel(zone)
              return (
                <div
                  key={zone.id}
                  className='group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors'>
                          {zone.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-bold border ${getSecurityLevelStyles(
                            securityInfo.color
                          )}`}
                        >
                          {securityInfo.level}
                        </span>
                      </div>
                      <p className='text-sm text-slate-400 leading-relaxed mb-2'>
                        {zone.description}
                      </p>
                      {zone.address && (
                        <div className='flex items-start gap-2 mt-2 p-2 bg-slate-800/50 rounded-lg'>
                          <MapPin className='w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5' />
                          <p className='text-xs text-slate-500 line-clamp-2'>
                            {zone.address}
                          </p>
                        </div>
                      )}
                      {zone.zoneType && (
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium'>
                            {zone.zoneType}
                          </span>
                        </div>
                      )}
                      {Array.isArray(zone.recommendations) &&
                        zone.recommendations.length > 0 && (
                          <div className='flex items-center gap-2 mt-2'>
                            <Shield className='w-4 h-4 text-green-400' />
                            <span className='text-xs text-green-400'>
                              {zone.recommendations.length} recommendations
                            </span>
                          </div>
                        )}
                      {Array.isArray(zone.nearbyPlaces) &&
                        zone.nearbyPlaces.length > 0 && (
                          <div className='flex items-center gap-2 mt-1'>
                            <Eye className='w-4 h-4 text-blue-400' />
                            <span className='text-xs text-blue-400'>
                              {zone.nearbyPlaces.length} nearby places
                            </span>
                          </div>
                        )}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                        zone.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          zone.status === "active"
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      {zone.status}
                    </span>
                  </div>
                  <div className='flex gap-2 pt-4 border-t border-slate-800'>
                    <button
                      onClick={() => handleEdit(zone)}
                      className='flex-1 px-4 py-2.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30 font-medium'
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(zone)}
                      className='flex-1 px-4 py-2.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 font-medium'
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        <ZoneMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          title='Add New Security Zone'
          onSave={handleSaveFromMap}
        />

        {showEditModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
              className='absolute inset-0 bg-black/70 backdrop-blur-sm'
              onClick={() => setShowEditModal(false)}
            ></div>
            <div className='relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Edit Zone Details
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-slate-300 mb-2'>
                    Zone Name
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-300 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500'
                    rows='4'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-300 mb-2'>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  >
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </select>
                </div>

                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='block text-sm font-semibold text-slate-300'>
                      Security Recommendations
                    </label>
                    {!isAddingRec && (
                      <button
                        onClick={() => setIsAddingRec(true)}
                        className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1'
                      >
                        <Plus className='w-4 h-4' />
                        Add
                      </button>
                    )}
                  </div>

                  {isAddingRec && (
                    <div className='mb-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg'>
                      <textarea
                        value={newRecText}
                        onChange={(e) => setNewRecText(e.target.value)}
                        placeholder='Enter new recommendation...'
                        className='w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500'
                        rows='2'
                      />
                      <div className='flex gap-2 mt-2'>
                        <button
                          onClick={handleAddRec}
                          className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1'
                        >
                          <Save className='w-4 h-4' />
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingRec(false)
                            setNewRecText("")
                          }}
                          className='px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm'
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {formData.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className='bg-slate-800/50 border border-slate-700 rounded-lg p-3'
                      >
                        {editingRecIndex === index ? (
                          <div className='space-y-2'>
                            <textarea
                              value={editedRecText}
                              onChange={(e) => setEditedRecText(e.target.value)}
                              className='w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500'
                              rows='2'
                            />
                            <div className='flex gap-2'>
                              <button
                                onClick={() => handleSaveRecEdit(index)}
                                className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1'
                              >
                                <Save className='w-4 h-4' />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRecIndex(null)}
                                className='px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm'
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-start justify-between gap-3'>
                            <div className='flex-1 flex items-start gap-2'>
                              <span className='text-cyan-400 font-bold text-sm mt-0.5'>
                                -
                              </span>
                              <p className='text-sm text-slate-300 leading-relaxed'>
                                {rec}
                              </p>
                            </div>
                            <div className='flex gap-1'>
                              <button
                                onClick={() => handleEditRec(index)}
                                className='p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-all'
                              >
                                <Edit3 className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDeleteRec(index)}
                                className='p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {formData.recommendations.length === 0 && (
                      <p className='text-slate-500 text-sm text-center py-4'>
                        No recommendations yet
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex gap-3 pt-4'>
                  <button
                    onClick={handleUpdateZone}
                    disabled={!formData.name}
                    className='flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    💾 Update Zone
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className='flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
              className='absolute inset-0 bg-black/70 backdrop-blur-sm'
              onClick={() =>
                setDeleteModal({ show: false, zoneId: null, zoneName: "" })
              }
            ></div>
            <div className='relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center'>
                  <AlertCircle className='w-6 h-6 text-red-400' />
                </div>
                <h2 className='text-xl font-bold text-white'>
                  Confirm Deletion
                </h2>
              </div>
              <p className='text-slate-300 mb-2'>
                Are you sure you want to delete this security zone?
              </p>
              <p className='text-white font-semibold mb-4'>
                "{deleteModal.zoneName}"
              </p>
              <p className='text-sm text-slate-400 mb-6'>
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={confirmDelete}
                  className='flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all'
                >
                  Delete Zone
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({ show: false, zoneId: null, zoneName: "" })
                  }
                  className='flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {errorModal.show && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
              className='absolute inset-0 bg-black/70 backdrop-blur-sm'
              onClick={() =>
                setErrorModal({ show: false, title: "", message: "" })
              }
            ></div>
            <div className='relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center'>
                  <AlertCircle className='w-6 h-6 text-red-400' />
                </div>
                <h2 className='text-xl font-bold text-white'>
                  {errorModal.title}
                </h2>
              </div>
              <p className='text-slate-300 mb-6 leading-relaxed'>
                {errorModal.message}
              </p>
              <button
                onClick={() =>
                  setErrorModal({ show: false, title: "", message: "" })
                }
                className='w-full py-3 bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all'
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal.show && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
            <div className='bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl max-w-md w-full p-4 pointer-events-auto animate-fade-in'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
                  <Shield className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-white font-semibold'>
                  {successModal.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}