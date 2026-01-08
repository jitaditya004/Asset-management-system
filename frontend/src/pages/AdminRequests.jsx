import { useEffect, useState } from "react";
import { getAllRequests, reviewRequest } from "../services/request.service";
import {
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  User,
  Package
} from "lucide-react";

const HIDDEN_KEY = "admin_hidden_requests";

const getHiddenIds = () =>
  JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");

const saveHiddenIds = (ids) =>
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [reasonMap, setReasonMap] = useState({});

  const load = () =>
    getAllRequests().then(res => {
      const hiddenIds = getHiddenIds();
      const visible = res.data.filter(
        r => !hiddenIds.includes(r.request_id)
      );
      setRequests(visible);
    });

  const removeFromUI = (id) => {
    const hiddenIds = getHiddenIds();
    const updated = [...new Set([...hiddenIds, id])];
    saveHiddenIds(updated);
    setRequests(prev => prev.filter(r => r.request_id !== id));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action) => {
    const reason = reasonMap[id] || "";
    await reviewRequest(id, action, reason);
    load();
  };
return (
  <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">

    {/* Header */}
    <div
      className="
        flex items-center justify-between
        bg-gradient-to-r from-indigo-600 to-purple-600
        rounded-2xl px-6 py-4
        shadow-lg
      "
    >
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Package size={22} />
        Asset Requests
      </h1>

      <button
        onClick={() => {
          localStorage.removeItem(HIDDEN_KEY);
          load();
        }}
        className="
          flex items-center gap-2 text-sm
          bg-white/20 hover:bg-white/30
          px-4 py-2 rounded-lg
          transition
        "
      >
        <RefreshCw size={14} />
        Show all
      </button>
    </div>

    {/* Empty state */}
    {requests.length === 0 && (
      <div
        className="
          text-center py-16
          text-white/50
          border border-white/10
          rounded-2xl
          bg-white/5
        "
      >
        🎉 No pending or active requests
      </div>
    )}

    {/* Cards */}
    {requests.map((r) => (
      <div
        key={r.request_id}
        className="
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl p-5
          shadow-lg
          hover:shadow-xl hover:-translate-y-1
          transition
        "
      >
        {/* Top row */}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-semibold flex items-center gap-2 text--100">
              <Package size={16} />
              {r.asset_name}
            </p>

            <p className="text-sm text-white/60 flex items-center gap-1">
              <User size={14} />
              Requested by {r.requested_by_name}
            </p>
          </div>

          {/* Status */}
          <span
            className={`
              shrink-0 px-3 py-1 rounded-full
              text-xs font-semibold tracking-wide
              ${
                r.status === "PENDING"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : r.status === "APPROVED"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }
            `}
          >
            {r.status}
          </span>
        </div>

        {/* Actions */}
        {r.status === "PENDING" ? (
          <div className="mt-5 space-y-4">
            <textarea
              placeholder="Optional reason (visible to requester)"
              value={reasonMap[r.request_id] || ""}
              onChange={(e) =>
                setReasonMap((prev) => ({
                  ...prev,
                  [r.request_id]: e.target.value,
                }))
              }
              className="
                w-full rounded-lg
                bg-white/10 border border-white/10
                px-3 py-2 text-sm
                text-white placeholder:text-white/40
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                resize-none
              "
            />

            <div className="flex gap-3">
              <button
                onClick={() => act(r.request_id, "APPROVE")}
                className="px-4
                  flex items-center gap-2 flex-1
                  bg-gradient-to-r from-green-600 to-emerald-600
                  hover:from-green-700 hover:to-emerald-700
                  text-white py-2 rounded-lg
                  transition
                "
              >
                <CheckCircle size={16} />
                Approve
              </button>

              <button
                onClick={() => act(r.request_id, "REJECT")}
                className="px-4
                  flex items-center gap-2 flex-1
                  bg-red-500/20 hover:bg-red-500/30
                  text-red-300 py-2 rounded-lg
                  transition
                "
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => removeFromUI(r.request_id)}
            className="
              mt-5 flex items-center gap-2
              bg-white/10 hover:bg-white/20
              text-white/80
              px-4 py-2 rounded-lg text-sm
              transition
            "
          >
            <Trash2 size={14} />
            Remove from list
          </button>
        )}
      </div>
    ))}
  </div>
);

}
