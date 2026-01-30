import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { logout } from "../auth/auth";
import OnlineStatusPill from "../components/OnlineStatusPill";

export default function Navbar({ onMenu, sidebarOpen }) {
  const nav = useNavigate();

  return (
    <nav
      className="
        fixed top-0 left-0 right-0
        h-14 sm:h-16
        z-50
        bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90
        border-b border-white/10
        shadow-lg
      "
    >
      <div className="px-4 h-14 sm:h-16 flex items-center justify-between">

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onMenu}
            className="md:hidden text-white text-2xl focus:outline-none active:scale-95 transition"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

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
            <span className="hidden sm:inline">Asset Management Portal</span>
            <span className="sm:hidden">Asset Manager</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">

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
