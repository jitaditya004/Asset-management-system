import { useEffect, useState } from "react";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from "../services/locations.services";
import { useAuth } from "../hook/useAuth";


const emptyForm = {
  location_name: "",
  region: "",
  address: "",
  latitude: "",
  longitude: ""
};

export default function LocationsAdmin() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();          
  const isAdmin = user?.role === "ADMIN";

  const load = async () => {
    const res = await getLocations();
    setLocations(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateLocation(editingId, form);
      } else {
        await createLocation(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const edit = (loc) => {
    setEditingId(loc.location_id);
    setForm({
      location_name: loc.location_name,
      region: loc.region,
      address: loc.address || "",
      latitude: loc.latitude || "",
      longitude: loc.longitude || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    await deleteLocation(id);
    load();
  };

  console.log(locations);

 return (
  <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">

    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-wide">
        📍 Locations
      </h1>
      <span className="text-sm text-white/50">
        {locations.length} locations
      </span>
    </div>

    {/* FORM */}
    {isAdmin && (<form
      onSubmit={submit}
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6
        shadow-lg
        space-y-5
      "
    >
      <h2 className="font-semibold text-lg">
        {editingId ? "Edit Location" : "Add Location"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          placeholder="Location Name *"
          value={form.location_name}
          onChange={(v) =>
            setForm({ ...form, location_name: v })
          }
          required
        />

        <GlassInput
          placeholder="Region *"
          value={form.region}
          onChange={(v) =>
            setForm({ ...form, region: v })
          }
          required
        />

        <GlassInput
          className="md:col-span-2"
          placeholder="Address"
          value={form.address}
          onChange={(v) =>
            setForm({ ...form, address: v })
          }
        />

        <GlassInput
          placeholder="Latitude (optional)"
          value={form.latitude}
          onChange={(v) =>
            setForm({ ...form, latitude: v })
          }
        />

        <GlassInput
          placeholder="Longitude (optional)"
          value={form.longitude}
          onChange={(v) =>
            setForm({ ...form, longitude: v })
          }
        />
      </div>

      <div className="flex gap-3">
        <button
          disabled={loading}
          className="
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-700 hover:to-purple-700
            text-white px-5 py-2 rounded-lg
            shadow hover:shadow-lg
            transition
            disabled:opacity-50
          "
        >
          {editingId ? "Update Location" : "Create Location"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="
              px-5 py-2 rounded-lg
              border border-white/20
              text-white/70
              hover:bg-white/10
              transition
            "
          >
            Cancel
          </button>
        )}
      </div>
    </form>)}

    {/* LIST */}
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
            <Th>Region</Th>
            <Th>Assets</Th>
            <Th>Lat / Long</Th>
            {isAdmin && (<Th align="right">Actions</Th>)}
          </tr>
        </thead>

        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-10 text-center text-white/50">
                No locations found
              </td>
            </tr>
          ) : (
            locations.map((l) => (
              <tr
                key={l.location_id}
                className="
                  border-t border-white/10
                  hover:bg-white/5
                  transition
                "
              >
                <Td className="font-medium">
                  {l.location_name}
                </Td>

                <Td className="text-center">
                  {l.region || "—"}
                </Td>

                <Td className="text-center">
                  <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                    {l.asset_count}
                  </span>
                </Td>

                <Td className="text-center text-white/70">
                  {l.lat && l.long
                    ? `${l.lat}, ${l.long}`
                    : "—"}
                </Td>

                {isAdmin && (<Td align="right" className="space-x-4">
                  <button
                    onClick={() => edit(l)}
                    className="text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(l.location_id)}
                    className="text-red-400 hover:text-red-300 transition"
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



const GlassInput = ({ value, onChange, placeholder, className = "", required }) => (
  <input
    value={value}
    required={required}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`
      w-full rounded-lg
      bg-white/10 border border-white/10
      px-3 py-2
      text-white placeholder:text-white/40
      focus:outline-none focus:ring-2 focus:ring-indigo-500
      ${className}
    `}
  />
);

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

const Td = ({ children, align, className = "" }) => (
  <td
    className={`
      px-4 py-3
      ${align === "right" ? "text-right" : ""}
      ${className}
    `}
  >
    {children}
  </td>
);

