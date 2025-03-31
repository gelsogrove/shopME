import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import MainLayout from "./components/layout/MainLayout"
import Categories from "./pages/Categories"
import ChannelSettings from "./pages/ChannelSettings"
import ChatHistory from "./pages/ChatHistory"
import Dashboard from "./pages/Dashboard"
import FAQ from "./pages/FAQ"
import History from "./pages/History"
import LanguageSettings from "./pages/LanguageSettings"
import LoginPage from "./pages/LoginPage"
import Orders from "./pages/Orders"
import Products from "./pages/Products"
import Prompts from "./pages/Prompts"
import UserManagement from "./pages/UserManagement"
import Workspace from "./pages/Workspace"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/workspace" element={<Workspace />} />

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/history" element={<History />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/chat-history/:customerId" element={<ChatHistory />} />
          <Route path="/channel" element={<ChannelSettings />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/languages" element={<LanguageSettings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
