// PATCH for src/components/TopBar.jsx
// ─────────────────────────────────────────────────────────────────
//  Add this one import at the top of TopBar.jsx:
//
//    import { auth } from "../services/api";
//
//  Then find the existing handleSignOut function and replace it:
//
//  BEFORE:
//    const handleSignOut = () => {
//      addToast("Signed out", "success");
//    };
//
//  AFTER:
//    const handleSignOut = () => {
//      auth.logout(); // clears token and reloads page → shows Login
//    };
//
//  That's all. One import, one line change.
// ─────────────────────────────────────────────────────────────────

// For reference, the full handleSignOut replacement:

import { auth } from "../services/api";

// Inside the Topbar component:
const handleSignOut = () => {
  auth.logout(); // clears localStorage token, window.location.href = "/"
};