import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { useState, useRef, useEffect } from "react";

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

    const left = sidebarRef.current.getBoundingClientRect().left;
    const newWidth = e.clientX - left;

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">

      {/* Glass shell */}
      <div className="h-screen flex flex-col backdrop-blur-xl bg-black/20">

        {/* Top Navbar */}
        <Navbar />

        {/* Body */}
        <div className="flex flex-1 min-h-0 min-w-0">

          {/* Sidebar */}
          <aside
            ref={sidebarRef}
            style={{ width: sidebarWidth }}
            className="
              relative min-w-0 overflow-hidden
              bg-slate-900/80 
              border-r border-white/10
              transition-[width] duration-75
            "
          >
            <Sidebar />

            {/* Resize handle */}
            <div
              onMouseDown={onMouseDown}
              className="
                absolute top-0 right-0 h-full w-1
                cursor-col-resize
                hover:bg-indigo-500/50
                transition-colors
              "
            />
          </aside>

          {/* Main content */}
          <main
            className="
              flex-1 overflow-y-auto p-6
              bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700
              text-white
                      "
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
