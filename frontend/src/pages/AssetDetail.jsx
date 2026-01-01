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

    console.log(attachments);

    
  useEffect(() => {
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
  }, [previewUrls]);

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





  if (loading) return <p className="p-6">Loading asset...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!asset) return null;


  return (
    <div className="p-6 max-w-4xl mx-auto transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-center rounded-lg mb-6 bg-white/70 px-5 py-3">
        <div className="font-bold text-xl">
          {user?.role==="ADMIN" && (
            <span className="">Asset ID: {asset.asset_id}</span>
          )}
          <h1 className="text-2xl font-semibold">{asset.asset_name}</h1>
          <p className="text-gray-500 text-sm">{asset.public_id}</p>
        </div>
        <Link
          to="/assets"
          className="text-white hover:bg-blue-900 rounded-lg text-sm p-3 bg-blue-600"
        >
          ← Back to Assets
        </Link>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded shadow">
        <Info label="Category" value={asset.category_name} />
        <Info label="Subcategory" value={asset.subcategory_name} />
        <Info label="Vendor" value={asset.vendor_name} />
        <Info label="Status" value={asset.status} />
        <Info label="Serial Number" value={asset.serial_number} />
        <Info label="Model Number" value={asset.model_number} />
        <Info label="Purchase Date" value={formatDate(asset.purchase_date)} />
        <Info label="Purchase Cost" value={asset.purchase_cost} />
        <Info label="Warranty Expiry" value={formatDate(asset.warranty_expiry)} />
        <Info
          label="Assigned To"
          value={asset.assigned_to || "Unassigned"}
        />
        <Info
          label="Department"
          value={asset.asset_department_id || "—"}
        />
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
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-700">
          {asset.description || "No description"}
        </p>
      </div>

      {/* status timeline */}
      {loadingHistory ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-3 h-3 bg-gray-300 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Lifecycle History</h2>
          <StatusTimeline history={history} />
        </div>

      )}

      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Attachments</h2>

        {/* Upload section */}
        <div className="max-w-md mb-6">
          <input
            ref={fileInputRef}
            type="file"
            className="block w-full text-sm border rounded p-2"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            onClick={uploadAttachment}
            disabled={uploading || !file}
            className="
              mt-3 w-full
              bg-blue-600 hover:bg-blue-800
              text-white py-2 rounded
              disabled:opacity-50
            "
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Empty state */}
        {attachments.length === 0 && (
          <p className="text-sm text-gray-500">No attachments</p>
        )}

        {/* Attachment list */}
        <ul className="space-y-3">
          {attachments.map((doc) => {
            const image = isImage(doc.document_type);
            
            // if(image){
            //   loadPreview(doc.document_id);
            // }

            return (
            <li
              key={doc.document_id}
              className="flex gap-4 items-center border p-3 rounded"
            >

              {/* image thumbnail */}
              {image && previewUrls[doc.document_id] && (
                <img src={previewUrls[doc.document_id]}
                    alt="attachment"
                    className="w-16 h-16 object-cover rounded border"
                />     
              )}
              {/* document name type */}
              <div className="text-sm flex-1 truncate max-w-[75%]">
                {doc.original_name}
              </div>


              {/* view button */}
              <button
                onClick={() => openAttachment(doc.document_id)}
                className="text-blue-600 hover:underline text-sm whitespace-nowrap"
              >
                View
              </button>
              {/* delete button */}
              <button onClick={()=>deleteAttachment(doc.document_id)} className="text-red-600 hover:underline text-sm" >
                Delete
              </button>
              {/* download button */}
              <button
                onClick={() => downloadAttachment(doc.document_id)}
                className="text-green-600 hover:underline text-sm"
              >
                Download
              </button>

            </li>)
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