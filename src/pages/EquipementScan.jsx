import { useEffect, useRef, useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'

export default function EquipementScan() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { statut, confidence, avg_brightness }
  const [error, setError] = useState('')
  const streamRef = useRef(null)

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

  useEffect(() => {
    // open camera on mount
    openCamera()
    return () => stopCamera()
  }, [])

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        streamRef.current = stream
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setVideoReady(true)
        try { await videoRef.current.play() } catch {}
      }
      setCameraOpen(true)
      setError('')
    } catch (e) {
      setError("Impossible d'accéder à la caméra. Vérifie les permissions.")
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const tracks = (streamRef.current || videoRef.current.srcObject).getTracks()
        tracks.forEach(t => t.stop())
      } catch {}
      videoRef.current.srcObject = null
    }
    setVideoReady(false)
    setCameraOpen(false)
  }

  async function captureAndRecognize() {
    if (!videoRef.current || !canvasRef.current) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const v = videoRef.current
      const c = canvasRef.current
      const w = v.videoWidth || 640
      const h = v.videoHeight || 480
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      ctx.drawImage(v, 0, 0, w, h)
      const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.9))
      if (!blob) throw new Error('Capture impossible')
      const fd = new FormData()
      fd.append('image', blob, `scan_${Date.now()}.jpg`)

      const resp = await fetch(`${API}/equipements/recognize/`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: fd,
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Échec de la reconnaissance')
      }
      const json = await resp.json()
      setResult(json)

      // Preview
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      // Voice feedback
      try {
        const synth = window.speechSynthesis
        const statutLabel = json.statut === 'AUTORISE' ? 'Autorisé' : json.statut === 'INTERDIT' ? 'Interdit' : 'Soumis à autorisation'
        const utter = new SpeechSynthesisUtterance(`Statut: ${statutLabel}`)
        synth.speak(utter)
      } catch {}
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  function StatusCard() {
    if (!result) return null
    const color = result.statut === 'AUTORISE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : result.statut === 'INTERDIT' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    const label = result.statut === 'AUTORISE' ? 'Autorisé' : result.statut === 'INTERDIT' ? 'Interdit' : 'Soumis à autorisation'
    return (
      <div className={`p-6 rounded-xl border ${color} text-center space-y-2`}>
        <div className="text-2xl font-semibold">{label}</div>
        {result.confidence != null && (
          <div className="text-sm opacity-80">Confiance: {(result.confidence * 100).toFixed(0)}%</div>
        )}
        {result.avg_brightness != null && (
          <div className="text-xs opacity-60">Luminosité: {result.avg_brightness}</div>
        )}
        {result.strategy && (
          <div className="text-xs opacity-60">Stratégie: {result.strategy} {result.method && `(${result.method})`}</div>
        )}
        {result.orb_score != null && (
          <div className="text-xs opacity-60">ORB Score: {result.orb_score}%</div>
        )}
        {result.distance_phash != null && (
          <div className="text-xs opacity-60">distance: {result.distance_phash}</div>
        )}
        {result.matched_id != null && (
          <div className="text-xs opacity-60">matched_id: {result.matched_id}</div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Scan d'équipement</h1>
            <p className="text-sm text-text-secondary">Ouvre la caméra, capture une image et envoie au backend pour reconnaissance.</p>
          </div>
          <div className="text-xs text-text-secondary/70"></div>
        </div>

        {!getAccessToken() && (
          <div className="bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded px-3 py-2 text-sm">
            Non authentifié: connecte-toi pour accéder à l'API (token manquant).
          </div>
        )}

        <div className="bg-surface/70 backdrop-blur-sm border border-border rounded-lg p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="w-full bg-black rounded aspect-video" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                {!cameraOpen ? (
                  <button className="px-4 py-2 border border-border rounded hover:border-accent" onClick={openCamera}>Ouvrir caméra</button>
                ) : (
                  <button className="px-4 py-2 border border-border rounded hover:border-rose-400/60" onClick={stopCamera}>Fermer caméra</button>
                )}
                <button
                  className="px-4 py-2 bg-accent text-primary rounded disabled:opacity-50"
                  onClick={captureAndRecognize}
                  disabled={!cameraOpen || loading || !videoReady}
                >{loading ? 'Analyse…' : (!videoReady ? 'Préparation caméra…' : 'Capturer et analyser')}</button>
              </div>
            </div>
            <div className="space-y-3">
              {previewUrl && (
                <img src={previewUrl} alt="Aperçu" className="w-full rounded border border-border" />
              )}
              <StatusCard />
              {error && (
                <div className="text-sm text-rose-300">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
