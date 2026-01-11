import { useEffect, useState } from "react";

export default function OnlineStatusPill() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className={`
        flex items-center gap-2
        px-3 py-1.5 rounded-full
        text-xs font-medium tracking-wide
        w-full
        border
        transition-all duration-300
        ${online
          ? "bg-green-500/15 text-green-300 border-green-500/30"
          : "bg-red-500/15 text-red-300 border-red-500/30"}
      `}
      style={{ minWidth: "110px" }}
    >
      {/* Pulse dot */}
      <span
        className={`
          relative flex h-2.5 w-2.5
        `}
      >
        <span
          className={`
            absolute inline-flex h-full w-full rounded-full
            ${online ? "bg-green-400 animate-ping" : "bg-red-400"}
            opacity-40
          `}
        />
        <span
          className={`
            relative inline-flex h-2.5 w-2.5 rounded-full
            ${online ? "bg-green-400" : "bg-red-400"}
          `}
        />
      </span>

      {online ? "Online" : "Offline"}
    </div>
  );
}
