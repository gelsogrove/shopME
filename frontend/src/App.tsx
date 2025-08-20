import GdprPage from "@/pages/GdprPage"
import SettingsPage from "@/pages/SettingsPage"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { Layout } from "./components/layout/Layout"
import { AgentPage } from "./pages/AgentPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import SignupPage from "./pages/auth/SignupPage"
import { ChatPage } from "./pages/ChatPage"
import { ChatTestPage } from "./pages/ChatTestPage"
import ClientsPage from "./pages/ClientsPage"

import DataProtectionPage from "./pages/data-protection"
import DocumentsPage from "./pages/DocumentsPage"

import CheckoutSuccessPage from "./pages/checkout-success"
import CheckoutPage from "./pages/CheckoutPage"
import { FAQPage } from "./pages/FAQPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { LoginPage } from "./pages/LoginPage"
import MessageTestPage from "./pages/MessageTestPage"
import NotFoundPage from "./pages/not-found"
import NotificationsPage from "./pages/NotificationsPage"
import { OffersPage } from "./pages/OffersPage"
import OrdersPage from "./pages/OrdersPage"
import OrderSummaryPage from "./pages/OrderSummaryPage"

import CategoriesPage from "./pages/products/CategoriesPage"
import { ProductsPage } from "./pages/ProductsPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/register"
import RegistrationSuccess from "./pages/registration-success"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { ServicesPage } from "./pages/ServicesPage"
import { CategoriesPage as SettingsCategoriesPage } from "./pages/settings/CategoriesPage"
import { ChannelTypesPage } from "./pages/settings/ChannelTypesPage"
import { LanguagesPage } from "./pages/settings/LanguagesPage"

import { ProductsPage as SettingsProductsPage } from "./pages/settings/ProductsPage"

import { Suspense, lazy } from "react"
import SurveysPage from "./pages/SurveysPage"
import { VerifyOtpPage } from "./pages/VerifyOtpPage"
import { WorkspacePage } from "./pages/WorkspacePage"
import { WorkspaceSelectionPage } from "./pages/WorkspaceSelectionPage"

const OrdersPublicPage = lazy(() => import("./pages/OrdersPublicPage"))
const CustomerProfilePublicPage = lazy(() => import("./pages/CustomerProfilePublicPage"))

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" duration={1000} />
      <Routes>
        {/* Auth Routes - accessibili senza autenticazione */}
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-otp" element={<VerifyOtpPage />} />
        </Route>
        {/* Direct route for /forgot-password to avoid 404 */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Development/Test Routes */}
        <Route path="/message-test" element={<MessageTestPage />} />

        {/* Protected Routes - richiedono autenticazione */}
        <Route element={<ProtectedRoute />}>
          {/* Workspace Selection */}
          <Route
            path="/workspace-selection"
            element={<WorkspaceSelectionPage />}
          />

          {/* Layout con sidebar */}
          <Route path="/chat" element={<Layout />}>
            <Route index element={<ChatPage />} />
          </Route>
          <Route path="/chat-test" element={<Layout />}>
            <Route index element={<ChatTestPage />} />
          </Route>
          <Route path="/analytics" element={<Layout />}>
            <Route index element={<AnalyticsPage />} />
          </Route>
          <Route path="/agent" element={<Layout />}>
            <Route index element={<AgentPage />} />
          </Route>
          <Route path="/clients" element={<Layout />}>
            <Route index element={<ClientsPage />} />
            <Route path=":id" element={<ClientsPage />} />
          </Route>
          <Route path="/admin/orders" element={<Layout />}>
            <Route index element={<OrdersPage />} />
          </Route>
          <Route path="/documents" element={<Layout />}>
            <Route index element={<DocumentsPage />} />
          </Route>
          <Route path="/products" element={<Layout />}>
            <Route index element={<ProductsPage />} />
          </Route>
          <Route path="/categories" element={<Layout />}>
            <Route index element={<CategoriesPage />} />
          </Route>

          <Route path="/services" element={<Layout />}>
            <Route index element={<ServicesPage />} />
          </Route>
          <Route path="/faq" element={<Layout />}>
            <Route index element={<FAQPage />} />
          </Route>

          <Route path="/surveys" element={<Layout />}>
            <Route index element={<SurveysPage />} />
          </Route>
          <Route path="/notifications" element={<Layout />}>
            <Route index element={<NotificationsPage />} />
          </Route>
          <Route path="/profile" element={<Layout />}>
            <Route index element={<ProfilePage />} />
          </Route>

          <Route path="/settings" element={<Layout />}>
            <Route index element={<SettingsPage />} />
            <Route path="languages" element={<LanguagesPage />} />
            <Route path="channel-types" element={<ChannelTypesPage />} />
            <Route path="categories" element={<SettingsCategoriesPage />} />
            <Route path="products" element={<SettingsProductsPage />} />
          </Route>
          <Route path="/gdpr" element={<Layout />}>
            <Route index element={<GdprPage />} />
          </Route>
          <Route path="/workspace" element={<Layout />}>
            <Route index element={<WorkspacePage />} />
          </Route>

          {/* Modifico la route per offers per usare Layout e OffersPage */}
          <Route path="/offers" element={<Layout />}>
            <Route index element={<OffersPage />} />
          </Route>
        </Route>

        {/* Public Orders pages via secure token (external, no platform layout) */}
        <Route
          path="/orders"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
              <OrdersPublicPage />
            </Suspense>
          }
        />
        <Route
          path="/orders/:orderCode"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
              <OrdersPublicPage />
            </Suspense>
          }
        />

        {/* Public Orders pages via orders-public URL (backend generated links) */}
        <Route
          path="/orders-public"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
              <OrdersPublicPage />
            </Suspense>
          }
        />
        <Route
          path="/orders-public/:orderCode"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
              <OrdersPublicPage />
            </Suspense>
          }
        />

        {/* Public Customer Profile page via secure token (external, no platform layout) */}
        <Route
          path="/customer-profile"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
              <CustomerProfilePublicPage />
            </Suspense>
          }
        />

        {/* Root redirect to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Legacy login redirect */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
        <Route path="/order-summary/:token" element={<OrderSummaryPage />} />
        <Route path="/data-protection" element={<DataProtectionPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
