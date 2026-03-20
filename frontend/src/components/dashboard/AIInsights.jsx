import { motion } from "framer-motion"
import { Sparkles, AlertTriangle, BarChart3 } from "lucide-react"

function AIInsights({ summary = {}, analytics = {} }) {

  const insights = []

  const total =
    (summary.high || 0) +
    (summary.medium || 0) +
    (summary.low || 0)

  if (total > 0) {

    const highPercent = Math.round((summary.high / total) * 100)
    const lowPercent = Math.round((summary.low / total) * 100)

    if (summary.high > 0) {
      insights.push({
        icon: <AlertTriangle size={16} />,
        text: `${summary.high} high-risk clauses detected (${highPercent}%). Immediate review recommended.`
      })
    }

    if (summary.medium > 0) {
      insights.push({
        icon: <BarChart3 size={16} />,
        text: `${summary.medium} medium-risk clauses found. Monitor compliance areas.`
      })
    }

    if (summary.low > 0) {
      insights.push({
        icon: <Sparkles size={16} />,
        text: `${lowPercent}% of clauses are low risk, indicating a generally safe contract.`
      })
    }

    if (analytics.avg_clause_length) {
      insights.push({
        icon: <Sparkles size={16} />,
        text: `Average clause length is ${Math.round(analytics.avg_clause_length)} words, suggesting ${analytics.avg_clause_length > 10 ? "complex" : "concise"} contracts.`
      })
    }

  } else {
    insights.push({
      icon: <Sparkles size={16} />,
      text: "No contracts analyzed yet."
    })
  }

  return (

    <div>

      {insights.map((insight, index) => (

        <motion.div
          key={index}
          className="insight-card mb-3 p-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          style={{
            borderRadius: "12px",
            background: "linear-gradient(135deg,#f8fafc,#ffffff)",
            border: "1px solid #eee"
          }}
        >

          <div className="d-flex gap-2 align-items-start">

            <div className="mt-1 text-primary">
              {insight.icon}
            </div>

            <div>
              <p className="mb-1 fw-semibold">
                AI Insight
              </p>

              <small className="text-muted">
                {insight.text}
              </small>
            </div>

          </div>

        </motion.div>

      ))}

    </div>

  )

}

export default AIInsights