import { useEffect, useState } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OnlineStatusBanner() {
//   const [online, setOnline] = useState(navigator.onLine);
    const online = useOnlineStatus();


  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={`w-full text-sm font-medium flex items-center justify-center gap-2 py-1
        ${online ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full
          ${online ? "bg-green-300" : "bg-red-300"}`}
      />
      {online ? "Online" : "Offline – features missing"}
    </div>
  );
}
