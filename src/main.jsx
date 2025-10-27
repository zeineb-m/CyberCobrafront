import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import ErrorBoundary from "./ErrorBoundary.jsx"
import { LanguageProvider } from "./context/LanguageContext.jsx"

const root = document.getElementById("root")
ReactDOM.createRoot(root).render(
<React.StrictMode>
  <LanguageProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </LanguageProvider>
</React.StrictMode>

)
