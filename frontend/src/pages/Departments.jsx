import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../hook/useAuth";


export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();     
   const isAdmin = user?.role === "ADMIN";     


  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async () => {
    if (!newDept.trim()) return;

    try {
      setCreating(true);
      await API.post("/departments", {
        department_name: newDept,
      });
      setNewDept("");
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create department");
    } finally {
      setCreating(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await API.delete(`/departments/${id}`);
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.error || "Cannot delete department");
    }
  };

  if (loading) {
    return <p className="p-6 text-white/30">Loading departments...</p>;
  }

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <h1 className="text-2xl font-semibold tracking-wide">
        Departments
      </h1>

      {/* Create Department */}
      {isAdmin && (
        <div
          className="
            bg-white/10 backdrop-blur-xl
            border border-white/10
            rounded-2xl p-4
            flex flex-col sm:flex-row gap-3
            shadow-lg
          "
        >
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="New department name"
            className="
              flex-1 px-4 py-2 rounded-lg
              bg-black/20 border border-white/10
              text-white placeholder:text-white/40
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />

          <button
            onClick={createDepartment}
            disabled={creating}
            className="
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white px-5 py-2 rounded-lg
              transition
              disabled:opacity-50
            "
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </div>
      )}

      {/* Departments Table */}
      <div
        className="
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl
          shadow-lg
          overflow-hidden
        "
      >
        <table className="w-full">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Code</Th>
              {isAdmin && <Th align="right">Actions</Th>}
            </tr>
          </thead>

          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-white/50"
                >
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((d, idx) => (
                <tr
                  key={d.department_id}
                  className="
                    border-t border-white/10
                    hover:bg-white/5
                    transition
                  "
                >
                  <Td>{idx + 1}</Td>
                  <Td className="font-medium">
                    {d.department_name}
                  </Td>
                  <Td>{d.department_code || "—"}</Td>
                  {isAdmin && (
                  <Td align="right">
               
                      <button
                        onClick={() => deleteDepartment(d.department_id)}
                        className="text-red-400 hover:text-red-300 transition text-sm"
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

/* Table helpers */

const Th = ({ children, align }) => (
  <th
    className={`
      px-4 py-3 text-left font-medium
      ${align === "right" ? "text-right" : ""}
    `}
  >
    {children}
  </th>
);

const Td = ({ children, align, className }) => (
  <td
    className={`
      px-4 py-3 text-sm text-white
      ${align === "right" ? "text-right" : ""}
      ${className || ""}
    `}
  >
    {children}
  </td>
);
