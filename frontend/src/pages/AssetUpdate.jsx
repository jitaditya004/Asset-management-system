import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { upadateStatAndHis } from "../services/history.services";
import { useAuth } from "../hook/useAuth";

export default function AssetUpdate() {
  const { id } = useParams(); // public_id asset
  const nav = useNavigate();

  console.log(id);

  const {user,loading: userLoading,reloadUser}=useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    asset_name: "",
    category_name: "",
    subcategory_name: "",
    vendor_name: "",
    serial_number: "",
    model_number: "",
    purchase_date: "",
    purchase_cost: "",
    status: "",
    assigned_to: "NOT ASSIGNED",
    warranty_expiry: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    loadAsset();
  }, []);

  const loadAsset = async () => {
    try {
      const res = await API.get(`/assets/${id}`);
      const a = res.data;

      setForm({
        asset_name: a.asset_name || "",
        category_name: a.category_name || "",
        subcategory_name: a.subcategory_name || "",
        vendor_name: a.vendor_name || "",
        serial_number: a.serial_number || "",
        model_number: a.model_number || "",
        purchase_date: a.purchase_date?.slice(0, 10) || "",
        purchase_cost: a.purchase_cost || "",
        status: a.status || "",
        assigned_to: a.assigned_to,
        warranty_expiry: a.warranty_expiry?.slice(0, 10) || "",
        description: a.description || "",
        latitude: a.latitude || "",
        longitude: a.longitude || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load asset");
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async () => {
    setSaving(true);
    setError(null);

    try {
      await API.patch(`/assets/${id}`, {
        asset_name: form.asset_name,
        category_name: form.category_name,
        subcategory_name: form.subcategory_name,
        vendor_name: form.vendor_name,
        serial_number: form.serial_number,
        model_number: form.model_number,
        purchase_date: form.purchase_date,
        purchase_cost: form.purchase_cost,
        status: form.status,
        assigned_to:form.assigned_to,
        warranty_expiry: form.warranty_expiry,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      nav(`/assets/${id}`);
    } catch (err) {
      setError( err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Update failed");

    } finally {
      setSaving(false);
    }
  };
  
  const changeStatus = async (newStatus) => {
    const reason = prompt("Reason");
    if (reason === null) return;

    try {
      // await API.patch(`/assets/${id}/status`, {
      //   status: newStatus,
      //   reason,
      // });
//add changeby so need useauth
      await upadateStatAndHis(id,{newStatus,reason});

      await loadAsset(); // refresh asset
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to update status"
      );
    }
  };


  if (loading) return <p className="p-6">Loading asset...</p>;

  if(userLoading){   
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }
  if(!user){ 
    reloadUser();  
    return null;
  }

return (
  <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-wide">
        ✏️ Update Asset
      </h1>

      <StatusDisplay status={form.status} />
    </div>

    {error && (
      <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg px-4 py-2">
        {error}
      </div>
    )}

    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6
        shadow-xl
        space-y-6
      "
    >
      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Asset Name">
          <Input
            value={form.asset_name}
            onChange={(v) => setForm({ ...form, asset_name: v })}
          />
        </Field>
      </Section>

      {/* Lifecycle */}
      <Section title="Lifecycle Actions">
        <div className="flex flex-wrap gap-3">
          {form.status === "ACTIVE" && (
            <ActionButton
              color="orange"
              onClick={() => changeStatus("IN_REPAIR")}
            >
              🔧 Send to Repair
            </ActionButton>
          )}

          {form.status !== "RETIRED" && (
            <ActionButton
              color="gray"
              onClick={() => changeStatus("RETIRED")}
            >
              🗑 Retire Asset
            </ActionButton>
          )}

          {form.status !== "ACTIVE" && user.role === "ADMIN" && (
            <ActionButton
              color="green"
              onClick={() => changeStatus("ACTIVE")}
            >
              ✅ Make Active
            </ActionButton>
          )}
        </div>
      </Section>

      {/* Classification */}
      <Section title="Classification">
        <Grid>
          <Field label="Category">
            <Input
              value={form.category_name}
              onChange={(v) => setForm({ ...form, category_name: v })}
            />
          </Field>

          <Field label="Subcategory">
            <Input
              value={form.subcategory_name}
              onChange={(v) => setForm({ ...form, subcategory_name: v })}
            />
          </Field>
        </Grid>

        <Field label="Vendor">
          <Input
            value={form.vendor_name}
            onChange={(v) => setForm({ ...form, vendor_name: v })}
          />
        </Field>
      </Section>

      {/* Identifiers */}
      <Section title="Identifiers">
        <Grid>
          <Field label="Serial Number">
            <Input
              value={form.serial_number}
              onChange={(v) => setForm({ ...form, serial_number: v })}
            />
          </Field>

          <Field label="Model Number">
            <Input
              value={form.model_number}
              onChange={(v) => setForm({ ...form, model_number: v })}
            />
          </Field>
        </Grid>
      </Section>

      {/* Purchase */}
      <Section title="Purchase Details">
        <Grid cols={3}>
          <Field label="Purchase Date">
            <Input
              type="date"
              value={form.purchase_date}
              onChange={(v) => setForm({ ...form, purchase_date: v })}
            />
          </Field>

          <Field label="Purchase Cost">
            <Input
              type="number"
              value={form.purchase_cost}
              onChange={(v) => setForm({ ...form, purchase_cost: v })}
            />
          </Field>

          {user.role === "ADMIN" && (
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white"
              >
                <option value="">Select</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_REPAIR">IN_REPAIR</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            </Field>
          )}
        </Grid>
      </Section>

      {/* Assignment */}
      <Section title="Assignment">
        <Grid>
          <Field label="Assigned To">
            <Input
              value={form.assigned_to}
              onChange={(v) => setForm({ ...form, assigned_to: v })}
            />
          </Field>

          <Field label="Warranty Expiry">
            <Input
              type="date"
              value={form.warranty_expiry}
              onChange={(v) => setForm({ ...form, warranty_expiry: v })}
            />
          </Field>
        </Grid>
      </Section>

      {/* Location */}
      <Section title="Location">
        <Grid>
          <Field label="Latitude">
            <Input
              value={form.latitude}
              onChange={(v) => setForm({ ...form, latitude: v })}
            />
          </Field>

          <Field label="Longitude">
            <Input
              value={form.longitude}
              onChange={(v) => setForm({ ...form, longitude: v })}
            />
          </Field>
        </Grid>
      </Section>

      {/* Description */}
      <Section title="Description">
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          rows={3}
          className="
            w-full rounded-lg
            bg-white/10 border border-white/10
            px-3 py-2 text-white
          "
        />
      </Section>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={updateAsset}
          disabled={saving}
          className="
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-700 hover:to-purple-700
            px-6 py-2 rounded-lg
            text-white font-medium
            disabled:opacity-50
          "
        >
          {saving ? "Saving..." : "Update Asset"}
        </button>

        <button
          onClick={() => nav(-1)}
          className="
            px-6 py-2 rounded-lg
            border border-white/20
            text-white/80 hover:bg-white/10
          "
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

}

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">
      {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
    {children}
  </div>
);

const ActionButton = ({ color, children, ...props }) => {
  const styles = {
    orange: "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30",
    gray: "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30",
    green: "bg-green-500/20 text-green-300 hover:bg-green-500/30",
  };

  return (
    <button
      {...props}
      className={`
        px-4 py-2 rounded-lg
        font-medium
        transition
        ${styles[color]}
      `}
    >
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs mb-1 text-white/50">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="
      w-full rounded-lg
      bg-white/10 border border-white/10
      px-3 py-2 text-white
      focus:outline-none focus:ring-2 focus:ring-indigo-500
    "
  />
);

const StatusDisplay = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-500/20 text-green-300",
    IN_REPAIR: "bg-orange-500/20 text-orange-300",
    RETIRED: "bg-gray-500/20 text-gray-300",
  };

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
};



