import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function StatsCard({
  title,
  value,
  color = "primary",
  icon,
  subtitle,
  accent = "total"
}) {

  const [count, setCount] = useState(0)

  // 🔥 Count-up animation
  useEffect(() => {
    let start = 0
    const duration = 800
    const increment = value / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      className={`premium-stats-card accent-${accent}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >

      <div className="stats-card-top">
        <div className={`stats-icon text-${color}`}>
          {icon}
        </div>

        <div className="stats-trend">
          <span className={`dot bg-${color}`} />
          Live
        </div>
      </div>

      <div className="stats-card-body">
        <p className="stats-title">{title}</p>
        <h2 className="stats-value">{count}</h2>
        <p className="stats-subtitle">{subtitle}</p>
      </div>

      <div className="stats-card-glow" />

    </motion.div>
  )
}

export default StatsCard