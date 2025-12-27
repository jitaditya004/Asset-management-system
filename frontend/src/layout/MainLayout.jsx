import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  return (
  <div className="flex flex-col h-screen  ">
    <Navbar />

    <div className="flex flex-1 overflow-hidden bg-gradient-to-tr ">
      
      {/* Sidebar – glassy */}
      <aside className="
        w-64 overflow-y-auto
        backdrop-blur-lg
        border-r border-white/40
        shadow-lg 
      ">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="
        flex-1 p-4 overflow-y-scroll
        bg-gradient-to-br from-purple-600 via-pink-400 to-pink-600
        backdrop-blur-xl
      ">
        <Outlet />
      </main>

    </div>
  </div>
);

}

