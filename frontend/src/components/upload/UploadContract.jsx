import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadContract } from "../../services/api";
import AILoader from "../common/AILoader";

function UploadContract() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  // ✅ FILE VALIDATION
  const validateFile = (file) => {
    if (!file) return "Please select a file";

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF, DOCX, TXT files are allowed";
    }

    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleUpload = async () => {

    if (uploading) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgress(0);

    try {

      const res = await uploadContract(formData, (event) => {

        const percent = Math.round(
          (event.loaded * 100) / event.total
        );

        setProgress(percent);

      });

      const contractId = res.data?.contract_id;

      if (!contractId) {
        throw new Error("Contract ID missing");
      }

      // ✅ Smooth SaaS transition
      setUploading(false);
      setSuccess(true);

      // show success briefly
      setTimeout(() => {
        setAnalyzing(true);
      }, 700);

      // allow full AI animation (IMPORTANT)
      setTimeout(() => {
        navigate(`/analyze/${contractId}`);
      }, 5000);

    }
    catch (err) {

      console.error("Upload failed:", err);
      setUploading(false);
      setError("Upload failed. Please try again.");

    }

  };

  return (

    <div className={`container ${analyzing ? "blur-background" : ""}`}>

      {/* ✅ SaaS AI Modal */}
      <AILoader isOpen={analyzing} />

      <div className="upload-card p-5">

        <h3 className="fw-bold mb-4">
          
        </h3>

        <div
          className={`upload-drop-zone text-center p-5 ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            setFile(e.dataTransfer.files[0]);
          }}
        >

          <div className="upload-icon">📄</div>

          <h5>Drag & Drop Contract</h5>

          <p className="text-muted">
            PDF, DOCX, TXT (Max 10MB)
          </p>

          <input
            type="file"
            id="contractFile"
            name="contractFile"
            className="form-control mt-3"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (

            <div className="file-preview mt-3 p-2 rounded bg-light">

              <strong>{file.name}</strong>
              <div className="text-muted small">
                {(file.size / 1024).toFixed(2)} KB
              </div>

            </div>

          )}

        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger mt-3 text-center">
            {error}
          </div>
        )}

        <button
          className="btn upload-btn mt-4 w-100"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? `Uploading... ${progress}%`
            : success
            ? "Processing..."
            : "Upload & Analyze"}
        </button>

        {/* PROGRESS */}
        {uploading && (

          <div className="mt-4">

            <div className="progress">

              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>

            </div>

          </div>

        )}

        {/* SUCCESS */}
        {success && !analyzing && (

          <div className="alert alert-success mt-4 text-center">

            ✔ Contract uploaded successfully. Preparing analysis...

          </div>

        )}

      </div>

    </div>

  );

}

export default UploadContract;