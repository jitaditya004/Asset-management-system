import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateAsset() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    asset_name: "",
    category: "",
    subcategory: "",
    serial_number: "",
    model_number: "",
    purchase_date: "",
    purchase_cost: "",
    vendor: "",
    status: "ACTIVE",
    location:"",
    warranty_expiry: "",
    description: "",
    assigned_to: "NOT ASSIGNED",
    department: ""
  });

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      images.forEach((img) => fd.append("images", img));
      documents.forEach((doc) => fd.append("documents", doc));

      await API.post("/assets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav("/assets");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-6">Create Asset</h1>

      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Input label="Asset Name" name="asset_name" onChange={handleChange} />
        <Input label="Category" name="category" onChange={handleChange} />
        <Input label="Subcategory" name="subcategory" onChange={handleChange} />
        <Input label="Vendor" name="vendor" onChange={handleChange} />
        <Input label="Department" name="department" onChange={handleChange} />
        <Input label="Serial Number" name="serial_number" onChange={handleChange} />
        <Input label="Model Number" name="model_number" onChange={handleChange} />
        <Input label="Location" name="location" onChange={handleChange} />

        <Input type="date" label="Purchase Date" name="purchase_date" onChange={handleChange} />
        <Input type="number" label="Purchase Cost" name="purchase_cost" onChange={handleChange} />

        <Input type="date" label="Warranty Expiry" name="warranty_expiry" onChange={handleChange} />

        <select
          name="status"
          className="border p-2 rounded col-span-2"
          onChange={handleChange}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="IN_REPAIR">IN_REPAIR</option>
          <option value="RETIRED">RETIRED</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded col-span-2"
          onChange={handleChange}
        />

        <FileInput label="Images" multiple accept="image/*" onChange={setImages} />
        <FileInput label="Documents (PDF)" multiple accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={setDocuments} />

        <button
          disabled={loading}
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Asset"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        placeholder={label}
        className="border p-2 rounded"
        required
      />

    </div>
  );
}

function FileInput({ label, onChange, ...props }) {
  return (
    <div className="col-span-2">
      <label className="block text-sm mb-1">{label}</label>
      <input
        {...props}
        type="file"
        onChange={(e) => onChange([...e.target.files])}
      />
    

    {/* Show selected file names
      {files.length > 0 && (
        <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
          {files.map((file, idx) => (
            <li key={idx}>
              {file.name}
              <span className="text-gray-400">
                {" "}({Math.round(file.size / 1024)} KB)
              </span>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}
