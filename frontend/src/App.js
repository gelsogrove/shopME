import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import MainLayout from "./components/layout/MainLayout"
import Workspace from "./components/Workspace"
import Dashboard from "./pages/Dashboard"
import FAQManagement from "./pages/FAQManagement"
import LoginPage from "./pages/LoginPage"
import Orders from "./pages/Orders"
import Products from "./pages/Products"
import Prompts from "./pages/Prompts"
import Settings from "./pages/Settings"
import UserManagement from "./pages/UserManagement"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout>
              <Orders />
            </MainLayout>
          }
        />
        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />
        <Route
          path="/prompts"
          element={
            <MainLayout>
              <Prompts />
            </MainLayout>
          }
        />
        <Route
          path="/users"
          element={
            <MainLayout>
              <UserManagement />
            </MainLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <MainLayout>
              <Settings />
            </MainLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <MainLayout>
              <FAQManagement />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
