import React from "react";
import Navbar from "../layout/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar.jsx";
import {useState,useRef,useEffect} from "react";

export default function AppLayout() {
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const isResizing = useRef(false);
    const sidebarRef = useRef(null);

  const onMouseDown = () => {
    isResizing.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const onMouseUp = () => {
    isResizing.current = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  const onMouseMove = (e) => {
    if (!isResizing.current || !sidebarRef.current) return;

    const sidebarLeft =
      sidebarRef.current.getBoundingClientRect().left;

    const newWidth = e.clientX - sidebarLeft;

    // clamp
    if (newWidth >= 50 && newWidth <= 700) {
      setSidebarWidth(newWidth);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
  <div className="flex flex-col h-screen backdrop-blur-xl bg-white/20 ">
    <Navbar />

    <div className="flex flex-1 overflow-hidden bg-gradient-to-tr ">
      
      {/* Sidebar – glassy */}
      <aside
        ref={sidebarRef}
        style={{width: sidebarWidth }}
       className="
        relative
        backdrop-blur-lg
        border-r border-white/40
        shadow-lg 
      ">
        <Sidebar />
        {/* resize bar */}
        <div onMouseDown={onMouseDown} className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-400/40"/>
      </aside>

      {/* Main content */}
      <main className="
        flex-1 p-4 overflow-y-auto
        bg-gradient-to-br from-purple-600 via-pink-400 to-pink-600
        backdrop-blur-xl
      ">
        <Outlet />
      </main>

    </div>
  </div>
  </div>
);

}

