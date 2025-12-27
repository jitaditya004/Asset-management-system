import { useEffect, useState } from "react";
import API from "../api/api";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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

  if (loading) return <p className="p-6">Loading departments...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Departments</h1>

      {/* Create Department */}
      <div className="bg-white p-4 rounded shadow flex gap-3">
        <input
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          placeholder="New department name"
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={createDepartment}
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {creating ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Code</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((d, idx) => (
                <tr
                  key={d.department_id}
                  className="border-t hover:bg-gray-50"
                >
                  <Td>{idx + 1}</Td>
                  <Td className="font-medium">{d.department_name}</Td>
                  <Td>{d.department_code || "—"}</Td>
                  <Td align="right">
                    <button
                      onClick={() => deleteDepartment(d.department_id)}
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

const Th = ({ children, align }) => (
  <th className={`px-4 py-3 text-left ${align === "right" ? "text-right" : ""}`}>
    {children}
  </th>
);

const Td = ({ children, align, className }) => (
  <td
    className={`px-4 py-3 text-sm ${align === "right" ? "text-right" : ""} ${className || ""}`}
  >
    {children}
  </td>
);
