// src/main.jsx
// ─────────────────────────────────────────────────────────────────
//  Auth guard: if no JWT token → show Login page
//              if token exists  → show full Dashboard app
//
//  REPLACE your existing src/main.jsx with this file.
//  Keep everything else (App.jsx, index.html, vite.config.js) as-is.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./pages/Login";
import { isLoggedIn } from "./services/api";

const Root = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
