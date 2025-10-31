export type Equipement = {
  id_equipement: number
  nom: string
  statut: 'AUTORISE' | 'INTERDIT' | 'SOUMIS'
  date_ajout: string
  description?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'
const api = `${baseUrl}/api`

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = (window.sessionStorage?.getItem('access') || window.localStorage?.getItem('access')) ?? ''
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function getEquipements(signal?: AbortSignal): Promise<Equipement[]> {
  const res = await fetch(`${api}/equipements/`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal,
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to fetch équipements: ${res.status}`)
  return res.json()
}

export async function createEquipement(payload: Omit<Equipement, 'id_equipement' | 'date_ajout'>): Promise<Equipement> {
  const res = await fetch(`${api}/equipements/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to create équipement: ${res.status}`)
  return res.json()
}

export async function updateEquipement(id: number, payload: Partial<Omit<Equipement, 'id_equipement' | 'date_ajout'>>): Promise<Equipement> {
  const res = await fetch(`${api}/equipements/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to update équipement: ${res.status}`)
  return res.json()
}

export async function deleteEquipement(id: number): Promise<void> {
  const res = await fetch(`${api}/equipements/${id}/`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to delete équipement: ${res.status}`)
}

// Camera API
export type Camera = {
  id_camera: number
  name: string
  zone: string
  ip_address: string
  resolution: string
  status: 'RECORDING' | 'OFFLINE' | 'MAINTENANCE'
  date_ajout: string
}

export async function getCameras(signal?: AbortSignal): Promise<Camera[]> {
  const res = await fetch(`${api}/cameras/`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal,
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to fetch cameras: ${res.status}`)
  return res.json()
}

export async function createCamera(payload: Omit<Camera, 'id_camera' | 'date_ajout'>): Promise<Camera> {
  const res = await fetch(`${api}/cameras/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to create camera: ${res.status}`)
  return res.json()
}

export async function updateCamera(id: number, payload: Partial<Omit<Camera, 'id_camera' | 'date_ajout'>>): Promise<Camera> {
  const res = await fetch(`${api}/cameras/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to update camera: ${res.status}`)
  return res.json()
}

export async function deleteCamera(id: number): Promise<void> {
  const res = await fetch(`${api}/cameras/${id}/`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to delete camera: ${res.status}`)
}
