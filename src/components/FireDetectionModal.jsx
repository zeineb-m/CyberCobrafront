import { useState, useRef, useCallback, useEffect } from "react"
import Modal from "./Modal"

const API_URL = 'http://localhost:8000/api'

function getAuthHeaders() {
  const token = sessionStorage.getItem('access') || localStorage.getItem('access')
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export default function FireDetectionModal({ isOpen, onClose, cameraName }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [])

  const startWebcam = useCallback(async () => {
    try {
      setError(null)
      console.log('[FireDetection] Starting webcam...')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      
      console.log('[FireDetection] Webcam stream obtained')
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            console.log('[FireDetection] Video metadata loaded')
            videoRef.current.play()
              .then(() => {
                console.log('[FireDetection] Video playing')
                resolve()
              })
              .catch(err => {
                console.error('[FireDetection] Video play error:', err)
                resolve()
              })
          }
        })
      }
      
      setStream(mediaStream)
      setIsCapturing(true)
      console.log('[FireDetection] Webcam started successfully')
      
    } catch (err) {
      console.error('[FireDetection] Webcam error:', err)
      setError(`Failed to access webcam: ${err.message}. Please allow camera permissions in your browser.`)
    }
  }, [])

  const stopWebcam = useCallback(() => {
    if (stream) {
      console.log('[FireDetection] Stopping webcam...')
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('[FireDetection] Track stopped:', track.kind)
      })
      setStream(null)
      setIsCapturing(false)
    }
  }, [stream])

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video not ready')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      console.log('[FireDetection] Capturing frame...')
      
      // Capture frame from video
      const canvas = canvasRef.current
      const video = videoRef.current
      
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      console.log('[FireDetection] Frame captured, converting to blob...')

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95)
      })

      if (!blob) {
        throw new Error('Failed to capture image')
      }

      console.log('[FireDetection] Blob created, size:', blob.size)

      // Send to API
      const formData = new FormData()
      formData.append('image', blob, 'webcam-capture.jpg')

      console.log('[FireDetection] Sending to API...')

      const response = await fetch(`${API_URL}/cameras/detect-fire/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      console.log('[FireDetection] API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[FireDetection] Detection result:', data)
      
      setResult(data)

      // Play alert sound if fire detected
      if (data.fire_detected || data.smoke_detected) {
        console.log('[FireDetection] ⚠️ FIRE/SMOKE DETECTED!')
        try {
          const audio = new Audio('/alert.mp3')
          audio.play().catch(() => {
            // Fallback beep
            const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnk77RgGwU7k9n0yXUqBSh+zPLaizsKGGS56+moWRYNTKXh8bhlHAU7k9n0yXUqBSh+zPLaizsKGGS56+moWRYNTKXh8bhlHAU7k9n0yXUqBSh+zPLaizsKGGS56+moWRYNTKXh8bhlHAU=')
            beep.play().catch(() => console.log('[FireDetection] Audio blocked'))
          })
        } catch (e) {
          console.error('[FireDetection] Audio error:', e)
        }
      }

    } catch (err) {
      console.error('[FireDetection] Analysis error:', err)
      setError(`Failed to analyze image: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClose = () => {
    stopWebcam()
    setResult(null)
    setError(null)
    onClose()
  }

  const getAlertColor = (level) => {
    if (level === 'CRITICAL') return 'text-red-500 bg-red-500/20 border-red-500'
    if (level === 'HIGH') return 'text-orange-500 bg-orange-500/20 border-orange-500'
    return 'text-green-500 bg-green-500/20 border-green-500'
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`🔥 Fire Detection - ${cameraName}`} size="lg">
      <div className="space-y-4">
        {/* Info Message */}
        {!isCapturing && !error && (
          <div className="p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-400 text-sm">
            ℹ️ Make sure your browser has permission to access the camera. Click "Start Webcam" to begin.
          </div>
        )}

        {/* Webcam Controls */}
        <div className="flex gap-3">
          {!isCapturing ? (
            <button
              onClick={startWebcam}
              className="flex-1 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
            >
              📹 Start Webcam
            </button>
          ) : (
            <>
              <button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "🔄 Analyzing with AI..." : "🔥 Detect Fire"}
              </button>
              <button
                onClick={stopWebcam}
                className="px-4 py-2 bg-surface border border-border text-text font-medium rounded-lg hover:border-accent transition-colors"
              >
                Stop
              </button>
            </>
          )}
        </div>

        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${!isCapturing ? 'hidden' : ''}`}
          />
          {!isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p>Click "Start Webcam" to begin</p>
              </div>
            </div>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-lg font-medium animate-pulse">
                🔄 Analyzing with AI...
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Detection Results */}
        {result && (
          <div className={`p-4 border-2 rounded-lg ${getAlertColor(result.alert_level)}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Detection Results</h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold">
                {result.alert_level}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fire Detected:</span>
                <span className="font-bold">{result.fire_detected ? "🔥 YES" : "✅ NO"}</span>
              </div>
              <div className="flex justify-between">
                <span>Smoke Detected:</span>
                <span className="font-bold">{result.smoke_detected ? "💨 YES" : "✅ NO"}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="font-bold">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Detections:</span>
                <span className="font-bold">{result.detections?.length || 0} objects</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-sm font-medium">{result.message}</p>
            </div>

            {/* Annotated Image */}
            {result.annotated_image_base64 && (
              <div className="mt-4">
                <p className="text-xs font-medium mb-2">AI Analysis with Bounding Boxes:</p>
                <img
                  src={`data:image/jpeg;base64,${result.annotated_image_base64}`}
                  alt="Fire detection analysis"
                  className="w-full rounded border-2 border-current"
                />
              </div>
            )}

            {/* Detection Details */}
            {result.detections && result.detections.length > 0 && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <p className="text-xs font-medium mb-2">Detected Objects:</p>
                <div className="space-y-1">
                  {result.detections.map((det, idx) => (
                    <div key={idx} className="text-xs flex justify-between">
                      <span>{det.class}</span>
                      <span>{(det.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full py-2 bg-surface border border-border text-text font-medium rounded-lg hover:border-accent transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
