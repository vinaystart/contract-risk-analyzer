import { useState, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { motion } from "framer-motion"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// ✅ Worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

function ContractPDFViewer({ fileUrl, risks = [] }) {

  const [numPages, setNumPages] = useState(null)
  const [selectedRisk, setSelectedRisk] = useState(null)

  const containerRef = useRef(null)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // 🎯 Scroll to page
  const scrollToPage = (page) => {
    const el = document.getElementById(`page-${page}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  // 🎨 styles
  const getStyles = (level) => {

    const l = (level || "low").toLowerCase()

    if (l === "high") {
      return { color: "#ef4444", glow: "rgba(239,68,68,0.25)" }
    }

    if (l === "medium") {
      return { color: "#f59e0b", glow: "rgba(245,158,11,0.25)" }
    }

    return { color: "#22c55e", glow: "rgba(34,197,94,0.25)" }
  }

  // 🔥 Render highlights
  const renderHighlights = (pageNumber) => {

    return risks
      .filter(r => r.positions?.some(p => p.page === pageNumber))
      .flatMap((risk, i) => {

        const styles = getStyles(risk.risk)

        return risk.positions
          .filter(p => p.page === pageNumber)
          .map((pos, idx) => (

            <div
              key={`${i}-${idx}`}
              style={{
                position: "absolute",
                left: pos.x0,
                top: pos.top,
                width: pos.x1 - pos.x0,
                height: pos.bottom - pos.top,
                background: styles.glow,
                border: `1px solid ${styles.color}`,
                borderRadius: "3px",
                pointerEvents: "none"
              }}
            />

          ))
      })
  }

  return (

    <div className="row g-4">

      {/* ================= PDF ================= */}
      <div className="col-lg-8">

        <div className="card border-0 shadow-sm p-3">

          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-semibold mb-0">Smart Contract Viewer</h5>
            <span className="badge bg-primary">{numPages || 0} pages</span>
          </div>

          <div
            ref={containerRef}
            style={{
              maxHeight: "650px",
              overflowY: "auto",
              borderRadius: "12px",
              background: "#f8fafc"
            }}
          >

            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>

              {numPages &&
                Array.from(new Array(numPages), (el, index) => {

                  const pageNumber = index + 1

                  return (

                    <motion.div
                      key={index}
                      id={`page-${pageNumber}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ position: "relative" }}
                      className="mb-4"
                    >

                      <Page pageNumber={pageNumber} width={650} />

                      {/* 🔥 Highlight Layer */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none"
                        }}
                      >
                        {renderHighlights(pageNumber)}
                      </div>

                    </motion.div>

                  )

                })
              }

            </Document>

          </div>

        </div>

      </div>

      {/* ================= AI PANEL ================= */}
      <div className="col-lg-4">

        <div
          className="card border-0 shadow-sm p-3"
          style={{
            position: "sticky",
            top: "80px",
            maxHeight: "650px",
            overflowY: "auto"
          }}
        >

          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-semibold mb-0">AI Insights</h5>
            <span className="badge bg-dark">AI</span>
          </div>

          {risks.length === 0 ? (

            <div className="text-center text-muted mt-4">
              No risks detected
            </div>

          ) : (

            risks.map((risk, index) => {

              const styles = getStyles(risk.risk)

              return (

                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedRisk(risk)

                    const page = risk.positions?.[0]?.page
                    if (page) scrollToPage(page)
                  }}
                  className="mb-3 p-3"
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    cursor: "pointer",
                    border: `1px solid ${styles.color}`,
                    boxShadow:
                      selectedRisk === risk
                        ? `0 0 0 2px ${styles.glow}`
                        : "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                >

                  <div className="d-flex justify-content-between mb-2">

                    <span
                      className="badge"
                      style={{
                        background: styles.color,
                        color: "white"
                      }}
                    >
                      {risk.risk}
                    </span>

                    <small className="text-muted">
                      {Math.round((risk.confidence || 0) * 100)}%
                    </small>

                  </div>

                  <p className="fw-medium mb-1" style={{ fontSize: "0.9rem" }}>
                    {risk.text}
                  </p>

                  {risk.category && (
                    <span className="badge bg-secondary mb-2">
                      {risk.category}
                    </span>
                  )}

                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    💡 {risk.explanation}
                  </p>

                </motion.div>

              )

            })

          )}

        </div>

      </div>

    </div>

  )

}

export default ContractPDFViewer