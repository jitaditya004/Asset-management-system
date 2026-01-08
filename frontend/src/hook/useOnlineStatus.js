import { useEffect, useState } from "react";

export default function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  async function checkInternet() {
    try {
      // lightweight request – no CORS issues
      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        cache: "no-store",
        mode: "no-cors",
      });
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }

  useEffect(() => {
    checkInternet();

    const on = () => checkInternet();
    const off = () => setOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const interval = setInterval(checkInternet, 10000); // re-check

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      clearInterval(interval);
    };
  }, []);

  return online;
}
