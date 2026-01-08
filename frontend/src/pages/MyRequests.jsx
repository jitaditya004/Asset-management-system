import { useEffect, useState } from "react";
import { getMyAllRequests } from "../services/request.service";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getMyAllRequests().then(res => setRequests(res.data));
  }, []);

  const filtered = requests.filter(r =>
    filter === "ALL" ? true : r.type === filter
  );

return (
  <div className="p-6 max-w-4xl mx-auto space-y-6 text-white">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-wide">
        My Requests
      </h1>
      <span className="text-sm text-white/50">
        {filtered.length} items
      </span>
    </div>

    {/* Filters */}
    <div className="flex gap-3">
      {["ALL", "ASSET", "REPAIR"].map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`
            flex items-center gap-2
            px-4 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              filter === f
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-[1.03]"
                : "bg-white/10 hover:bg-white/20 text-white/70"
            }
          `}
        >
          {f === "ALL" && "📋"}
          {f === "ASSET" && "📦"}
          {f === "REPAIR" && "🛠️"}
          {f === "ALL" ? "All" : f === "ASSET" ? "Asset" : "Repair"}
        </button>
      ))}
    </div>

    {/* Empty state */}
    {filtered.length === 0 && (
      <div className="text-center py-12 text-white/50">
        No requests found
      </div>
    )}

    {/* Cards */}
    <div className="space-y-4">
      {filtered.map((r) => (
        <div
          key={`${r.type}-${r.id}`}
          className="
            group
            rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/10
            p-5
            shadow-lg
            hover:shadow-xl hover:-translate-y-0.5
            transition-all
          "
        >
          {/* Top row */}
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-lg truncate">
                {r.asset_name}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>

            <span
              className={`
                shrink-0
                flex items-center gap-1
                text-xs px-3 py-1 rounded-full font-semibold
                ${
                  r.type === "ASSET"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-orange-500/20 text-orange-300"
                }
              `}
            >
              {r.type === "ASSET" ? "📦 Asset" : "🛠️ Repair"}
            </span>
          </div>

          {/* Status */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-white/50">Status:</span>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium
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

          {/* Description */}
          {r.description && (
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {r.description}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

}
