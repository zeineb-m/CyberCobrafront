import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger token et user depuis sessionStorage au démarrage
  useEffect(() => {
    const storedToken = sessionStorage.getItem("access");
    const storedUser = sessionStorage.getItem("user");
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.is_superuser = parsedUser.is_superuser === true || parsedUser.is_superuser === 1;
      setUser(parsedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        username,
        password,
      });

      if (res.data.success) {
        const userData = res.data.user;
        userData.is_superuser = userData.is_superuser === true || userData.is_superuser === 1;
        setUser(userData);
        setToken(res.data.access);
        sessionStorage.setItem("access", res.data.access);
        sessionStorage.setItem("refresh", res.data.refresh);
        sessionStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        setError(res.data.message || "Login failed");
        throw new Error(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  }, []);

   const logout = async () => {
    try {
      const refresh = sessionStorage.getItem("refresh");
      if (!refresh) {
        console.warn("[Logout] Aucun token de rafraîchissement trouvé.");
      } else {
        console.log("[Logout] Envoi de la requête au backend...");
        await axios.post("http://127.0.0.1:8000/api/auth/logout/", { refresh });
        console.log("[Logout] Déconnexion réussie côté serveur ✅");
      }
    } catch (err) {
      console.error("[Logout] Erreur lors du logout:", err.response || err);
    } finally {
      // Toujours nettoyer le local/session storage
      setUser(null);
      setToken(null);
      sessionStorage.clear();
    }
  };


  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
