import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";

export default function AssetDetail() {
  const { public_id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(public_id);

  useEffect(() => {
    loadAsset();
  }, [public_id]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/assets/${public_id}`);
      setAsset(res.data);
    } catch (err) {
      setError("Asset not found");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading asset...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!asset) return null;

  console.log(asset);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{asset.asset_name}</h1>
          <p className="text-gray-500 text-sm">{asset.public_id}</p>
        </div>
        <Link
          to="/assets"
          className="text-blue-600 hover:underline text-sm"
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
