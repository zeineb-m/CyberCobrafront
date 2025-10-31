import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BACKEND_URL = "https://cybercobra-4.onrender.com";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { login, setUser, setToken } = useAuth();

  // Démarrer la caméra
  const startCamera = async () => {
    setError(null);
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = videoStream;
      setStream(videoStream);
      await new Promise(resolve => { videoRef.current.onloadedmetadata = () => resolve(); });
      console.log("[FaceLogin] Camera started");
    } catch (err) {
      console.error("[FaceLogin] Cannot access camera:", err);
      setError("Cannot access camera");
    }
  };

  // Capturer la photo et retourner un Blob
  const capturePhoto = () => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => { canvas.toBlob(blob => resolve(blob), "image/jpeg"); });
  };

  // Stopper la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      console.log("[FaceLogin] Camera stopped");
    }
  };

  // Login classique
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("[Login] Error:", err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Login avec face
  const handleFaceButtonClick = async () => {
    if (!stream) {
      await startCamera();
    } else {
      setLoading(true);
      setError(null);
      try {
        const photoBlob = await capturePhoto();
        if (!photoBlob) {
          setError("No photo captured");
          return;
        }

        const formData = new FormData();
        formData.append("image", photoBlob, "face.jpg");

        const res = await axios.post(BACKEND_URL + "/api/auth/facelogin/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          const userData = res.data.user;
          setUser(userData);
          setToken(res.data.access);
          sessionStorage.setItem("access", res.data.access);
          sessionStorage.setItem("refresh", res.data.refresh);
          sessionStorage.setItem("user", JSON.stringify(userData));
          navigate(userData.is_superuser ? "/dashboard" : "/user-page");
        } else {
          setError(res.data.message || "Face login failed");
        }
      } catch (err) {
        console.error("[FaceLogin] Error:", err.response || err);
        setError(err.response?.data?.message || "Face login failed");
      } finally {
        setLoading(false);
        stopCamera();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Sign in</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700" />
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-slate-400 mb-4">OR</div>

        <div className="flex flex-col items-center gap-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-80 h-60 bg-black rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />
          <button onClick={handleFaceButtonClick} disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${!stream ? "bg-blue-500" : "bg-green-500"}`}>
            {loading ? (stream ? "Logging in..." : "Starting...") : "Login with Face"}
          </button>
        </div>
      </div>
    </div>
  );
}
