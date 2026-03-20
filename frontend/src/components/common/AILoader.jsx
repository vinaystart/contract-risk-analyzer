import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AILoader({ isOpen }) {

  const steps = [
    "Scanning clauses",
    "Detecting entities",
    "Classifying risks",
    "Generating insights"
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");

  // 🔥 PROGRESS + STEP ENGINE (FIXED)
  useEffect(() => {

    if (!isOpen) return;

    setProgress(0);
    setCurrentStep(0);

    let prog = 0;

    const interval = setInterval(() => {

      // 🚀 faster + smoother
      prog += 6 + Math.random() * 4;

      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }

      const rounded = Math.floor(prog);
      setProgress(rounded);

      // 🔥 PERFECT STEP DISTRIBUTION
      if (rounded < 20) {
        setCurrentStep(0);
      } else if (rounded < 40) {
        setCurrentStep(1);
      } else if (rounded < 65) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }

    }, 650);

    return () => clearInterval(interval);

  }, [isOpen]);

  // 🔥 TYPING ANIMATION (AI FEEL)
  useEffect(() => {

    if (!isOpen) return;

    let index = 0;
    const text = steps[currentStep] + "...";

    setDisplayText("");

    const typing = setInterval(() => {
      index++;
      setDisplayText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(typing);
      }
    }, 35);

    return () => clearInterval(typing);

  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  return (

    <div className="ai-overlay-partial">

      <motion.div
        className="ai-modal"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >

        <h4 className="fw-bold mb-2">
          🤖 AI Processing
        </h4>

        {/* 🔥 TYPING TEXT WITH FADE */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            className="ai-typing mb-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {displayText}
            <span className="cursor">|</span>
          </motion.p>
        </AnimatePresence>

        {/* 🔥 PROGRESS BAR */}
        <div className="progress mb-3">
          <motion.div
            className="progress-bar"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            style={{
              background: "linear-gradient(90deg,#6366f1,#4f46e5)"
            }}
          />
        </div>

        <div className="d-flex justify-content-between mb-4">
          <small className="text-muted">Processing</small>
          <strong>{progress}%</strong>
        </div>

        {/* 🔥 STEPS */}
        <div className="text-start">

          {steps.map((step, index) => (

            <motion.div
              key={index}
              className={`d-flex align-items-center gap-2 mb-2 step-row ${
                index === currentStep ? "active" : ""
              }`}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                scale: index === currentStep ? 1.05 : 1
              }}
              transition={{ duration: 0.25 }}
            >

              <span className="step-icon">
                {index < currentStep ? "✔" : index === currentStep ? "⟳" : "○"}
              </span>

              <small>{step}</small>

            </motion.div>

          ))}

        </div>

      </motion.div>

    </div>

  );

}

export default AILoader;