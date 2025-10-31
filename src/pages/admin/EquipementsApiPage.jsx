import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RefreshCcw, Search, X, Edit2, Trash2, Filter, Camera, CameraOff, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'


export default function EquipementsApiPage() {
  const { user: currentUser, token } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nom: '', statut: 'AUTORISE', description: '' })
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('ALL')
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, nom }
  const [page, setPage] = useState(1)
  const pageSize = 10
  // Camera & image state
  const [cameraOpen, setCameraOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [capturedFile, setCapturedFile] = useState(null) // File
  const [previewUrl, setPreviewUrl] = useState('')

  // Check if user is superuser - if not, show unauthorized message
  if (!currentUser?.is_superuser) {
    return (
      <div className="p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-surface/70 backdrop-blur-sm border border-rose-500/30 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-rose-400">Accès non autorisé</h2>
          <p className="text-text-secondary mb-4">
            Cette page est réservée aux administrateurs. Seuls les super-utilisateurs peuvent gérer les équipements.
          </p>
          <p className="text-sm text-text-secondary/70">
            Contactez un administrateur si vous pensez que vous devriez avoir accès.
          </p>
        </div>
      </div>
    )
  }

  function getAccessToken() {
    return (
      sessionStorage.getItem('access') ||
      localStorage.getItem('access') ||
      ''
    )
  }

  function authHeaders() {
    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/equipements/`, { headers: { ...authHeaders() } })
      if (!res.ok) throw new Error('fetch failed')
      setData(await res.json())
    } catch (e) {
      console.error(e)
      alert("Erreur de chargement. Assure-toi d'être connecté.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Handle camera lifecycle so the <video> exists before attaching the stream
  useEffect(() => {
    let cancelled = false
    async function startCamera() {
      setCameraError('')
      setVideoReady(false)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          const onMeta = () => setVideoReady(true)
          videoRef.current.onloadedmetadata = onMeta
          try { await videoRef.current.play() } catch {}
        }
      } catch (err) {
        setCameraError("Impossible d'accéder à la caméra. Vérifie les permissions du navigateur.")
      }
    }
    function stopCamera() {
      setVideoReady(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    if (cameraOpen) startCamera(); else stopCamera()
    return () => { cancelled = true }
  }, [cameraOpen])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let items = data
    if (filterStatut !== 'ALL') {
      items = items.filter(e => e.statut === filterStatut)
    }
    if (!q) return items
    return items.filter(e =>
      e.nom?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.statut?.toLowerCase().includes(q)
    )
  }, [data, search, filterStatut])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  function statutBadge(statut) {
    const map = {
      AUTORISE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      INTERDIT: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      SOUMIS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    }
    const label = statut === 'AUTORISE' ? 'Autorisé' : statut === 'INTERDIT' ? 'Interdit' : 'Soumis à autorisation'
    return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border ${map[statut]}`}>{label}</span>
  }

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `${API}/equipements/${editing.id_equipement}/` : `${API}/equipements/`
      const fd = new FormData()
      fd.append('nom', form.nom || '')
      fd.append('statut', form.statut || 'AUTORISE')
      fd.append('description', form.description || '')
      if (capturedFile) {
        fd.append('image', capturedFile)
      }
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders() },
        body: fd,
      })
      if (!res.ok) throw new Error('save failed')
      setModalOpen(false)
      setForm({ nom: '', statut: 'AUTORISE', description: '' })
      setEditing(null)
      setCapturedFile(null)
      setPreviewUrl('')
      // Stop camera if open
      if (cameraOpen && videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(t => t.stop())
        setCameraOpen(false)
      }
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert('Action impossible')
    }
  }

  async function onDelete(id) {
    if (!confirm('Supprimer cet équipement ?')) return
    try {
      const res = await fetch(`${API}/equipements/${id}/`, { method: 'DELETE', headers: { ...authHeaders() } })
      if (!res.ok) throw new Error('delete failed')
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert('Suppression impossible')
    }
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Gestion des équipements </h1>
            <p className="text-sm text-text-secondary"></p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded hover:border-accent transition-colors"
              title="Rafraîchir la liste"
            >
              <RefreshCcw className="w-4 h-4" /> Rafraîchir
            </button>
            <button
              onClick={() => { setEditing(null); setForm({ nom: '', statut: 'AUTORISE', description: '' }); setModalOpen(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Nouvel équipement
            </button>
          </div>
        </div>

        {/* Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {!getAccessToken() && (
            <div className="w-full sm:w-auto bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded px-3 py-2 text-sm">
              Non authentifié: connecte-toi pour accéder à l'API (token manquant).
            </div>
          )}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher par nom, statut, description..."
                className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded placeholder:text-text-secondary/70 focus:outline-none focus:border-accent"
              />
              {search && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary/70" onClick={() => setSearch('')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="hidden sm:block text-xs text-text-secondary/70">{filtered.length}/{data.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterStatut}
                onChange={(e) => { setFilterStatut(e.target.value); setPage(1) }}
                className="appearance-none pl-9 pr-8 py-2 bg-surface border border-border rounded focus:outline-none focus:border-accent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="AUTORISE">Autorisé</option>
                <option value="INTERDIT">Interdit</option>
                <option value="SOUMIS">Soumis à autorisation</option>
              </select>
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/70" />
            </div>
            {(filterStatut !== 'ALL') && (
              <button className="px-2 py-2 border border-border rounded" onClick={() => setFilterStatut('ALL')}>Réinitialiser</button>
            )}
          </div>
        </div>

        {/* Card + table */}
        <div className="bg-surface/70 backdrop-blur-sm border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary/60 border-b border-border sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">ID</th>
                  <th className="px-6 py-3 text-left font-semibold">Nom</th>
                  <th className="px-6 py-3 text-left font-semibold">Statut</th>
                  <th className="px-6 py-3 text-left font-semibold">Ajouté le</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center">Chargement…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-text-secondary">Aucun équipement</div>
                        <button
                          className="px-4 py-2 bg-accent text-primary rounded"
                          onClick={() => { setEditing(null); setForm({ nom: '', statut: 'AUTORISE', description: '' }); setModalOpen(true) }}
                        >
                          + Ajouter un équipement
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map(e => (
                    <tr key={e.id_equipement} className="border-b border-border/60 hover:bg-primary/40">
                      <td className="px-6 py-3 align-middle">{e.id_equipement}</td>
                      <td className="px-6 py-3 align-middle font-medium">{e.nom}</td>
                      <td className="px-6 py-3 align-middle">{statutBadge(e.statut)}</td>
                      <td className="px-6 py-3 align-middle">{new Date(e.date_ajout).toLocaleString()}</td>
                      <td className="px-6 py-3 align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-500/10"
                            onClick={() => { setEditing(e); setForm({ nom: e.nom, statut: e.statut, description: e.description || '' }); setModalOpen(true) }}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" /> Modifier
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-500/30 text-rose-300 rounded hover:bg-rose-500/10"
                            onClick={() => setConfirmDelete({ id: e.id_equipement, nom: e.nom })}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-text-secondary/70">Page {page} / {totalPages}</span>
          <div className="inline-flex overflow-hidden rounded border border-border">
            <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className={`px-3 py-1.5 ${page<=1? 'opacity-40 cursor-not-allowed': 'hover:bg-primary/40'}`}>Précédent</button>
            <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className={`px-3 py-1.5 border-l border-border ${page>=totalPages? 'opacity-40 cursor-not-allowed': 'hover:bg-primary/40'}`}>Suivant</button>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface/95 backdrop-blur border border-border rounded-xl p-6 w-full max-w-xl shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editing ? 'Modifier un équipement' : 'Créer un équipement'}</h2>
                <div className="flex gap-2">
                  {editing && (
                    <button
                      type="button"
                      className="px-3 py-1 border border-border rounded hover:border-accent"
                      onClick={() => { setEditing(null); setForm({ nom: '', statut: 'AUTORISE', description: '' }) }}
                    >
                      + Ajouter
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-3 py-1 border border-border rounded hover:border-rose-400/60"
                    onClick={() => { setModalOpen(false); setEditing(null) }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">Nom</label>
                    <input
                      placeholder="Ex: Caméra IP Hall A"
                      className="w-full px-3 py-2 bg-primary border border-border rounded focus:outline-none focus:border-accent"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Statut</label>
                    <select
                      className="w-full px-3 py-2 bg-primary border border-border rounded focus:outline-none focus:border-accent"
                      value={form.statut}
                      onChange={(e) => setForm({ ...form, statut: e.target.value })}
                    >
                      <option value="AUTORISE">Autorisé</option>
                      <option value="INTERDIT">Interdit</option>
                      <option value="SOUMIS">Soumis à autorisation</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-1">Description</label>
                    <textarea
                      placeholder="Détails utiles (emplacement, modèle, etc.)"
                      className="w-full px-3 py-2 bg-primary border border-border rounded min-h-[110px] focus:outline-none focus:border-accent"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  {/* Image capture/upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-text-secondary mb-2">Image (optionnel)</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded hover:border-accent"
                          onClick={() => setCameraOpen(v => !v)}
                        >
                          {cameraOpen ? (<><CameraOff className="w-4 h-4" /> Fermer caméra</>) : (<><Camera className="w-4 h-4" /> Ouvrir caméra</>)}
                        </button>
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:border-accent">
                          <ImageIcon className="w-4 h-4" /> Importer une image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files && e.target.files[0]
                            if (file) {
                              setCapturedFile(file)
                              const url = URL.createObjectURL(file)
                              setPreviewUrl(url)
                            }
                          }} />
                        </label>
                        {(capturedFile || previewUrl) && (
                          <button type="button" className="px-3 py-2 border border-border rounded hover:border-rose-400/60" onClick={() => {
                            setCapturedFile(null); setPreviewUrl('')
                          }}>Réinitialiser</button>
                        )}
                      </div>
                      {cameraOpen && (
                        <div className="flex flex-col gap-2">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-64 bg-black rounded" />
                          <canvas ref={canvasRef} className="hidden" />
                          {cameraError && (
                            <div className="text-sm text-amber-300">{cameraError}</div>
                          )}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="px-4 py-2 bg-accent text-primary rounded disabled:opacity-50"
                              disabled={!videoReady}
                              onClick={() => {
                                const video = videoRef.current
                                const canvas = canvasRef.current
                                if (!video || !canvas) return
                                const w = video.videoWidth || 640
                                const h = video.videoHeight || 480
                                canvas.width = w
                                canvas.height = h
                                const ctx = canvas.getContext('2d')
                                ctx.drawImage(video, 0, 0, w, h)
                                canvas.toBlob((blob) => {
                                  if (blob) {
                                    const file = new File([blob], `capture_${Date.now()}.png`, { type: 'image/png' })
                                    setCapturedFile(file)
                                    const url = URL.createObjectURL(blob)
                                    setPreviewUrl(url)
                                  }
                                }, 'image/png')
                              }}
                            >Capturer</button>
                          </div>
                        </div>
                      )}
                      {previewUrl && (
                        <div className="flex items-center gap-3">
                          <img src={previewUrl} alt="Prévisualisation" className="w-32 h-24 object-cover rounded border border-border" />
                          <span className="text-xs text-text-secondary">Prévisualisation</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="px-4 py-2 border border-border rounded hover:border-rose-400/60" onClick={() => { setModalOpen(false); setEditing(null) }}>Annuler</button>
                  {editing ? (
                    <button type="submit" className="px-4 py-2 bg-accent text-primary rounded">Enregistrer</button>
                  ) : (
                    <button type="submit" className="px-4 py-2 bg-accent text-primary rounded">Créer</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface/95 backdrop-blur border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Supprimer l'équipement</h3>
              <p className="text-sm text-text-secondary mb-4">Confirmer la suppression de « {confirmDelete.nom} » ? Cette action est irréversible.</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 border border-border rounded" onClick={() => setConfirmDelete(null)}>Annuler</button>
                <button
                  className="px-4 py-2 border border-rose-500/40 text-rose-300 rounded hover:bg-rose-500/10"
                  onClick={async () => { await onDelete(confirmDelete.id); setConfirmDelete(null) }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
