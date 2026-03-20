import { motion } from "framer-motion"
import { FaBell, FaUserCircle, FaSearch, FaBars } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

function Navbar({ toggleSidebar, user }) {

  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  // 🔥 Debounced search
  useEffect(() => {

    const delay = setTimeout(async () => {

      if (!search) {
        setResults([])
        return
      }

      try {

        const res = await axios.get(
          `http://127.0.0.1:8000/api/contracts/search/?q=${search}`
        )

        setResults(res.data)
        setActiveIndex(-1)

      } catch (err) {
        console.error("Search error", err)
      }

    }, 400)

    return () => clearTimeout(delay)

  }, [search])

  // 🔥 Keyboard navigation
  const handleKeyDown = (e) => {

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      )
    }

    else if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : prev
      )
    }

    else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        navigate(`/analyze/${results[activeIndex].id}`)
        setSearch("")
        setResults([])
      }
    }

  }

  // 🔥 Highlight match
  const highlightText = (text) => {
    if (!search) return text

    const parts = text.split(new RegExp(`(${search})`, "gi"))

    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <span key={i} className="highlight">{part}</span>
        : part
    )
  }

  return (

    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="px-4 py-3 d-flex justify-content-between align-items-center shadow-sm"
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.85)"
      }}
    >

      {/* LEFT */}
      <div className="d-flex align-items-center gap-3">

        <FaBars size={20} style={{ cursor: "pointer" }} onClick={toggleSidebar} />

        <h5 className="mb-0 fw-bold">
          AI Contract Risk Analyzer
        </h5>

      </div>


      {/* 🔍 SEARCH */}
      <div
        className="d-none d-md-flex align-items-center position-relative"
        style={{ width: "360px" }}
      >

        <FaSearch className="search-icon" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search contracts..."
          className="form-control ps-5"
          style={{
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        />

        {/* 🔥 DROPDOWN */}
        {search && (
          <div className="search-dropdown">

            {results.length > 0 ? (

              results.map((item, index) => (

                <div
                  key={item.id}
                  className={`search-item ${index === activeIndex ? "active" : ""}`}
                  onClick={() => {
                    navigate(`/analyze/${item.id}`)
                    setSearch("")
                    setResults([])
                  }}
                >
                  {highlightText(item.file)}
                </div>

              ))

            ) : (

              <div className="search-empty">
                No results found
              </div>

            )}

          </div>
        )}

      </div>


      {/* RIGHT */}
      <div className="d-flex align-items-center gap-4">

        <motion.div whileHover={{ scale: 1.15 }} style={{ cursor: "pointer" }}>
          <FaBell size={18} />
        </motion.div>

        {user ? (

          <div className="dropdown">

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="d-flex align-items-center gap-2"
              style={{ cursor: "pointer" }}
              data-bs-toggle="dropdown"
            >

              <FaUserCircle size={26} />

              <span className="fw-semibold">
                {user.name} ▾
              </span>

            </motion.div>

            <ul className="dropdown-menu dropdown-menu-end shadow">

              <li><button className="dropdown-item">Profile</button></li>
              <li><button className="dropdown-item">Settings</button></li>

              <li><hr className="dropdown-divider" /></li>

              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>

            </ul>

          </div>

        ) : (

          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>

        )}

      </div>

    </motion.nav>

  )

}

export default Navbar