import { Layout } from "@/components/layout/Layout"
import DashboardPage from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import OrdersPage from "@/pages/OrdersPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { PromptsPage } from "@/pages/PromptsPage"
import ServicesPage from "@/pages/ServicesPage"
import { CategoriesPage } from "@/pages/settings/CategoriesPage"
import { LanguagesPage } from "@/pages/settings/LanguagesPage"
import { UsersPage } from "@/pages/settings/UsersPage"
import { WorkspacePage } from "@/pages/WorkspacePage"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/settings">
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="languages" element={<LanguagesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
