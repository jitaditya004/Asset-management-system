import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import SendToRepair from "./SendToRepair";
import { cancelMaintenance } from "../services/maintenance.service";


export default function AssetActionsMenu({ asset, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  // close on outside click
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cancelRepair = async () => {
    const ok = window.confirm("Cancel maintenance request?");
    if (!ok) return;

    try {
      setLoading(true);
      await cancelMaintenance(asset.maintenance_id);
      await onRefresh();
      setOpen(false);
    } catch (err) {
      alert("Failed to cancel repair request");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-9 h-9 rounded-full
          flex items-center justify-center
          text-white/80
          bg-white/10 backdrop-blur
          hover:bg-white/20
          active:scale-95
          transition
        "
      >
        <span className="text-xl leading-none">⋮</span>
      </button>

      {open && (
        <div
          className="
            fixed
            top-20 right-8
            w-60
            rounded-2xl
            bg-gradient-to-br from-slate-900/90 to-slate-800/90
            backdrop-blur-xl
            border border-white/10
            shadow-2xl
            z-[9999]
            animate-[fadeIn_0.15s_ease-out]
          "
        >
          {/* Header */}
          <div
            className="
              px-4 py-2 text-xs font-semibold
              text-white/40 uppercase
              tracking-wider
            "
          >
            Actions
          </div>

          {/* Request Asset */}
          <Link
            to={`/asset/${asset.asset_id}/request`}
            className="
              flex items-center gap-3
              px-4 py-3 text-sm
              text-white/90
              hover:bg-white/10
              transition
            "
            onClick={() => setOpen(false)}
          >
            <span>📄</span>
            Request Asset
          </Link>

          {/* Send to Repair */}
          {asset.status === "ACTIVE" && (
            <div className="px-3 py-2">
              <SendToRepair
                asset={asset}
                onSuccess={() => {
                  onRefresh();
                  setOpen(false);
                }}
              />
            </div>
          )}

          {/* Divider */}
          {asset.status === "OPEN" && (
            <div className="my-1 h-px bg-white/10" />
          )}

          {/* Cancel Repair */}
          {asset.status === "OPEN" && (
            <button
              onClick={cancelRepair}
              disabled={loading}
              className="
                w-full flex items-center gap-3
                px-4 py-3 text-sm
                text-red-400
                hover:bg-red-500/10
                transition
                disabled:opacity-50
              "
            >
              {loading ? "⏳ Cancelling..." : "🛑 Cancel Repair"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
