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
import { ChannelTypesPage } from "@/pages/settings/ChannelTypesPage"
import { LanguagesPage } from "@/pages/settings/LanguagesPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { WorkspacePage } from "@/pages/WorkspacePage"
import { WorkspaceSelectionPage } from "@/pages/WorkspaceSelectionPage"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/workspace-selection"
          element={<WorkspaceSelectionPage />}
        />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="/analytics" element={<Layout />}>
          <Route index element={<AnalyticsPage />} />
        </Route>
        <Route path="/chat" element={<Layout />}>
          <Route index element={<ChatPage />} />
        </Route>
        <Route path="/clients" element={<Layout />}>
          <Route index element={<ClientsPage />} />
        </Route>
        <Route path="/customers" element={<Layout />}>
          <Route index element={<CustomersPage />} />
        </Route>
        <Route path="/orders" element={<Layout />}>
          <Route index element={<OrdersPage />} />
        </Route>
        <Route path="/products" element={<Layout />}>
          <Route index element={<ProductsPage />} />
        </Route>
        <Route path="/prompts" element={<Layout />}>
          <Route index element={<PromptsPage />} />
        </Route>
        <Route path="/services" element={<Layout />}>
          <Route index element={<ServicesPage />} />
        </Route>
        <Route path="/settings" element={<Layout />}>
          <Route index element={<SettingsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="languages" element={<LanguagesPage />} />
          <Route path="channel-types" element={<ChannelTypesPage />} />
        </Route>
        <Route path="/workspace" element={<Layout />}>
          <Route index element={<WorkspacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
