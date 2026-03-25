import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Auth({ setUser }) {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [passwordMatch, setPasswordMatch] = useState(null);

  // ================= TOAST =================
  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // ================= PASSWORD MATCH =================
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatch(null);
    } else if (password === confirmPassword) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [password, confirmPassword]);

  // ================= PASSWORD VALIDATION =================
  const isValidPassword = (pwd) => {
    return /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/.test(pwd);
  };

  // ================= OTP =================
  const handleOtpChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);

    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`).focus();
    }
  };

  const handleSendOtp = async () => {
    if (!email) return showToast("Enter email", "error");

    setLoading(true);
    try {
      await API.post("/accounts/send-otp/", { email });
      setOtpSent(true);
      showToast("OTP sent 📩");
    } catch {
      showToast("Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) return showToast("Enter full OTP", "error");

    setLoading(true);
    try {
      await API.post("/accounts/verify-otp/", { email, otp: finalOtp });
      setOtpVerified(true);
      showToast("Email verified ✅");
    } catch {
      showToast("Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpVerified) return showToast("Verify email first", "error");

    if (!isValidPassword(password))
      return showToast("Password must be strong", "error");

    if (password !== confirmPassword)
      return showToast("Passwords do not match", "error");

    setLoading(true);
    try {
      await API.post("/accounts/register/", { name, email, password });
      showToast("Account created 🎉");
      setIsLogin(true);
    } catch {
      showToast("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await API.post("/accounts/login/", { email, password });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("Welcome 🚀");

      setTimeout(() => {
        setUser(res.data.user);
        navigate("/");
      }, 800);

    } catch {
      showToast("Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* LEFT */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-dark text-white">
          <h1>AI Contract Risk Analyzer</h1>
        </div>

        {/* RIGHT */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">

          <motion.div className="card p-5 shadow" style={{ width: "380px" }}>

            <h4 className="text-center mb-4">
              {isLogin ? "Login" : "Create Account"}
            </h4>

            {isLogin ? (
              <form onSubmit={handleLogin}>
                <input className="form-control mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button className="btn btn-primary w-100">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>

                <input className="form-control mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

                <input className="form-control mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                {!otpVerified && (
                  <button type="button" className="btn btn-outline-primary w-100 mb-3" onClick={handleSendOtp}>
                    Verify Email
                  </button>
                )}

                {otpSent && !otpVerified && (
                  <>
                    <div className="d-flex justify-content-between mb-3">
                      {otp.map((d, i) => (
                        <input key={i} id={`otp-${i}`} maxLength="1" className="form-control text-center mx-1" value={d} onChange={(e) => handleOtpChange(e.target.value, i)} />
                      ))}
                    </div>

                    <button type="button" className="btn btn-success w-100 mb-3" onClick={handleVerifyOtp}>
                      Verify OTP
                    </button>
                  </>
                )}

                {otpVerified && <small className="text-success">✔ Email verified</small>}

                <input type="password" className="form-control mt-3 mb-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {/* ❌ show ONLY if invalid */}
                {!isValidPassword(password) && password && (
                  <small className="text-danger">
                    (Min 8 chars, 1 capital, 1 number, 1 special)
                  </small>
                )}

                <input
                  type="password"
                  className={`form-control mt-2 ${
                    passwordMatch === true
                      ? "border-success"
                      : passwordMatch === false
                      ? "border-danger"
                      : ""
                  }`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* ONLY show match status */}
                {passwordMatch === true && (
                  <small className="text-success">✔ Passwords match</small>
                )}
                {passwordMatch === false && (
                  <small className="text-danger">❌ Passwords do not match</small>
                )}

                <button className="btn btn-primary w-100 mt-3">
                  {loading ? "Creating..." : "Sign Up"}
                </button>
              </form>
            )}

            <p className="text-center mt-3">
              {isLogin ? "New here?" : "Already have account?"}
              <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>

          </motion.div>
        </div>
      </div>

      {/* TOAST */}
      {toast.message && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: toast.type === "error" ? "#dc3545" : "#28a745",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "6px"
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Auth;