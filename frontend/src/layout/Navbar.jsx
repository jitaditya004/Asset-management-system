import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { logout } from "../auth/auth";
export default function Navbar() {
  const nav = useNavigate();

  return (
    <nav className="bg-white border-b bg-gradient-to-b from-blue-700 via-blue-500 to-blue-600">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-white">
          Asset Management Portal
        </Link>
        <button
          onClick={async () => {
            await logout(API);
            nav("/login");
          }}
          className="text-lg text-white bg-red-600 hover:bg-red-800 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


