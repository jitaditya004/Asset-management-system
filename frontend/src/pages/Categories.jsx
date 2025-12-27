import { useEffect, useState } from "react";
import API from "../api/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!name.trim()) return alert("Category name required");

    try {
      await API.post("/categories", {
        category_name: name,
        description,
      });
      setName("");
      setDescription("");
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create category");
    }
  };

  const updateDescription = async (id, desc) => {
    try {
      await API.patch(`/categories/${id}/description`, { description: desc });
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await API.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Cannot delete category");
    }
  };

  if (loading) return <p className="p-6">Loading categories...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Asset Categories</h1>

      {/* Create Category */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
        <button
          onClick={createCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Code</Th>
              <Th>Description</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((c, i) => (
                <tr key={c.category_id} className="border-t">
                  <Td>{i + 1}</Td>
                  <Td className="font-medium">{c.category_name}</Td>
                  <Td className="font-medium">{c.category_code}</Td>

                  <Td>
                    {editingId === c.category_id ? (
                      <textarea
                        defaultValue={c.description || ""}
                        onBlur={(e) =>
                          updateDescription(c.category_id, e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {c.description || "—"}
                      </span>
                    )}
                  </Td>

                  <Td align="right" className="space-x-3">
                    <button
                      onClick={() => setEditingId(c.category_id)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(c.category_id)}
                      className="text-red-600 text-sm hover:underline"
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

/* helpers */
const Th = ({ children, align }) => (
  <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
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
