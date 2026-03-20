import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"

import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  FileText,
  BarChart3,
  Brain
} from "lucide-react"

import { getRiskSummary } from "../services/api"

import StatsCard from "../components/dashboard/StatsCard"
import RiskChart from "../components/dashboard/RiskChart"
import AIInsights from "../components/dashboard/AIInsights"
import PageWrapper from "../components/common/PageWrapper"

const API_BASE = "http://127.0.0.1:8000"

function Dashboard() {

  const [summary, setSummary] = useState({
    low: 0,
    medium: 0,
    high: 0
  })

  const [apiInsights, setApiInsights] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadData = async () => {

      try {

        // ✅ SUMMARY
        const res = await getRiskSummary()

        setSummary(res?.data?.summary || {
          low: 0,
          medium: 0,
          high: 0
        })

        setApiInsights(res?.data?.insights || [])

        // 🔥 FIX ONLY THIS LINE
        const res2 = await axios.get(`${API_BASE}/api/contracts/analytics/`)
        console.log("ANALYTICS:", res2.data)

        setAnalytics(res2.data)

      } catch (err) {
        console.error("Dashboard error:", err)
      }

      setLoading(false)

    }

    loadData()

  }, [])

  const total = useMemo(() => {
    return (summary.low || 0) + (summary.medium || 0) + (summary.high || 0)
  }, [summary])

  // ✅ Smart Insights
  const generatedInsights = useMemo(() => {

    if (apiInsights?.length > 0) return apiInsights

    const insights = []

    if (summary.high > 0)
      insights.push("High-risk clauses detected. Immediate review required.")

    if (summary.medium > summary.high)
      insights.push("Moderate risk clauses present.")

    if (summary.low > summary.medium)
      insights.push("Most clauses are low risk.")

    if (total === 0)
      insights.push("No contracts analyzed yet.")

    return insights

  }, [apiInsights, summary, total])

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading Dashboard...</p>
      </div>
    )
  }

  return (

    <PageWrapper>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="dashboard-shell"
      >

        {/* HEADER */}
        <div className="dashboard-hero mb-4">
          <div>
            <p className="dashboard-eyebrow mb-2">Contract Intelligence</p>
            <h2 className="fw-bold mb-2">AI Risk Dashboard</h2>
            <p className="text-muted mb-0">
              Monitor risk, analytics, and AI performance
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="row g-4 mb-4">

          <div className="col-md-6 col-xl-3">
            <StatsCard
              title="Low Risk"
              value={summary.low}
              color="success"
              icon={<ShieldCheck size={20} />}
              subtitle="Safe clauses"
              accent="low"
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatsCard
              title="Medium Risk"
              value={summary.medium}
              color="warning"
              icon={<AlertTriangle size={20} />}
              subtitle="Needs review"
              accent="medium"
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatsCard
              title="High Risk"
              value={summary.high}
              color="danger"
              icon={<ShieldAlert size={20} />}
              subtitle="Critical"
              accent="high"
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatsCard
              title="Total Clauses"
              value={total}
              color="primary"
              icon={<FileText size={20} />}
              subtitle="Analyzed"
              accent="total"
            />
          </div>

        </div>

        {/* 🔥 ADVANCED ANALYTICS */}
        <div className="row g-4 mb-4">

          <div className="col-md-4">
            <div className="premium-stats-card accent-total p-3">
              <div className="stats-title">Total Contracts</div>
              <div className="stats-value">
                {analytics?.total_contracts ?? 0}
              </div>
              <div className="stats-subtitle">Analyzed contracts</div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="premium-stats-card accent-medium p-3">
              <div className="stats-title">Avg Clause Length</div>
              <div className="stats-value">
                {Math.round(analytics?.avg_clause_length ?? 0)}
              </div>
              <div className="stats-subtitle">Words per clause</div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="premium-stats-card accent-high p-3">
              <div className="stats-title">Model Accuracy</div>
              <div className="stats-value">
                {analytics?.model_accuracy
                  ? `${Math.round(analytics.model_accuracy * 100)}%`
                  : "0%"}
              </div>
              <div className="stats-subtitle">ML performance</div>
            </div>
          </div>

        </div>

        {/* MAIN SECTION */}
        <div className="row g-4">

          {/* CHART */}
          <div className="col-lg-7">
            <motion.div
              className="card dashboard-panel p-4 h-100"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h6 className="fw-semibold mb-3">Risk Distribution</h6>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <RiskChart summary={summary} />
              </motion.div>

            </motion.div>
          </div>

          {/* INSIGHTS */}
          <div className="col-lg-5">
            <motion.div
              className="card dashboard-panel p-4 h-100"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h6 className="fw-semibold mb-3">AI Insights</h6>

              <AIInsights summary={summary} analytics={analytics} />

            </motion.div>
          </div>

        </div>

      </motion.div>

    </PageWrapper>
  )

}

export default Dashboard