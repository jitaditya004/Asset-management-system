import { useEffect, useState,useCallback,useRef } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { deleteAssetsByPubId } from "../services/assets.service";

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const lastQueryRef = useRef(null);

 

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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Assets</h1>
        <Link
          to="/assets/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Asset
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className="border p-2 rounded w-64"
        />
        <button onClick={onSearch} className="bg-gray-700 text-white px-3 rounded">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {assets.map((a) => (
    <div className="group" key={a.asset_id}>
      <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-lg transition">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h2 className="font-semibold text-lg group-hover:text-blue-600 transition truncate">
              {a.asset_name}
            </h2>
            <p className="text-xs text-gray-500 truncate">{a.public_id}</p>
          </div>

          <StatusBadge status={a.status} />
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <InfoRow label="Assigned To" value={a.assigned_to || "Unassigned"} />
          <InfoRow
            label="Warranty"
            value={a.warranty_expiry?.slice(0, 10) || "—"}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between text-sm text-blue-600 font-medium">
          <Link
            
            to={`/assets/${a.public_id}`}
            className="hover:underline"
          >
          View
          </Link>
          <Link to={`/asset/${a.public_id}/update`} className="text-yellow-600 hover:underline">Update</Link>
          <button onClick={()=>deleteAsset(a.asset_id)} className="text-red-600 hover:underline">Delete</button>
        </div>
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
    <div className="p-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded mb-3" />
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    REQUESTED:"bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    IN_REPAIR: "bg-red-100 text-red-700",
    RETIRED: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`shrink-0 text-xs px-2 py-1 rounded-full font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
