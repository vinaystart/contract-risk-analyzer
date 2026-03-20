import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Auth({ setUser }) {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("SENDING:", { name, email, password });

    try {

      if (isLogin) {

        // ✅ LOGIN
        const res = await API.post("/login/", {
          email,
          password
        });

        const { access, user } = res.data;

        localStorage.setItem("token", access);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        navigate("/");

      } else {

        // ✅ REGISTER
        await API.post("/register/", {
          name,
          email,
          password
        });

        // UX reset
        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
        setError("Account created! Please login.");

      }

    } catch (err) {

      console.error("ERROR:", err.response?.data);

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong"
      );

    }
  };

  return (

    <div className="container-fluid vh-100">

      <div className="row h-100">

        {/* LEFT */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="fw-bold mb-3">
              AI Contract Risk Analyzer
            </h1>
            <p style={{ maxWidth: "360px" }}>
              Upload contracts and detect risky clauses using AI.
            </p>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="card shadow p-5"
            style={{ width: "380px" }}
          >

            <h4 className="fw-bold mb-4 text-center">
              {isLogin ? "Login" : "Create Account"}
            </h4>

            <form onSubmit={handleSubmit}>

              {!isLogin && (
                <input
                  className="form-control mb-3"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="text-success text-center mb-2">
                  {error}
                </div>
              )}

              <button className="btn btn-primary w-100">
                {isLogin ? "Login" : "Sign Up"}
              </button>

            </form>

            <p className="text-center mt-3">
              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <button
                className="btn btn-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>

          </motion.div>

        </div>

      </div>

    </div>
  );
}

export default Auth;