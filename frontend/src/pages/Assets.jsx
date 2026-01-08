import { useEffect, useState,useCallback,useRef } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { deleteAssetsByPubId } from "../services/assets.service";
import { useAuth } from "../hook/useAuth";



export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const lastQueryRef = useRef(null);

  const {user} = useAuth();

  const canManageAssets = user?.role === "ADMIN";

 

  const loadAssets = useCallback(async (params = {}) => {
    const queryKey=JSON.stringify(params);

    if(lastQueryRef.current===queryKey){
      return;
    }

    lastQueryRef.current=queryKey;

    setLoading(true);
    const res = await API.get("/assets", { params });
    setAssets(res.data);
    setLoading(false);
  },[]);


  const deleteAsset=async(assetId)=>{
    const ok=window.confirm("Are you sure you want to delete this asset?");
    if(!ok) return;

    try{
      await deleteAssetsByPubId(assetId);

      setAssets(prev=>prev.filter(a=>a.asset_id!==assetId));
    }catch(err){
      console.log(err);
      alert("Failed to delete asset")
    }
  };


   useEffect(() =>{ 
    (async()=> {
      await loadAssets();
    })();
  }, [loadAssets]);

  const onSearch = () => {
    if(!search.trim()) return;
    loadAssets({ search });
  };

  if (loading) return <Skeleton/>
  console.log(assets);

return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-wide">
          Assets
        </h1>

        {canManageAssets && (
          <Link
            to="/assets/create"
            className="
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white px-5 py-2 rounded-lg
              shadow-md hover:shadow-lg
              transition
            "
          >
            ➕ Add Asset
          </Link>
        )}

      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className="
            bg-white/10 backdrop-blur
            border border-white/10
            px-4 py-2 rounded-lg
            text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            w-64
          "
        />
        <button
          onClick={onSearch}
          className="
            bg-white/10 hover:bg-white/20
            border border-white/10
            px-4 rounded-lg
            transition
          "
        >
          🔍 Search
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assets.map((a) => (
          <div
            key={a.asset_id}
            className=" 
              group
              bg-black/30 backdrop-blur-xl
              border border-white/10
              rounded-2xl p-5
              shadow-lg
              hover:shadow-xl hover:-translate-y-1
              transition
            "
          >
               {isNewAsset(a.created_at) && (
                  <div className="
                   top-3 left-3 mb-3
                    px-2 py-0.5 max-w-12
                    text-[10px] font-bold text-center
                    rounded-full
                    bg-emerald-400/20 text-emerald-300
                    border border-emerald-400/30
                    shadow-[0_0_12px_rgba(16,185,129,0.35)]
                    animate-[pulse_2.5s_ease-in-out_infinite]
                  ">
                    NEW
                  </div>
                )}
            


            {/* Header */}
            <div className="flex justify-between gap-3 mb-3">

              <div className="min-w-0">
                <h2 className="font-semibold text-lg truncate group-hover:text-indigo-400 transition">
                  {a.asset_name}
                </h2>
               
                <p className="text-xs text-white/50 truncate">
                  {a.asset_public_id}
                </p>
              </div>

              <StatusBadge status={a.status} />
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <InfoRow label="Assigned To" value={a.full_name || "Unassigned"} />
              <InfoRow
                label="Warranty"
                value={a.warranty_expiry?.slice(0, 10) || "—"}
              />
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-between text-sm font-medium">
              <Link
                to={`/assets/${a.asset_public_id}`}
                className="text-indigo-400 hover:text-indigo-300 transition"
              >
                View
              </Link>

              {canManageAssets && (
                <>
                  <Link
                    to={`/asset/${a.asset_public_id}/update`}
                    className="text-amber-400 hover:text-amber-300 transition"
                  >
                    Update
                  </Link>

                  <button
                    onClick={() => deleteAsset(a.asset_id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Th = ({ children }) => (
  <th className="text-left p-2 text-sm">{children}</th>
);

const Td = ({ children }) => (
  <td className="p-2 text-sm">{children}</td>
);

function Skeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-white/20 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-white/10 border border-white/10"
          />
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    REQUESTED:
      "bg-yellow-500/15 text-yellow-300 border-yellow-400/30 shadow-yellow-500/20",
    ACTIVE:
      "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-emerald-500/20",
    IN_REPAIR:
      "bg-red-500/15 text-red-300 border-red-400/30 shadow-red-500/20",
    RETIRED:
      "bg-slate-500/15 text-slate-300 border-slate-400/30 shadow-slate-500/20",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[88px] h-7
        px-3
        text-[11px] font-semibold tracking-wide uppercase
        rounded-full
        border
        shadow-sm
        ${styles[status] || "bg-white/10 text-white/60 border-white/20"}
      `}
    >
      {status.replace("_", " ")}
    </span>
  );
}


function isNewAsset(createdAt) {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return now - createdTime < ONE_DAY;
}

