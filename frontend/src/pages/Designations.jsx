import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../hook/useAuth";


export default function DesignationPage() {
  const [designations, setDesignations] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  const isAdmin = user?.role === "ADMIN";

  const loadDesignations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/designations");
      setDesignations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

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

  if (loading) return <p className="p-6 text-white/60">Loading…</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">
      {/* Header */}
      <h1 className="text-2xl font-semibold tracking-wide">
        Designations
      </h1>

      {/* Create Designation */}
      {isAdmin && (<div
        className="
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl p-4
          shadow-lg
          flex gap-3
        "
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Designation name"
          className="
            flex-1
            bg-black/20
            border border-white/10
            px-4 py-2 rounded-lg
            text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />
        <button
          onClick={createDesignation}
          className="
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-700 hover:to-purple-700
            text-white px-5 rounded-lg
            shadow-md hover:shadow-lg
            transition
          "
        >
          Add
        </button>
      </div>)}

      {/* Table */}
      <div
        className="
          overflow-x-auto
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl
          shadow-lg
        "
      >
        <table className="w-full border-collapse">
          <thead className="bg-black/30">
            <tr>
              <Th>#</Th>
              <Th>Designation Name</Th>
              <Th>Code</Th>
              {isAdmin && (<Th className="text-right">Actions</Th>)}
            </tr>
          </thead>

          <tbody>
            {designations.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center p-6 text-white/50"
                >
                  No designations found
                </td>
              </tr>
            ) : (
              designations.map((d, index) => (
                <tr
                  key={d.designation_id}
                  className="
                    border-t border-white/10
                    hover:bg-white/5
                    transition
                  "
                >
                  <Td>{index + 1}</Td>
                  <Td className="font-medium text-white">
                    {d.designation_name}
                  </Td>
                  <Td className="text-white/60">
                    {d.designation_code || "—"}
                  </Td>
                  {isAdmin && (
                  <Td className="text-right">
                    <button
                      onClick={() => deleteDesignation(d.designation_id)}
                      className="
                        text-red-400 hover:text-red-300
                        text-sm
                        transition
                      "
                    >
                      Delete
                    </button>
                  </Td>
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

function Th({ children, className = "" }) {
  return (
    <th
      className={`
        text-left px-4 py-3 text-sm
        font-semibold text-white/70
        ${className}
      `}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td
      className={`
        px-4 py-3 text-sm
        text-white/80
        ${className}
      `}
    >
      {children}
    </td>
  );
}
