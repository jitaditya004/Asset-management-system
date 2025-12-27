import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AssetUpdate() {
  const { id } = useParams(); // public_id
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    asset_name: "",
    category_name: "",
    subcategory_name: "",
    vendor_name: "",
    serial_number: "",
    model_number: "",
    purchase_date: "",
    purchase_cost: "",
    status: "",
    assigned_to: "NOT ASSIGNED",
    warranty_expiry: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    loadAsset();
  }, []);

  const loadAsset = async () => {
    try {
      const res = await API.get(`/assets/${id}`);
      const a = res.data;

      setForm({
        asset_name: a.asset_name || "",
        category_name: a.category_name || "",
        subcategory_name: a.subcategory_name || "",
        vendor_name: a.vendor_name || "",
        serial_number: a.serial_number || "",
        model_number: a.model_number || "",
        purchase_date: a.purchase_date?.slice(0, 10) || "",
        purchase_cost: a.purchase_cost || "",
        status: a.status || "",
        assigned_to: a.assigned_to || "NOT ASSIGNED",
        warranty_expiry: a.warranty_expiry?.slice(0, 10) || "",
        description: a.description || "",
        latitude: a.latitude || "",
        longitude: a.longitude || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load asset");
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async () => {
    setSaving(true);
    setError(null);

    try {
      await API.patch(`/assets/${id}`, {
        asset_name: form.asset_name,
        category_name: form.category_name,
        subcategory_name: form.subcategory_name,
        vendor_name: form.vendor_name,
        serial_number: form.serial_number,
        model_number: form.model_number,
        purchase_date: form.purchase_date,
        purchase_cost: form.purchase_cost,
        status: form.status,
        assigned_to:
          form.assigned_to === "" ? "NOT ASSIGNED" : form.assigned_to,
        warranty_expiry: form.warranty_expiry,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      nav(`/assets/${id}`);
    } catch (err) {
      setError( err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Update failed");

    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading asset...</p>;
//   

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Update Asset</h1>

    {error && <p className=" text-red-600">{error}</p> }
      <div className="bg-white p-6 rounded shadow space-y-4">
        <Field label="Asset Name">
          <Input
            value={form.asset_name}
            onChange={(v) => setForm({ ...form, asset_name: v })}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Category">
            <Input
              value={form.category_name}
              onChange={(v) =>
                setForm({ ...form, category_name: v })
              }
            />
          </Field>

          <Field label="Subcategory">
            <Input
              value={form.subcategory_name}
              onChange={(v) =>
                setForm({ ...form, subcategory_name: v })
              }
            />
          </Field>
        </div>

        <Field label="Vendor">
          <Input
            value={form.vendor_name}
            onChange={(v) =>
              setForm({ ...form, vendor_name: v })
            }
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Serial Number">
            <Input
              value={form.serial_number}
              onChange={(v) =>
                setForm({ ...form, serial_number: v })
              }
            />
          </Field>

          <Field label="Model Number">
            <Input
              value={form.model_number}
              onChange={(v) =>
                setForm({ ...form, model_number: v })
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Purchase Date">
            <Input
              type="date"
              value={form.purchase_date}
              onChange={(v) =>
                setForm({ ...form, purchase_date: v })
              }
            />
          </Field>

          <Field label="Purchase Cost">
            <Input
              type="number"
              value={form.purchase_cost}
              onChange={(v) =>
                setForm({ ...form, purchase_cost: v })
              }
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Select</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IN_REPAIR">IN_REPAIR</option>
              <option value="RETIRED">RETIRED</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Assigned To (User Public ID)">
            <Input
              value={form.assigned_to}
              onChange={(v) =>
                setForm({ ...form, assigned_to: v })
              }
            />
          </Field>

          <Field label="Warranty Expiry">
            <Input
              type="date"
              value={form.warranty_expiry}
              onChange={(v) =>
                setForm({ ...form, warranty_expiry: v })
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Latitude">
            <Input
              value={form.latitude}
              onChange={(v) =>
                setForm({ ...form, latitude: v })
              }
            />
          </Field>

          <Field label="Longitude">
            <Input
              value={form.longitude}
              onChange={(v) =>
                setForm({ ...form, longitude: v })
              }
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>

        <div className="flex gap-3">
          <button
            onClick={updateAsset}
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Asset"}
          </button>

          <button
            onClick={() => nav(-1)}
            className="px-5 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


const Field = ({ label, children }) => (
  <div>
    <label className="text-sm text-gray-600 block mb-1">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />
);
