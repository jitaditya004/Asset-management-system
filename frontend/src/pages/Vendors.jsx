import { useEffect, useState } from "react";
import API from "../api/api";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-6">Loading vendors...</p>;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Vendors</h1>

      {/* ---------- CREATE FORM ---------- */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-medium">Add Vendor</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Vendor name *"
            value={form.vendor_name}
            onChange={(v) => setForm({ ...form, vendor_name: v })}
          />
          <Input
            placeholder="Contact person"
            value={form.contact_person}
            onChange={(v) => setForm({ ...form, contact_person: v })}
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
        </div>

        <textarea
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />

        <button
          onClick={createVendor}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Vendor
        </button>
      </div>

      {/* ---------- LIST ---------- */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Address</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>

          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.vendor_id} className="border-t">
                  {editingId === v.vendor_id ? (
                    <>
                      <Td>
                        <Input
                          value={editForm.vendor_name}
                          onChange={(val) =>
                            setEditForm({ ...editForm, vendor_name: val })
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          value={editForm.contact_person || ""}
                          onChange={(val) =>
                            setEditForm({ ...editForm, contact_person: val })
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          value={editForm.phone || ""}
                          onChange={(val) =>
                            setEditForm({ ...editForm, phone: val })
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          value={editForm.email || ""}
                          onChange={(val) =>
                            setEditForm({ ...editForm, email: val })
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          value={editForm.address || ""}
                          onChange={(val) =>
                            setEditForm({ ...editForm, address: val })
                          }
                        />
                      </Td>
                      <Td align="right" className="space-x-2">
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:underline"
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
                      <Td>{v.address || "—"}</Td>
                      <Td align="right" className="space-x-3">
                        <button
                          onClick={() => startEdit(v)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVendor(v.vendor_id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </Td>
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
