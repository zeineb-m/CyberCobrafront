"use client"

import { createContext, useContext, useState, useCallback } from "react"

const DataContext = createContext()

// Mock data for zones, objects, equipment, and cameras
const MOCK_DATA = {
  zones: [
    { id: "z1", name: "Zone A", description: "Main entrance area", status: "active" },
    { id: "z2", name: "Zone B", description: "Parking lot", status: "active" },
    { id: "z3", name: "Zone C", description: "Restricted area", status: "inactive" },
  ],
  objects: [
    { id: "o1", name: "Building A", zoneId: "z1", type: "structure", status: "operational" },
    { id: "o2", name: "Gate 1", zoneId: "z1", type: "gate", status: "operational" },
    { id: "o3", name: "Fence Section 1", zoneId: "z2", type: "fence", status: "operational" },
  ],
  equipment: [
    { id: "e1", name: "Camera 1", objectId: "o1", type: "camera", status: "online", lastCheck: new Date() },
    { id: "e2", name: "Sensor 1", objectId: "o2", type: "sensor", status: "online", lastCheck: new Date() },
    { id: "e3", name: "Alarm System", objectId: "o1", type: "alarm", status: "offline", lastCheck: new Date() },
  ],
  cameras: [
    { id: "c1", name: "Front Gate", zoneId: "z1", resolution: "4K", status: "recording", ip: "192.168.1.10" },
    { id: "c2", name: "Parking Lot", zoneId: "z2", resolution: "1080p", status: "recording", ip: "192.168.1.11" },
  ],
  reports: [
    { id: "r1", title: "Daily Security Report", date: new Date(), type: "security", status: "completed" },
    { id: "r2", title: "Equipment Status Report", date: new Date(), type: "equipment", status: "pending" },
  ],
}

export function DataProvider({ children }) {
  const [zones, setZones] = useState(MOCK_DATA.zones)
  const [objects, setObjects] = useState(MOCK_DATA.objects)
  const [equipment, setEquipment] = useState(MOCK_DATA.equipment)
  const [cameras, setCameras] = useState(MOCK_DATA.cameras)
  const [reports, setReports] = useState(MOCK_DATA.reports)

  // Zone operations
  const addZone = useCallback((zone) => {
    const newZone = { ...zone, id: `z${Date.now()}` }
    setZones((prev) => [...prev, newZone])
    return newZone
  }, [])

  const updateZone = useCallback((id, updates) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)))
  }, [])

  const deleteZone = useCallback((id) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
  }, [])

  // Object operations
  const addObject = useCallback((obj) => {
    const newObject = { ...obj, id: `o${Date.now()}` }
    setObjects((prev) => [...prev, newObject])
    return newObject
  }, [])

  const updateObject = useCallback((id, updates) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }, [])

  const deleteObject = useCallback((id) => {
    setObjects((prev) => prev.filter((o) => o.id !== id))
  }, [])

  // Equipment operations
  const addEquipment = useCallback((equip) => {
    const newEquipment = { ...equip, id: `e${Date.now()}` }
    setEquipment((prev) => [...prev, newEquipment])
    return newEquipment
  }, [])

  const updateEquipment = useCallback((id, updates) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }, [])

  const deleteEquipment = useCallback((id) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id))
  }, [])

  // Camera operations
  const addCamera = useCallback((camera) => {
    const newCamera = { ...camera, id: `c${Date.now()}` }
    setCameras((prev) => [...prev, newCamera])
    return newCamera
  }, [])

  const updateCamera = useCallback((id, updates) => {
    setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const deleteCamera = useCallback((id) => {
    setCameras((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Report operations
  const addReport = useCallback((report) => {
    const newReport = { ...report, id: `r${Date.now()}` }
    setReports((prev) => [...prev, newReport])
    return newReport
  }, [])

  const updateReport = useCallback((id, updates) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }, [])

  const deleteReport = useCallback((id) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const value = {
    zones,
    objects,
    equipment,
    cameras,
    reports,
    addZone,
    updateZone,
    deleteZone,
    addObject,
    updateObject,
    deleteObject,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addCamera,
    updateCamera,
    deleteCamera,
    addReport,
    updateReport,
    deleteReport,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
