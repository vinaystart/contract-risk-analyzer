import { motion } from "framer-motion"
import { Github, Linkedin, Mail } from "lucide-react"

function Footer() {

  return (

    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-5"
      style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "#cbd5f5"
      }}
    >

      <div className="container py-4">

        <div className="row align-items-center">

          {/* LEFT */}
          <div className="col-md-4 mb-3 mb-md-0">

            <h6 className="fw-bold mb-1 text-white">
              AI Contract Risk Analyzer
            </h6>

            <small>
              AI-powered legal risk detection platform
            </small>

          </div>

          {/* CENTER */}
          <div className="col-md-4 text-center mb-3 mb-md-0">

            <small>
              © {new Date().getFullYear()} All rights reserved
            </small>

            <div className="mt-1">

              <a href="#" className="text-decoration-none text-light me-3">
                Privacy
              </a>

              <a href="#" className="text-decoration-none text-light">
                Terms
              </a>

            </div>

          </div>

          {/* RIGHT */}
          <div className="col-md-4 text-md-end text-center">

            <div className="d-flex justify-content-md-end justify-content-center gap-3">

              <a href="#" className="text-light">
                <Github size={18} />
              </a>

              <a href="#" className="text-light">
                <Linkedin size={18} />
              </a>

              <a href="#" className="text-light">
                <Mail size={18} />
              </a>

            </div>

          </div>

        </div>

      </div>

    </motion.footer>

  )

}

export default Footer