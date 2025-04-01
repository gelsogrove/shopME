import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import MainLayout from "./components/layout/MainLayout"
import Categories from "./pages/Categories"
import ChannelSettings from "./pages/ChannelSettings"
import ChatDetail from "./pages/ChatDetail"
import ChatHistory from "./pages/ChatHistory"
import Dashboard from "./pages/Dashboard"
import Languages from "./pages/Languages"
import Login from "./pages/Login"
import OrderDetail from "./pages/OrderDetail"
import Orders from "./pages/Orders"
import Products from "./pages/Products"
import PromptEdit from "./pages/PromptEdit"
import Prompts from "./pages/Prompts"
import Users from "./pages/Users"
import Workspace from "./pages/Workspace"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workspace" element={<Workspace />} />

        {/* Protected routes - wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/chat-history" element={<ChatHistory />} />
          <Route path="/chat-history/:chatId" element={<ChatDetail />} />
          <Route path="/users" element={<Users />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/channel-settings" element={<ChannelSettings />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/prompts/:id/edit" element={<PromptEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
