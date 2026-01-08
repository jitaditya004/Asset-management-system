import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../hook/useAuth";


export default function CategoriesWithSubcategories() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSubName,setNewSubName]=useState({});
  const [newSubDesc,setNewSubDesc]=useState({});
  const [editingSubId,setEditingSubId]=useState(null);

  const { user } = useAuth();          
  const isAdmin = user?.role === "ADMIN";

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

if (loading) return <p className="p-6 text-white/60">Loading…</p>;

return (
  <div className="p-6 max-w-6xl mx-auto space-y-6 text-white">
    <h1 className="text-2xl font-semibold tracking-wide">
      Asset Sub-categories
    </h1>

    {categories.map((cat) => (
      <div
        key={cat.category_id}
        className="
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl
          shadow-lg
          overflow-hidden
        "
      >
        {/* Category header */}
        <button
          onClick={() => toggleCategory(cat.category_id)}
          className="
            w-full flex justify-between items-center
            px-6 py-4
            hover:bg-white/5
            transition
          "
        >
          <div className="text-left">
            <div className="font-semibold text-lg">
              {cat.category_name}
            </div>
            <div className="text-sm text-white/50">
              {cat.description || "No description"}
            </div>
          </div>

          <span className="text-sm text-indigo-400">
            {expanded[cat.category_id] ? "Hide" : "View"} →
          </span>
        </button>

        {/* Subcategories */}
        {expanded[cat.category_id] && (
          <div className="border-t border-white/10 px-6 py-5 space-y-4 bg-black/20">
            {/* Add subcategory */}
            {isAdmin && (<div className="flex flex-wrap gap-3">
              <input
                placeholder="Subcategory name"
                value={newSubName[cat.category_id] || ""}
                onChange={(e) =>
                  setNewSubName((p) => ({
                    ...p,
                    [cat.category_id]: e.target.value,
                  }))
                }
                className="
                  bg-black/30
                  border border-white/10
                  px-3 py-2 rounded-lg
                  text-white placeholder:text-white/40
                  w-full md:w-1/3
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              />

              <input
                placeholder="Description"
                value={newSubDesc[cat.category_id] || ""}
                onChange={(e) =>
                  setNewSubDesc((p) => ({
                    ...p,
                    [cat.category_id]: e.target.value,
                  }))
                }
                className="
                  bg-black/30
                  border border-white/10
                  px-3 py-2 rounded-lg
                  text-white placeholder:text-white/40
                  flex-1
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              />

              <button
                onClick={() => addSubcategory(cat.category_id)}
                className="
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-indigo-700 hover:to-purple-700
                  text-white px-4 py-2 rounded-lg
                  transition
                "
              >
                Add
              </button>
            </div>)}

            {/* Loading */}
            {!subs[cat.category_id] && (
              <p className="text-sm text-white/50">
                Loading subcategories…
              </p>
            )}

            {/* Subcategory list */}
            {Array.isArray(subs[cat.category_id]) &&
              subs[cat.category_id].map((s) => (
                <div
                  key={s.subcategory_id}
                  className="
                    bg-white/5
                    border border-white/10
                    rounded-xl p-4
                    flex justify-between gap-4
                    hover:bg-white/10
                    transition
                  "
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {s.subcategory_name}
                    </div>

                    {editingSubId === s.subcategory_id ? (
                      <textarea
                        defaultValue={s.description}
                        autoFocus
                        onBlur={(e) =>
                          updateSubcategory(
                            s.subcategory_id,
                            cat.category_id,
                            e.target.value
                          )
                        }
                        className="
                          mt-2 w-full
                          bg-black/30
                          border border-white/20
                          rounded-lg px-3 py-1
                          text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                        "
                      />
                    ) : (
                      <div className="text-xs text-white/50 mt-1">
                        {s.description || "No description"}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="
                        text-xs font-mono
                        bg-indigo-500/20 text-indigo-300
                        px-2 py-1 rounded
                      "
                    >
                      {s.subcategory_code}
                    </span>

                    {isAdmin && (<>
                      <button
                      onClick={() =>
                        setEditingSubId(s.subcategory_id)
                      }
                      className="text-indigo-400 text-xs hover:text-indigo-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteSubcategory(
                          s.subcategory_id,
                          cat.category_id
                        )
                      }
                      className="text-red-400 text-xs hover:text-red-300"
                    >
                      Delete
                    </button>
                    </>)}
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
