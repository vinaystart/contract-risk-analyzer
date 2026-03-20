import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { analyzeContract } from "../services/api"

import ContractPDFViewer from "../components/contract/ContractPDFViewer"
import InteractiveContractViewer from "../components/contract/InteractiveContractViewer"

function Analyze() {

  const { id } = useParams()

  const [clauses, setClauses] = useState([])
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(true)

  const [summary, setSummary] = useState({
    high: 0,
    medium: 0,
    low: 0
  })

  useEffect(() => {

    if (!id) {
      setLoading(false)
      return
    }

    const loadAnalysis = async () => {

      try {

        const res = await analyzeContract(id)

        const data = res.data.risks || []

        // 🔥 UPDATED MAPPING (FULL AI DATA)
        const formatted = data.map((c) => ({
          risk: c.risk || "Low",
          text: c.clause || c.text,
          confidence: c.confidence || 0,
          explanation: c.explanation || "AI-generated insight",
          category: c.category || "General",
          entities: c.entities || []
        }))

        setClauses(formatted)

        // 🔥 SUMMARY (ROBUST)
        let high = 0, medium = 0, low = 0

        formatted.forEach(c => {
          const r = (c.risk || "").toLowerCase()
          if (r === "high") high++
          else if (r === "medium") medium++
          else low++
        })

        setSummary({ high, medium, low })

        const fullUrl = `http://127.0.0.1:8000${res.data.file_url}`
        setFileUrl(fullUrl)

      } catch (err) {
        console.error("Analysis failed", err)
      }

      setLoading(false)
    }

    loadAnalysis()

  }, [id])

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Analyzing contract with AI...</p>
      </div>
    )
  }

  if (!id) {
    return <h4>Please select a contract from Dashboard</h4>
  }

  return (

    <div className="container-fluid">

      {/* 🔥 HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">Contract Analysis</h2>
          <small className="text-muted">
            AI-powered risk detection, classification & explanation
          </small>
        </div>

        <button
          className="btn btn-success px-4 py-2 shadow-sm"
          onClick={() => {
            window.open(`http://127.0.0.1:8000/api/contracts/analysis/report/${id}/`)
          }}
        >
          ⬇ Download Report
        </button>

      </div>

      {/* 🔥 SUMMARY CARDS */}
      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm p-3 text-center border-0" style={{ background: "#fee2e2" }}>
            <h4 className="fw-bold text-danger">{summary.high}</h4>
            <p className="mb-0">High Risk</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-3 text-center border-0" style={{ background: "#fef3c7" }}>
            <h4 className="fw-bold text-warning">{summary.medium}</h4>
            <p className="mb-0">Medium Risk</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-3 text-center border-0" style={{ background: "#dcfce7" }}>
            <h4 className="fw-bold text-success">{summary.low}</h4>
            <p className="mb-0">Low Risk</p>
          </div>
        </div>

      </div>

      {/* 🔥 MAIN VIEW */}
      <div className="card shadow-sm p-3 border-0">

        {fileUrl.endsWith(".pdf") ? (

          <ContractPDFViewer
            fileUrl={fileUrl}
            risks={clauses}
          />

        ) : (

          <InteractiveContractViewer
            clauses={clauses}
          />

        )}

      </div>

      {/* 🔥 AI CLAUSE CARDS (NEW - PREMIUM VIEW) */}
      <div className="mt-4">

        <h5 className="fw-bold mb-3">Clause Intelligence</h5>

        {clauses.map((c, index) => (

          <div key={index} className={`risk-card ${c.risk.toLowerCase()}`}>

            {/* Clause */}
            <p className="clause-text">{c.text}</p>

            {/* Badges */}
            <div className="d-flex gap-2 flex-wrap mb-2">

              <span className={`badge bg-${getColor(c.risk)}`}>
                {c.risk}
              </span>

              <span className="badge bg-dark">
                {c.category}
              </span>

              <span className="badge bg-secondary">
                {Math.round((c.confidence || 0) * 100)}%
              </span>

            </div>

            {/* Explanation */}
            <p className="explanation">
              💡 {c.explanation}
            </p>

            {/* Entities */}
            {c.entities?.length > 0 && (
              <div className="mt-2">

                <small className="text-muted">Entities:</small>

                <div className="d-flex flex-wrap gap-1 mt-1">
                  {c.entities.map((e, i) => (
                    <span key={i} className="badge bg-light text-dark border">
                      {e.text} ({e.label})
                    </span>
                  ))}
                </div>

              </div>
            )}

          </div>

        ))}

      </div>

    </div>

  )

}

// 🔹 Helper
const getColor = (risk) => {
  if (risk === "High") return "danger"
  if (risk === "Medium") return "warning"
  return "success"
}

export default Analyze