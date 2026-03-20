// src/pages/Login.jsx
// ─────────────────────────────────────────────────────────────────
//  Login page — calls POST /api/auth/login, stores JWT,
//  then redirects into the dashboard.
//
//  Place this at the top level. In main.jsx:
//    if (!isLoggedIn()) render <Login onLogin={() => setLoggedIn(true)} />
//    else               render <App />
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { auth } from "../services/api";

const Login = ({ onLogin }) => {
  const [email,    setEmail]    = useState("asif@smartenergy.com");
  const [password, setPassword] = useState("admin123");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1e3a8a 50%, #0a1628 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "20px",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .login-input:focus { border-color: #f59e0b !important; outline: none; }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245,158,11,0.45) !important; }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        background: "#fff", borderRadius: 24, padding: "44px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        animation: "fadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) both",
      }}>

        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
            fontSize: 30,
          }}>⚡</div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 26,
            color: "#0a1628", margin: "0 0 6px",
          }}>SmartEnergy</h1>
          <p style={{ fontSize: 13.5, color: "#9ca3af", margin: 0 }}>
            Sign in to your energy dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 12,
            padding: "11px 14px", marginBottom: 18,
            fontSize: 13, color: "#dc2626", fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Email */}
          <div>
            <label style={{
              fontSize: 12.5, fontWeight: 700, color: "#374151",
              display: "block", marginBottom: 7,
              fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Email</label>
            <input
              className="login-input"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              placeholder="asif@smartenergy.com"
              style={{
                width: "100%", padding: "12px 14px", boxSizing: "border-box",
                border: "1.5px solid #e5e7eb", borderRadius: 12,
                fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize: 12.5, fontWeight: 700, color: "#374151",
              display: "block", marginBottom: 7,
              fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Password</label>
            <input
              className="login-input"
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 14px", boxSizing: "border-box",
                border: "1.5px solid #e5e7eb", borderRadius: 12,
                fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{
              marginTop: 4,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "13px", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Dev hint */}
        <div style={{
          marginTop: 24, padding: "12px 14px",
          background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 12,
          fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.6,
        }}>
          Default: <strong style={{ color: "#374151" }}>asif@smartenergy.com</strong>
          {" / "}<strong style={{ color: "#374151" }}>admin123</strong><br/>
          Run <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 4 }}>npm run seed</code> first if fields are empty.
        </div>
      </div>
    </div>
  );
};

export default Login;
