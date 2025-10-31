/** @format */

"use client"

import { useState, useEffect, useRef } from "react"
import {
  MapPin,
  Loader2,
  Edit3,
  Save,
  X,
  Search,
  Trash2,
  AlertCircle,
} from "lucide-react"

// API Configuration
const API_BASE_URL = "http://localhost:8000/api"
const GEMINI_API_KEY = "AIzaSyCvRs2ncOgfks2BbHsw9xDlyuxHiMXDIHA"

// Generic Modal wrapper (default export)
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      <div className='relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-white'>{title}</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

// Zone Map Modal Component
function ZoneMapModal({ isOpen, onClose, onSave, editZone = null }) {
  const [location, setLocation] = useState(editZone?.location || null)
  const [name, setName] = useState(editZone?.name || "")
  const [description, setDescription] = useState(editZone?.description || "")
  const [address, setAddress] = useState(editZone?.address || "")
  const [zoneType, setZoneType] = useState(editZone?.zoneType || "")
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [recommendations, setRecommendations] = useState(
    editZone?.recommendations || []
  )
  const [editingIndex, setEditingIndex] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      loadLeaflet()

      // Load saved data for editing
      if (editZone) {
        setLocation(editZone.location)
        setName(editZone.name)
        setDescription(editZone.description)
        setAddress(editZone.address)
        setZoneType(editZone.zoneType || "")
        setNearbyPlaces(editZone.nearbyPlaces || [])
        setRecommendations(editZone.recommendations || [])
      }
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, editZone])

  const loadLeaflet = () => {
    if (window.L) {
      initMap()
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
    script.onload = initMap
    document.body.appendChild(script)
  }

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return

    const L = window.L
    const initialLocation = location || { lat: 36.8065, lng: 10.1815 }
    const map = L.map(mapRef.current).setView(
      [initialLocation.lat, initialLocation.lng],
      13
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Add existing marker if editing
    if (location) {
      markerRef.current = L.marker([location.lat, location.lng]).addTo(map)
    }

    map.on("click", handleMapClick)
    mapInstanceRef.current = map
  }

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng
    setLocation({ lat, lng })

    const L = window.L
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
    }

    // Get address and nearby places
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      setAddress(data.display_name || "Unknown location")

      // Determine zone type from address
      const addressType = data.type || ""
      const category = data.class || ""
      setZoneType(category || addressType || "general")
    } catch (error) {
      console.error("Geocoding error:", error)
      setAddress("Location selected")
    }

    // Fetch nearby places
    await fetchNearbyPlaces(lat, lng)
  }

  const fetchNearbyPlaces = async (lat, lng) => {
    setLoadingPlaces(true)
    try {
      // Using Overpass API to find nearby points of interest
      const query = `
        [out:json];
        (
          node(around:500,${lat},${lng})[amenity];
          node(around:500,${lat},${lng})[shop];
          node(around:500,${lat},${lng})[building~"school|university|hospital|government"];
        );
        out body;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      })

      const data = await response.json()
      const places = data.elements.slice(0, 10).map((element) => ({
        name:
          element.tags.name ||
          element.tags.amenity ||
          element.tags.shop ||
          "Unnamed",
        type:
          element.tags.amenity ||
          element.tags.shop ||
          element.tags.building ||
          "place",
        distance: calculateDistance(lat, lng, element.lat, element.lon),
      }))

      setNearbyPlaces(places)
    } catch (error) {
      console.error("Error fetching nearby places:", error)
      setNearbyPlaces([])
    } finally {
      setLoadingPlaces(false)
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c) // Distance in meters
  }

  const getAIRecommendations = async () => {
    if (!location || !address) {
      alert("Please select a location on the map first")
      return
    }

    setLoadingRecommendations(true)
    try {
      const placesContext =
        nearbyPlaces.length > 0
          ? `Nearby places include: ${nearbyPlaces
              .map((p) => `${p.name} (${p.type}, ${p.distance}m away)`)
              .join(", ")}.`
          : ""

      const prompt = `As a security expert, analyze this location and provide specific security recommendations:

Location: ${address}
Zone Type: ${zoneType || "general area"}
${placesContext}

Provide 5-7 specific, actionable security recommendations for this location. Consider:
- Physical security measures
- Surveillance and monitoring
- Access control
- Perimeter security
- Emergency response
- Risk mitigation specific to nearby facilities

Return your response as a JSON array of strings only, no other text. Format: ["recommendation 1", "recommendation 2", ...]`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      )

      const data = await response.json()

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text.trim()

        // Extract JSON array from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/)

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setRecommendations(parsed)
        } else {
          // If no JSON array found, split by newlines and clean up
          const lines = content
            .split("\n")
            .filter(
              (line) =>
                line.trim() && !line.startsWith("[") && !line.startsWith("]")
            )
            .map((line) =>
              line
                .replace(/^[-*•]\s*/, "")
                .replace(/^\d+\.\s*/, "")
                .replace(/^["']|["']$/g, "")
                .trim()
            )
            .filter((line) => line.length > 10)

          if (lines.length > 0) {
            setRecommendations(lines)
          } else {
            throw new Error("Could not parse recommendations")
          }
        }
      } else {
        throw new Error("Invalid API response")
      }
    } catch (error) {
      console.error("AI Error:", error)
      alert("Failed to get AI recommendations. Please try again.")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleSaveZone = () => {
    if (!location || !address || !name) {
      alert("Please provide zone name and select a location on the map")
      return
    }

    onSave({
      id: editZone?.id,
      name,
      description,
      location,
      address,
      zoneType,
      nearbyPlaces,
      recommendations,
      status: "active",
    })

    // Reset form
    setName("")
    setDescription("")
    setLocation(null)
    setAddress("")
    setZoneType("")
    setNearbyPlaces([])
    setRecommendations([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      <div className='relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-6 border-b border-slate-800'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center'>
              <MapPin className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-xl font-bold text-white'>
              {editZone ? "Edit Zone" : "Add New Zone"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Zone Name */}
          <div>
            <label className='block text-sm font-semibold text-slate-300 mb-2'>
              Zone Name *
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
              placeholder='e.g., Zone 1'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-semibold text-slate-300 mb-2'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none'
              rows='3'
              placeholder='Security zone description...'
            />
          </div>

          {/* Map */}
          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-slate-300'>
              Click on the map to select a location *
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

          {/* Nearby Places */}
          {nearbyPlaces.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-slate-300 flex items-center gap-2'>
                📍 Nearby Places
                {loadingPlaces && <Loader2 className='w-4 h-4 animate-spin' />}
              </h3>
              <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto'>
                {nearbyPlaces.map((place, idx) => (
                  <div
                    key={idx}
                    className='p-2 bg-slate-800/30 border border-slate-700 rounded-lg'
                  >
                    <p className='text-xs font-medium text-white truncate'>
                      {place.name}
                    </p>
                    <p className='text-xs text-slate-400'>
                      {place.type} • {place.distance}m
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations Button */}
          {location && (
            <div className='flex gap-3'>
              <button
                onClick={getAIRecommendations}
                disabled={loadingRecommendations}
                className='flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {loadingRecommendations ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Generating Recommendations...
                  </>
                ) : (
                  <>🤖 Get AI Security Recommendations</>
                )}
              </button>
            </div>
          )}

          {/* Recommendations List */}
          {recommendations.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  🛡️ Security Recommendations ({recommendations.length})
                </h3>
                <button
                  onClick={() => {
                    const newRec = prompt("Enter new security recommendation:")
                    if (newRec && newRec.trim()) {
                      setRecommendations([...recommendations, newRec.trim()])
                    }
                  }}
                  className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm font-medium flex items-center gap-1'
                >
                  ➕ Add Custom
                </button>
              </div>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className='bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all'
                  >
                    {editingIndex === index ? (
                      <div className='space-y-2'>
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className='w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
                          rows='3'
                          autoFocus
                        />
                        <div className='flex gap-2'>
                          <button
                            onClick={() => {
                              const updated = [...recommendations]
                              updated[index] = editedText
                              setRecommendations(updated)
                              setEditingIndex(null)
                            }}
                            className='px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1 font-medium'
                          >
                            <Save className='w-4 h-4' />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className='px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm font-medium'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 flex items-start gap-2'>
                          <span className='text-cyan-400 font-bold text-sm mt-0.5'>
                            {index + 1}.
                          </span>
                          <p className='text-sm text-slate-300 leading-relaxed'>
                            {rec}
                          </p>
                        </div>
                        <div className='flex gap-1'>
                          <button
                            onClick={() => {
                              setEditingIndex(index)
                              setEditedText(rec)
                            }}
                            className='p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-all'
                            title='Edit recommendation'
                          >
                            <Edit3 className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Reject this recommendation?")) {
                                setRecommendations(
                                  recommendations.filter((_, i) => i !== index)
                                )
                              }
                            }}
                            className='p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all'
                            title='Reject recommendation'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className='flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
                <AlertCircle className='w-5 h-5 text-blue-400 shrink-0' />
                <p className='text-xs text-blue-300'>
                  You can edit any recommendation, add custom ones, or reject
                  suggestions that don't fit your needs.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4'>
            <button
              onClick={handleSaveZone}
              disabled={!location || !name}
              className='flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50'
            >
              💾 {editZone ? "Update Zone" : "Save Zone"}
            </button>
            <button
              onClick={onClose}
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

// Main Zones Management Component
export function ZonesManagement() {
  const [zones, setZones] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch zones from backend
  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/zones/`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setZones(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching zones:", err)
      setError(
        "Failed to load zones. Make sure the backend is running on http://localhost:8000"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSaveZone = async (zoneData) => {
    try {
      const url = zoneData.id
        ? `${API_BASE_URL}/zones/${zoneData.id}/`
        : `${API_BASE_URL}/zones/`

      const method = zoneData.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(zoneData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const savedZone = await response.json()

      if (zoneData.id) {
        setZones(zones.map((z) => (z.id === savedZone.id ? savedZone : z)))
      } else {
        setZones([...zones, savedZone])
      }

      setIsModalOpen(false)
      setEditingZone(null)
    } catch (err) {
      console.error("Error saving zone:", err)
      alert("Failed to save zone. Check console for details.")
    }
  }

  const handleDeleteZone = async (zoneId) => {
    if (!confirm("Are you sure you want to delete this zone?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/zones/${zoneId}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setZones(zones.filter((z) => z.id !== zoneId))
    } catch (err) {
      console.error("Error deleting zone:", err)
      alert("Failed to delete zone")
    }
  }

  const handleEditZone = (zone) => {
    setEditingZone(zone)
    setIsModalOpen(true)
  }

  const filteredZones = zones.filter(
    (zone) =>
      zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Zones Sensibles
            </h1>
            <p className='text-slate-400'>
              Monitor and manage sensitive security zones
            </p>
          </div>
          <button
            onClick={() => {
              setEditingZone(null)
              setIsModalOpen(true)
            }}
            className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2'
          >
            <MapPin className='w-5 h-5' />
            Add Zone with Map
          </button>
        </div>

        {/* Search */}
        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search zones by name, description, or address...'
              className='w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500'
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3'>
            <AlertCircle className='w-5 h-5 text-red-400' />
            <p className='text-red-400'>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 text-cyan-400 animate-spin' />
          </div>
        )}

        {/* Zones Grid */}
        {!loading && filteredZones.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-slate-400'>
              No zones found. Click "Add Zone with Map" to create one.
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className='bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all'
            >
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-bold text-white mb-1'>
                    {zone.name}
                  </h3>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                        zone.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-600/20 text-slate-400"
                      }`}
                    >
                      {zone.status}
                    </span>
                    {zone.zoneType && (
                      <span className='inline-block px-2 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400'>
                        {zone.zoneType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className='text-sm text-slate-400 mb-4'>{zone.description}</p>

              {zone.address && (
                <div className='flex items-start gap-2 mb-4 p-3 bg-slate-900/50 rounded-lg'>
                  <MapPin className='w-4 h-4 text-cyan-400 shrink-0 mt-0.5' />
                  <p className='text-xs text-slate-300'>{zone.address}</p>
                </div>
              )}

              {zone.nearbyPlaces && zone.nearbyPlaces.length > 0 && (
                <div className='mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700'>
                  <p className='text-xs text-slate-400 mb-2 font-semibold'>
                    📍 Nearby:{" "}
                    {zone.nearbyPlaces
                      .slice(0, 3)
                      .map((p) => p.name)
                      .join(", ")}
                    {zone.nearbyPlaces.length > 3 &&
                      ` +${zone.nearbyPlaces.length - 3} more`}
                  </p>
                </div>
              )}

              {zone.recommendations && zone.recommendations.length > 0 && (
                <div className='mb-4'>
                  <p className='text-xs text-emerald-400 font-semibold'>
                    🛡️ {zone.recommendations.length} security recommendations
                  </p>
                </div>
              )}

              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditZone(zone)}
                  className='flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2 text-sm'
                >
                  <Edit3 className='w-4 h-4' />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteZone(zone.id)}
                  className='flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm'
                >
                  <Trash2 className='w-4 h-4' />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <ZoneMapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingZone(null)
        }}
        onSave={handleSaveZone}
        editZone={editingZone}
      />
    </div>
  )
}