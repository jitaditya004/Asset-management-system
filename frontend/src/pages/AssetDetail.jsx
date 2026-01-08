import { useEffect, useState ,useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
const apiUrl = import.meta.env.VITE_API_URL;
//import dotenv from "dotenv";
//dotenv.config();
import {isImage} from "../helper/isImage"
import { getAttachUrls,deleteDoc } from "../services/attachments.services";
import {useAuth} from "../hook/useAuth";

import { StatusTimeline } from "../components/StatusTimeLine";
import { getAssetHistory } from "../services/history.services";

import { getAssetsByPubId } from "../services/assets.service";

import SendToRepair from "../components/SendToRepair";


import AssetActionsMenu from "../components/AssetActionsMenu";



export default function AssetDetail() {
  const { public_id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attachments,setAttachments]=useState([]);
  const [file,setFile] = useState(null);
  const [uploading,setUploading] = useState(false); 
  const [previewUrls, setPreviewUrls] =useState({});

  const fileInputRef=useRef(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory,setLoadingHistory]= useState(true);


  const {user} = useAuth();

  const didLoad = useRef(false);



    const loadAsset = useCallback(async () => {
      if(!public_id) return;
      try {
        setLoading(true);
        const res = await getAssetsByPubId(public_id);
        setAsset(res.data);
      } catch (err) {
        setError("Asset not found");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },[public_id]);

    const loadAttachments = useCallback(async()=>{
      try{
        const res=await API.get(`/assets/${public_id}/attachments`);
        setAttachments(res.data);
      }catch(err){
        //setError("Problem during file fetching");
        console.error(err);
      }
    },[public_id]);


    
  useEffect(() => {
    if(didLoad.current) return;
    didLoad.current=true;
    loadAttachments();
    loadAsset();
  }, [loadAsset,loadAttachments]);

  const uploadAttachment=async ()=>{
    if(!file) return;

    const fd=new FormData();
    fd.append("file",file);

    try{
      setUploading(true);
      await API.post(`/assets/${public_id}/attachments`,fd,{headers:{"Content-Type":"multipart/form-data"}})
      //reload attachment list
      await loadAttachments();

      //reset file state
      setFile(null);

      //reset file input ui
      if(fileInputRef.current){
        fileInputRef.current.value="";
      }
    }catch(err){
      console.error(err);
      alert("Upload failed");
    }finally{

      setUploading(false);
    }
  };

  const deleteAttachment = async (docId) => {
    const ok = window.confirm("Delete this attachment?");
    if (!ok) return;

    try {
      await deleteDoc(docId);

      // remove from UI instantly
      setAttachments(prev =>
        prev.filter(doc => doc.document_id !== docId)
      );

      // also clear preview cache
      setPreviewUrls(prev => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };


  const openAttachment = async (docId) => {
    try{
      const res =await getAttachUrls(docId);
      window.open(res.data.url, "_blank");
    }catch(err){
      console.error(err);
    }
  };


  const loadPreview = useCallback(async (docId) => {
    if (previewUrls[docId]) return;

    try {
      const res = await getAttachUrls(docId);
      setPreviewUrls(prev => ({
        ...prev,
        [docId]: res.data.url
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    attachments.forEach(doc => {
      if (isImage(doc.document_type)) {
        loadPreview(doc.document_id);
      }
    });
  }, [attachments, loadPreview]);


  useEffect(()=>{
    getAssetHistory(public_id)
      .then(res=>setHistory(res.data))
      .finally(()=>setLoadingHistory(false));

  },[public_id]);


  // const loadPreview=async(docId)=>{
  //   if(previewUrls[docId]) return;

  //   try{
  //     const res=await getAttachUrls(docId);
  //     setPreviewUrls(prev=>({
  //       ...prev,
  //       [docId]: res.data.url
  //     }));
  //   }catch(err){
  //     console.error(err);
  //   }
  // };

  const downloadAttachment = async (docId) => {
    try {
      window.location.href=`${apiUrl}/assets/${docId}/attachments/download`;

      // const link = document.createElement("a");
      // link.href = res.data.url;
      // link.download = ""; // browser decides filename
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };


if (loading) return <p className="p-6 text-white/70">Loading asset...</p>;
if (error) return <p className="p-6 text-red-400">{error}</p>;
if (!asset) return null;

return (
  <div className="p-6 max-w-5xl mx-auto space-y-6 transition-all duration-300">

    {/* Header */}
    <div
      className="
        flex justify-between items-center
        rounded-2xl
        bg-black/30 backdrop-blur-xl
        border border-white/10
        px-6 py-4
        shadow-lg
      "
    >
      {/* Left */}
      <div className="space-y-1">
        {user?.role === "ADMIN" && (
          <span
            className="
              inline-block text-xs font-medium
              text-indigo-300
              bg-indigo-500/20
              px-2 py-0.5 rounded
            "
          >
            Asset ID: {asset.asset_id}
          </span>
        )}

        <h1 className="text-2xl font-semibold text-white leading-tight">
          {asset.asset_name}
        </h1>

        <p className="text-sm text-white/60">
          {asset.public_id}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Link
          to="/assets"
          className="
            inline-flex items-center gap-1
            text-sm font-medium
            text-indigo-400 hover:text-indigo-300
            transition
          "
        >
          ← Back to Assets
        </Link>

        <div className="h-6 w-px bg-white/20" />

        <AssetActionsMenu asset={asset} onRefresh={loadAsset} />
      </div>
    </div>

    {/* Info grid */}
    <div
      className="
        grid grid-cols-2 gap-6
        bg-black/30 
        border border-white/10
        p-6 rounded-2xl
        shadow-lg
      "
    >
      <Info label="Category" value={asset.category_name} />
      <Info label="Subcategory" value={asset.subcategory_name} />
      <Info label="Vendor" value={asset.vendor_name} />
      <Info label="Status" value={asset.status} />
      <Info label="Serial Number" value={asset.serial_number} />
      <Info label="Model Number" value={asset.model_number} />
      <Info label="Purchase Date" value={formatDate(asset.purchase_date)} />
      <Info label="Purchase Cost" value={asset.purchase_cost} />
      <Info label="Warranty Expiry" value={formatDate(asset.warranty_expiry)} />
      <Info label="Assigned To" value={asset.assigned_to || "Unassigned"} />
      <Info label="Department" value={asset.department_name || "—"} />
      <Info label="Location" value={asset.location_name} />
      <Info label="Region" value={asset.region} />
      <Info
        label="Latitude and Longitude"
        value={
          asset.latitude && asset.longitude
            ? `${asset.latitude}, ${asset.longitude}`
            : "—"
        }
      />
    </div>

    {/* Description */}
    <div
      className="
        bg-black/30 backdrop-blur-xl
        border border-white/10
        p-6 rounded-2xl
        shadow-lg
      "
    >
      <h2 className="font-semibold mb-2 text-white tracking-wide">
        Description
      </h2>
      <p className="text-white/80">
        {asset.description || "No description"}
      </p>
    </div>

    {/* Status timeline */}
    {loadingHistory ? (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-3 h-3 bg-white/20 rounded-full mt-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/20 rounded w-32" />
              <div className="h-3 bg-white/20 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        className="
          bg-black/30 backdrop-blur-xl
          border border-white/10
          p-6 rounded-2xl
          shadow-lg
        "
      >
        <h2 className="font-semibold mb-4 text-white tracking-wide">
          Lifecycle History
        </h2>
        <StatusTimeline history={history} />
      </div>
    )}

    {/* Attachments */}
    <div
      className="
        bg-black/30 backdrop-blur-xl
        border border-white/10
        p-6 rounded-2xl
        shadow-lg
      "
    >
      <h2 className="font-semibold mb-4 text-white tracking-wide">
        Attachments
      </h2>

      <div className="max-w-md mb-6">
        <input
          ref={fileInputRef}
          type="file"
          className="
            block w-full text-sm text-white
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:bg-indigo-600 file:text-white
            hover:file:bg-indigo-700
            cursor-pointer
          "
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={uploadAttachment}
          disabled={uploading || !file}
          className="
            mt-3 w-full
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-700 hover:to-purple-700
            text-white py-2 rounded-lg
            transition
            disabled:opacity-50
          "
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {attachments.length === 0 && (
        <p className="text-sm text-white/50">No attachments</p>
      )}

      <ul className="space-y-3">
        {attachments.map((doc) => {
          const image = isImage(doc.document_type);

          return (
            <li
              key={doc.document_id}
              className="
                flex gap-4 items-center
                bg-black/40
                border border-white/10
                p-3 rounded-xl
                hover:bg-black/50
                transition
              "
            >
              {image && previewUrls[doc.document_id] && (
                <img
                  src={previewUrls[doc.document_id]}
                  alt="attachment"
                  className="w-16 h-16 object-cover rounded-lg border border-white/10"
                />
              )}

              <div className="text-sm flex-1 truncate text-white">
                {doc.original_name}
              </div>

              <button
                onClick={() => openAttachment(doc.document_id)}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                View
              </button>

              <button
                onClick={() => deleteAttachment(doc.document_id)}
                className="text-red-400 hover:text-red-300 text-sm transition"
              >
                Delete
              </button>

              <button
                onClick={() => downloadAttachment(doc.document_id)}
                className="text-green-400 hover:text-green-300 text-sm transition"
              >
                Download
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function formatDate(d) {
  return d ? d.slice(0, 10) : "—";
}






// {/* Upload controls */}
//         <div className="flex items-center gap-3 max-w-full">
//           <label className="cursor-pointer">
//             <input
//               type="file"
//               className="hidden"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//             <span className="text-sm border px-3 py-2 rounded hover:bg-gray-100">
//               Choose file
//             </span>
//           </label>

//           <button
//             onClick={uploadAttachment}
//             disabled={uploading || !file}
//             className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded disabled:opacity-50 whitespace-nowrap"
//           >
//             {uploading ? "Uploading…" : "Upload"}
//           </button>
//         </div>
//       </div>