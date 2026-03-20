import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"

import Sidebar from "./components/layout/Sidebar"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"

import Home from "./pages/Home"
import Analyze from "./pages/Analyze"
import Dashboard from "./pages/Dashboard"
import Auth from "./pages/Auth"

function AnimatedRoutes({ setUser }) {

  const location = useLocation()

  return (

    <AnimatePresence mode="wait">

      <Routes location={location} key={location.pathname}>

        <Route path="/" element={<Home />} />
        <Route path="/analyze/:id" element={<Analyze />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Login / Signup */}
        <Route path="/login" element={<Auth setUser={setUser} />} />

      </Routes>

    </AnimatePresence>

  )

}

function Layout({ children, toggleSidebar, isOpen, user }) {

  return (

    <div style={{ display: "flex" }}>

      <Sidebar isOpen={isOpen} />

      <div
        style={{
          flex: 1,
          marginLeft: isOpen ? "220px" : "0px",
          transition: "margin-left 0.3s ease"
        }}
      >

        <Navbar toggleSidebar={toggleSidebar} user={user} />

        <div className="p-4" style={{ minHeight: "80vh" }}>
          {children}
        </div>

        <Footer />

      </div>

    </div>

  )

}

function App() {

  const [isOpen, setIsOpen] = useState(false)

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  )

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (

    <BrowserRouter>

      <Routes>

        {/* Auth Page (no sidebar/navbar) */}
        <Route
          path="/login"
          element={<Auth setUser={setUser} />}
        />

        {/* Main App Layout */}
        <Route
          path="/*"
          element={

            <Layout
              toggleSidebar={toggleSidebar}
              isOpen={isOpen}
              user={user}
            >

              <AnimatedRoutes setUser={setUser} />

            </Layout>

          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App