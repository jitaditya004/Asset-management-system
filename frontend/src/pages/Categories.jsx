import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../hook/useAuth";


export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();         
  const isAdmin = user?.role === "ADMIN";


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

if (loading) return <p className="p-6 text-white/30">Loading categories...</p>;

return (
  <div className="p-6 space-y-6 text-white max-w-6xl mx-auto">
    {/* Header */}
    <h1 className="text-2xl font-semibold tracking-wide">
      Asset Categories
    </h1>

    {/* Create Category */}
    {isAdmin && (<div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg
        space-y-3
      "
    >
      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="
          w-full
          bg-black/20
          border border-white/10
          px-4 py-2 rounded-lg
          text-white placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="
          w-full
          bg-black/20
          border border-white/10
          px-4 py-2 rounded-lg
          text-white placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />

      <button
        onClick={createCategory}
        className="
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-700 hover:to-purple-700
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg
          transition
        "
      >
        ➕ Add Category
      </button>
    </div>)}

    {/* Categories Table */}
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
            <Th>Name</Th>
            <Th>Code</Th>
            <Th>Description</Th>
            {isAdmin && (<Th align="right">Actions</Th>)}
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="p-6 text-center text-white/50"
              >
                No categories found
              </td>
            </tr>
          ) : (
            categories.map((c, i) => (
              <tr
                key={c.category_id}
                className="
                  border-t border-white/10
                  hover:bg-white/5
                  transition
                "
              >
                <Td>{i + 1}</Td>

                <Td className="font-medium text-white">
                  {c.category_name}
                </Td>

                <Td className="text-white/60">
                  {c.category_code}
                </Td>

                <Td>
                  {editingId === c.category_id ? (
                    <textarea
                      defaultValue={c.description || ""}
                      onBlur={(e) =>
                        updateDescription(
                          c.category_id,
                          e.target.value
                        )
                      }
                      autoFocus
                      className="
                        w-full
                        bg-black/20
                        border border-white/20
                        rounded-lg px-3 py-1
                        text-white
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                      "
                    />
                  ) : (
                    <span className="text-white/60">
                      {c.description || "—"}
                    </span>
                  )}
                </Td>

                {isAdmin && (<Td align="right" className="space-x-4">
                  <button
                    onClick={() => setEditingId(c.category_id)}
                    className="
                      text-indigo-400 hover:text-indigo-300
                      text-sm transition
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCategory(c.category_id)}
                    className="
                      text-red-400 hover:text-red-300
                      text-sm transition
                    "
                  >
                    Delete
                  </button>
                </Td>)}
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
  <th
    className={`
      px-4 py-3 text-sm font-semibold
      text-white/70
      ${align === "right" ? "text-right" : "text-left"}
    `}
  >
    {children}
  </th>
);

const Td = ({ children, align, className }) => (
  <td
    className={`
      px-4 py-3 text-sm
      text-white/80
      ${align === "right" ? "text-right" : ""}
      ${className || ""}
    `}
  >
    {children}
  </td>
);
