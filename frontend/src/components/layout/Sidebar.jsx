import { motion } from "framer-motion"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaUpload, FaSearch, FaChartBar } from "react-icons/fa"

function Sidebar({ isOpen }) {

  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Smart Analyze navigation
  const handleAnalyze = () => {

    const lastId = localStorage.getItem("lastContractId")

    if (lastId) {
      navigate(`/analyze/${lastId}`)
    } else {
      navigate("/dashboard")
    }

  }

  // ✅ Active check
  const isActive = (path) => location.pathname === path

  return (

    <motion.div
      initial={{ x: -220 }}
      animate={{ x: isOpen ? 0 : -220 }}
      transition={{ duration: 0.3 }}
      className="sidebar-saas text-white p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "220px",
        height: "100vh",
        zIndex: 1000
      }}
    >

      <h5 className="fw-bold mb-4">AI Analyzer</h5>

      <ul className="list-unstyled">

        {/* Upload */}
        <li className="mb-3">
          <Link
            to="/"
            className={`sidebar-link ${isActive("/") ? "active" : ""}`}
          >
            <FaUpload /> Upload
          </Link>
        </li>

        {/* Analyze */}
        <li className="mb-3">
          <button
            onClick={handleAnalyze}
            className={`sidebar-link ${
              location.pathname.includes("analyze") ? "active" : ""
            }`}
          >
            <FaSearch /> Analyze
          </button>
        </li>

        {/* Dashboard */}
        <li>
          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            <FaChartBar /> Dashboard
          </Link>
        </li>

      </ul>

    </motion.div>

  )

}

export default Sidebar