import { Layout } from "@/components/layout/Layout"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { ChatPage } from "@/pages/ChatPage"
import ClientsPage from "@/pages/ClientsPage"
import { CustomersPage } from "@/pages/CustomersPage"
import DashboardPage from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import OrdersPage from "@/pages/OrdersPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { PromptsPage } from "@/pages/PromptsPage"
import ServicesPage from "@/pages/ServicesPage"
import { CategoriesPage } from "@/pages/settings/CategoriesPage"
import { LanguagesPage } from "@/pages/settings/LanguagesPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { WorkspacePage } from "@/pages/WorkspacePage"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="prompts" element={<PromptsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="settings" element={<SettingsPage />}>
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="languages" element={<LanguagesPage />} />
          </Route>
          <Route path="workspace" element={<WorkspacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
