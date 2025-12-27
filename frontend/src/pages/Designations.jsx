import { useEffect, useState } from "react";
import API from "../api/api";

export default function DesignationPage() {
  const [designations, setDesignations] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDesignations();
  }, []);

  async function loadDesignations() {
    setLoading(true);
    const res = await API.get("/designations");
    setDesignations(res.data);
    setLoading(false);
  }

  async function createDesignation() {
    if (!name.trim()) return alert("Designation name required");

    try {
      await API.post("/designations", {
        designation_name: name,
      });
      setName("");
      loadDesignations();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create designation");
    }
  }

  async function deleteDesignation(id) {
    if (!window.confirm("Delete this designation?")) return;

    try {
      await API.delete(`/designations/${id}`);
      loadDesignations();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Designations</h1>

      {/* Create */}
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Designation name"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={createDesignation}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <Th>#</Th>
              <Th>Designation Name</Th>
              <Th>Code</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {designations.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  No designations found
                </td>
              </tr>
            ) : (
              designations.map((d, index) => (
                <tr
                  key={d.designation_id}
                  className="border-t hover:bg-gray-50"
                >
                  <Td>{index + 1}</Td>
                  <Td className="font-medium">{d.designation_name}</Td>
                  <Td className="text-gray-600">
                    {d.designation_code || "—"}
                  </Td>
                  <Td className="text-right">
                    <button
                      onClick={() => deleteDesignation(d.designation_id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`text-left p-3 text-sm font-semibold text-gray-700 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`p-3 text-sm text-gray-800 ${className}`}>
      {children}
    </td>
  );
}
