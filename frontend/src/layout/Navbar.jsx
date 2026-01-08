import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { logout } from "../auth/auth";
import OnlineStatusPill from "../components/OnlineStatusPill";
export default function Navbar() {
  const nav = useNavigate();

  return (
    <nav
      className="
        sticky top-0 z-50
        backdrop-blur-xl
        bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90
        border-b border-white/10
        shadow-lg
      "
    >
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <Link
          to="/"
          className="
            text-white font-semibold tracking-wide
            text-lg
            hover:text-white/90
            transition
          "
        >
          Asset Management Portal
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Online status */}
          <OnlineStatusPill />

          {/* Logout */}
          <button
            onClick={async () => {
              await logout(API);
              nav("/login");
            }}
            className="
              flex items-center gap-2
              bg-red-500/20 text-red-300
              border border-red-500/30
              hover:bg-red-500/30 hover:text-red-200
              px-4 py-2 rounded-lg
              text-sm font-medium
              transition
              active:scale-95
            "
          >
            ⏻ Logout
          </button>
        </div>
      </div>
    </nav>
  );
}



