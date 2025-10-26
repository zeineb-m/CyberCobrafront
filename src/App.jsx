import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { DataProvider } from "./context/DataContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import FeaturesPage from "./pages/FeaturesPage"
import PricingPage from "./pages/PricingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/admin/UsersPage"
import ZonesPage from "./pages/admin/ZonesPage"
import ObjectsPage from "./pages/admin/ObjectsPage"
import EquipmentPage from "./pages/admin/EquipmentPage"
import ReportsPage from "./pages/admin/ReportsPage"
import CamerasPage from "./pages/admin/CamerasPage"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Admin routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/zones"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <ZonesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/objects"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <ObjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/equipment"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <EquipmentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/cameras"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <CamerasPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
