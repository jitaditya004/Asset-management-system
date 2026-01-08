import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../hook/useAuth";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
   const { user } = useAuth();         
  const isAdmin = user?.role === "ADMIN";

  const [form, setForm] = useState({
    vendor_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await API.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const createVendor = async () => {
    if (!form.vendor_name.trim()) {
      return alert("Vendor name is required");
    }

    try {
      await API.post("/vendors", form);
      setForm({
        vendor_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      });
      loadVendors();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create vendor");
    }
  };

  const startEdit = (vendor) => {
    setEditingId(vendor.vendor_id);
    setEditForm(vendor);
  };

  const saveEdit = async () => {
    try {
      await API.patch(`/vendors/${editingId}`, editForm);
      setEditingId(null);
      loadVendors();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };


  const deleteVendor = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    try {
      await API.delete(`/vendors/${id}`);
      loadVendors();
    } catch (err) {
      alert(err.response?.data?.error || "Cannot delete vendor");
    }
  };

  if (loading) return <p className="p-6 text-white/30">Loading vendors...</p>;
return (
  <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">

    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-wide">
        🏭 Vendors
      </h1>
      <span className="text-sm text-white/50">
        {vendors.length} vendors
      </span>
    </div>

    {/* ---------- CREATE FORM ---------- */}
    {isAdmin && (<form
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6
        shadow-lg
        space-y-4
      "
    >
      <h2 className="font-semibold text-lg">Add Vendor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          placeholder="Vendor name *"
          value={form.vendor_name}
          onChange={(v) => setForm({ ...form, vendor_name: v })}
        />
        <GlassInput
          placeholder="Contact person"
          value={form.contact_person}
          onChange={(v) => setForm({ ...form, contact_person: v })}
        />
        <GlassInput
          placeholder="Phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        <GlassInput
          placeholder="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
      </div>

      <textarea
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        rows={2}
        className="
          w-full rounded-lg
          bg-white/10 border border-white/10
          px-3 py-2
          text-white placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />

      <button
        onClick={createVendor}
        className="
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-700 hover:to-purple-700
          text-white px-5 py-2 rounded-lg
          shadow hover:shadow-lg
          transition
        "
      >
        ➕ Add Vendor
      </button>
    </form>)}

    {/* ---------- LIST ---------- */}
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-lg
        overflow-x-auto
      "
    >
      <table className="w-full text-sm">
        <thead className="bg-white/10 text-white/70">
          <tr>
            <Th>Name</Th>
            <Th>Contact</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Address</Th>
            {isAdmin && (<Th align="right">Actions</Th>)}
          </tr>
        </thead>

        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-10 text-center text-white/50">
                No vendors found
              </td>
            </tr>
          ) : (
            vendors.map((v) => (
              <tr
                key={v.vendor_id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {editingId === v.vendor_id ? (
                  <>
                    <Td><GlassInput value={editForm.vendor_name} onChange={(val) => setEditForm({ ...editForm, vendor_name: val })} /></Td>
                    <Td><GlassInput value={editForm.contact_person || ""} onChange={(val) => setEditForm({ ...editForm, contact_person: val })} /></Td>
                    <Td><GlassInput value={editForm.phone || ""} onChange={(val) => setEditForm({ ...editForm, phone: val })} /></Td>
                    <Td><GlassInput value={editForm.email || ""} onChange={(val) => setEditForm({ ...editForm, email: val })} /></Td>
                    <Td><GlassInput value={editForm.address || ""} onChange={(val) => setEditForm({ ...editForm, address: val })} /></Td>

                    <Td align="right" className="space-x-3">
                      <button
                        onClick={saveEdit}
                        className="text-green-400 hover:text-green-300 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-white/50 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td className="font-medium">{v.vendor_name}</Td>
                    <Td>{v.contact_person || "—"}</Td>
                    <Td>{v.phone || "—"}</Td>
                    <Td>{v.email || "—"}</Td>
                    <Td className="max-w-xs truncate">{v.address || "—"}</Td>

                    {isAdmin && (<Td align="right" className="space-x-4">
                      <button
                        onClick={() => startEdit(v)}
                        className="text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVendor(v.vendor_id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </Td>)}
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}



const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="border rounded px-3 py-2 w-full"
  />
);

const Th = ({ children, align }) => (
  <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
    {children}
  </th>
);

const Td = ({ children, align, className }) => (
  <td
    className={`px-4 py-3 ${
      align === "right" ? "text-right" : ""
    } ${className || ""}`}
  >
    {children}
  </td>
);
const GlassInput = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="
      w-full rounded-lg
      bg-white/10 border border-white/10
      px-3 py-2
      text-white placeholder:text-white/40
      focus:outline-none focus:ring-2 focus:ring-indigo-500
    "
  />
);
