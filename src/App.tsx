import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { Layout } from "./components/layout/Layout"
import { OffersPage } from "./pages/OffersPage"
// ... other imports ...

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        // ... existing routes ...
        
        {/* Protected Routes - richiedono autenticazione */}
        <Route element={<ProtectedRoute />}>
          // ... existing routes ...

          {/* Modifico la route per offers per utilizzare la vera pagina OffersPage con layout */}
          <Route path="/offers" element={<Layout />}>
            <Route index element={<OffersPage />} />
          </Route>
          
          // ... other routes ...
        </Route>

        // ... other routes ...
      </Routes>
    </BrowserRouter>
  )
} 