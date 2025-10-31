/* AuthContext.jsx */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

// Utilisateur statique pour test/demo
const STATIC_USER = {
id: 0,
username: "admin",
email: "[demo@demo.com](mailto:demo@demo.com)",
first_name: "Demo",
last_name: "Admin",
password: "admin",
CIN: "00000000",
phone: "00000000",
is_superuser: true,
image: null
};

const BACKEND_URL = "[https://cybercobra-4.onrender.com](https://cybercobra-4.onrender.com)";

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Charger user/token au démarrage
useEffect(() => {
const storedToken = sessionStorage.getItem("access") || localStorage.getItem("access");
const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
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

```
// Connexion avec utilisateur statique
if (username === STATIC_USER.username && password === STATIC_USER.password) {
  setUser(STATIC_USER);
  setToken("static-token-demo");
  sessionStorage.setItem("access", "static-token-demo");
  sessionStorage.setItem("user", JSON.stringify(STATIC_USER));
  return STATIC_USER;
}

// Sinon appel au backend
try {
  const res = await axios.post(`${BACKEND_URL}/api/auth/login/`, { username, password });
  if (res.data.success) {
    const userData = res.data.user;
    userData.is_superuser = userData.is_superuser === true || userData.is_superuser === 1;
    setUser(userData);
    setToken(res.data.access);
    sessionStorage.setItem("access", res.data.access);
    sessionStorage.setItem("refresh", res.data.refresh);
    sessionStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  } else {
    setError(res.data.message || "Login failed");
    throw new Error(res.data.message);
  }
} catch (err) {
  setError(err.response?.data?.message || "Login failed");
  throw err;
}
```

}, []);

const logout = async () => {
try {
const refresh = sessionStorage.getItem("refresh");
if (refresh && token !== "static-token-demo") {
await axios.post(`${BACKEND_URL}/api/auth/logout/`, { refresh });
}
} catch (err) {
console.error("[Logout] Error:", err.response || err);
} finally {
setUser(null);
setToken(null);
sessionStorage.clear();
localStorage.removeItem("access");
localStorage.removeItem("refresh");
localStorage.removeItem("user");
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

