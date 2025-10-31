
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { DataProvider } from "./context/DataContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import ProfilePage from "./components/ProfilePage.jsx"
import HomePage from "./pages/HomePage"
import FeaturesPage from "./pages/FeaturesPage"
import PricingPage from "./pages/PricingPage"
import LoginPage from "./pages/LoginPage"

import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/admin/UsersPage"
import ZonesPage from "./pages/admin/ZonesPage"
import ObjectsPage from "./pages/admin/ObjectsPage"
import ReportsPage from "./pages/admin/ReportsPage"
import CamerasPage from "./pages/admin/CamerasPage"
import EquipementsApiPage from "./pages/admin/EquipementsApiPage"
import EquipementScan from "./pages/EquipementScan"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              

              {/* Protected routes (staff only) */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/equipements/scan" element={<EquipementScan />} />
                <Route path="/admin" element={<Outlet />}>
                  <Route path="users" element={<UsersPage />} />
                  <Route path="zones" element={<ZonesPage />} />
                  <Route path="objects" element={<ObjectsPage />} />
                  <Route path="equipements" element={<EquipementsApiPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="cameras" element={<CamerasPage />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
