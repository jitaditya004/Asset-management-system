import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { useState, useRef, useEffect } from "react";

export default function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

    if (newWidth >= 50 && newWidth <= 900) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="min-h-0 h-screen flex flex-col bg-black/30">

        {/* Top Navbar */}
        <Navbar onMenu={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen} />

        {/* Body */}
        <div className="flex flex-1 min-h-0 min-w-0 pt-14 sm:pt-16">

          {/* Sidebar Backdrop (mobile) */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}

          <aside
            ref={sidebarRef}
            style={{ width: isMobile ? 260 : sidebarWidth }}
            className={`
              z-50
              bg-slate-900/80
              border-r border-white/10
              overflow-hidden
              transition-transform duration-300

              fixed inset-y-0 left-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

              md:relative md:translate-x-0 md:h-full
            `}
          >
            <Sidebar />

            {/* Resize handle */}
            {!isMobile && (
              <div
                onMouseDown={onMouseDown}
                className="
                  absolute top-0 right-0 h-full w-1
                  cursor-col-resize
                  hover:bg-slate-600/50
                  transition-colors
                "
              />
            )}
          </aside>

          {/* Main content */}
          <main
            className="
              flex-1 overflow-y-auto p-1
              bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
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
