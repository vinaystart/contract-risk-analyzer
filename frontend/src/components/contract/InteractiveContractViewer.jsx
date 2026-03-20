import { useState } from "react"

function InteractiveContractViewer({ clauses = [] }) {

  const [selectedClause, setSelectedClause] = useState(null)

  const getColor = (risk) => {

    if (risk === "High" || risk === "high") return "#fee2e2"
    if (risk === "Medium" || risk === "medium") return "#fef3c7"

    return "#dcfce7"

  }

  return (

    <div className="row g-4">

      {/* CONTRACT TEXT VIEWER */}
      <div className="col-md-8">

        <div className="card p-4 shadow">

          <h5 className="mb-3">Contract Document</h5>

          <div
            style={{
              maxHeight: "520px",
              overflowY: "auto"
            }}
          >

            {clauses.length === 0 && (
              <p>No clauses detected.</p>
            )}

            {clauses.map((clause, index) => (

              <div
                key={index}
                onClick={() => setSelectedClause(clause)}
                style={{
                  background: getColor(clause.risk),
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border:
                    selectedClause === clause
                      ? "2px solid #2563eb"
                      : "1px solid transparent"
                }}
              >

                <strong>{clause.risk} Risk</strong>

                <p className="mb-0">
                  {clause.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* AI ANALYSIS PANEL */}
      <div className="col-md-4">

        <div className="card p-4 shadow">

          <h5>AI Insights</h5>

          {!selectedClause && (
            <p>Select a clause to view AI explanation.</p>
          )}

          {selectedClause && (

            <div>

              <p>
                <strong>Risk Level:</strong>
                {" "}
                {selectedClause.risk}
              </p>

              <p>
                <strong>Clause:</strong>
                <br />
                {selectedClause.text}
              </p>

              <p>
                <strong>Explanation:</strong>
                <br />
                {selectedClause.explanation}
              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  )

}

export default InteractiveContractViewer