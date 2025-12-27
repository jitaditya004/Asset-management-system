import { useEffect, useState } from "react";
import API from "../api/api";

export default function CategoriesWithSubcategories() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSubName,setNewSubName]=useState({});
  const [newSubDesc,setNewSubDesc]=useState({});
  const [editingSubId,setEditingSubId]=useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  const addSubcategory = async (category_id) => {
    const name = newSubName[category_id]?.trim();
    if (!name) return alert("Subcategory name required");

    await API.post("/subcategories", {
        subcategory_name: name,
        description: newSubDesc[category_id],
        category_id,
    });

    
    // refresh only this category
    const res = await API.get(`/subcategories/by-category/${category_id}`);
    setSubs((prev) => ({ ...prev, [category_id]: res.data }));

    setNewSubName((p) => ({ ...p, [category_id]: "" }));
    setNewSubDesc((p) => ({ ...p, [category_id]: "" }));
    };

    const updateSubcategory = async (id, category_id, desc) => {
        await API.patch(`/subcategories/${id}/description`, { description: desc });

        const res = await API.get(`/subcategories/by-category/${category_id}`);
        setSubs((prev) => ({ ...prev, [category_id]: res.data }));
        setEditingSubId(null);
    };

    const deleteSubcategory = async (id, category_id) => {
        if (!confirm("Delete this subcategory?")) return;

        await API.delete(`/subcategories/${id}`);

        setSubs((prev) => ({
            ...prev,
            [category_id]: prev[category_id].filter((s) => s.subcategory_id !== id),
        }));
    };





  const toggleCategory = async (category_id) => {
    setExpanded((prev) => ({
      ...prev,
      [category_id]: !prev[category_id],
    }));

    // lazy load subcategories
    if (!subs[category_id]) {
      const res = await API.get(`/subcategories/by-category/${category_id}`);
      setSubs((prev) => ({
        ...prev,
        [category_id]: res.data,
      }));
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

console.log(categories,"---------expanded   ",expanded,"-------------subs ",subs,"--");
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Asset Categories</h1>

      {categories.map((cat) => (
        <div
          key={cat.category_id}
          className="bg-white rounded shadow border"
        >
          {/* Category header */}
          <button
            onClick={() => toggleCategory(cat.category_id)}
            className="w-full flex justify-between items-center px-5 py-4 hover:bg-gray-50"
          >
            <div>
              <div className="font-semibold text-lg">
                {cat.category_name}
              </div>
              <div className="text-sm text-gray-500">
                {cat.description || "No description"}
              </div>
            </div>

            <span className="text-sm text-blue-600">
              {expanded[cat.category_id] ? "Hide" : "View"} →
            </span>
          </button>

          {/* Subcategories */}
            {expanded[cat.category_id] && (
            <div className="border-t bg-gray-50 px-6 py-4 space-y-4">

                {/* Add subcategory */}
                <div className="flex gap-2">
                <input
                    placeholder="Subcategory name"
                    value={newSubName[cat.category_id] || ""}
                    onChange={(e) =>
                    setNewSubName((p) => ({ ...p, [cat.category_id]: e.target.value }))
                    }
                    className="border px-2 py-1 rounded w-1/3"
                />
                <input
                    placeholder="Description"
                    value={newSubDesc[cat.category_id] || ""}
                    onChange={(e) =>
                    setNewSubDesc((p) => ({ ...p, [cat.category_id]: e.target.value }))
                    }
                    className="border px-2 py-1 rounded flex-1"
                />
                <button
                    onClick={() => addSubcategory(cat.category_id)}
                    className="bg-blue-600 text-white px-3 rounded"
                >
                    Add
                </button>
                </div>

                {/* List */}
                {!subs[cat.category_id] && (
                <p className="text-sm text-gray-500">Loading subcategories...</p>
                )}

                {Array.isArray(subs[cat.category_id]) &&
                subs[cat.category_id].map((s) => (
                    <div
                    key={s.subcategory_id}
                    className="bg-white p-3 rounded border flex justify-between"
                    >
                    <div className="flex-1">
                        <div className="font-medium">{s.subcategory_name}</div>

                        {editingSubId === s.subcategory_id ? (
                        <textarea
                            defaultValue={s.description}
                            onBlur={(e) =>
                            updateSubcategory(
                                s.subcategory_id,
                                cat.category_id,
                                e.target.value
                            )
                            }
                            className="border rounded w-full mt-1 p-1"
                        />
                        ) : (
                        <div className="text-xs text-gray-500">
                            {s.description || "No description"}
                        </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {s.subcategory_code}
                        </span>
                        <button
                        onClick={() => setEditingSubId(s.subcategory_id)}
                        className="text-blue-600 text-xs"
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => deleteSubcategory(s.subcategory_id, cat.category_id)}
                        className="text-red-600 text-xs"
                        >
                        Delete
                        </button>
                    </div>
                    </div>
                ))}
            </div>
            )}


        </div>
      ))}
    </div>
  );
}
