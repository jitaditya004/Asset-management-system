import { useEffect, useState } from "react";
import {
  getMaintenanceQueue,
  updateMaintenance,
  rejectMaintenance
} from "../../services/maintenance.service";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";


export default function MaintenanceAdmin() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const res = await getMaintenanceQueue();
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async ()=>{
      await load();
    })();
  }, []);

  const update = async (id, data) => {
    await updateMaintenance(id, data);
    load();
  };

  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection? (optional)");

    try {
      await rejectMaintenance(id,reason);
      load();
    } catch (err) {
      alert("Reject failed");
      console.error(err);
    }
  };


return (
  <div className="p-6 max-w-4xl mx-auto space-y-6 text-white">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-wide">
        🛠 Repair Queue
      </h1>
      <span className="text-sm text-white/50">
        {items.length} requests
      </span>
    </div>

    {/* Empty state */}
    {items.length === 0 && (
      <div className="text-center py-12 text-white/50">
        No maintenance requests
      </div>
    )}

    {/* Cards */}
    {items.map((m) => (
      <div
        key={m.maintenance_id}
        className="
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-2xl p-5
          shadow-lg hover:shadow-xl
          transition
          space-y-4
        "
      >
        {/* Asset info */}
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-lg truncate text-indigo-300">
              {m.asset_name}
            </p>
            <p className="text-sm text-white/50">
              Reported by: {m.reported_by_name}
            </p>
            <p className="text-sm text-white/80 mt-1">
              Issue: {m.issue_description}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={`
              inline-flex items-center justify-center
              min-w-[110px]
              px-3 py-1.5
              m-4
              rounded-full
              text-[11px] font-semibold tracking-wide
              leading-none
              uppercase
              ${
                m.status === "OPEN"
                  ? "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30"
                  : m.status === "IN_PROGRESS"
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                  : m.status === "COMPLETED"
                  ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/30"
                  : m.status === "REJECTED"
                  ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                  : "bg-gray-500/20 text-gray-300 ring-1 ring-gray-500/30"
              }
            `}
          >
            {m.status === "IN_PROGRESS"
              ? "IN PROGRESS"
              : m.status}
          </span>

        </div>

        {/* Rejection info */}
        {m.status === "REJECTED" && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p>
              <span className="font-medium">Rejected by:</span>{" "}
              {m.reviewed_by_name}
            </p>
            {m.rejection_reason && (
              <p className="mt-1 italic">
                Reason: {m.rejection_reason}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {m.status === "OPEN" && (
          <div className="flex gap-3">
            <button
              onClick={() =>
                update(m.maintenance_id, { status: "IN_PROGRESS" })
              }
              className="
                flex-1
                bg-gradient-to-r from-indigo-600 to-blue-600
                hover:from-indigo-700 hover:to-blue-700
                text-white py-2 rounded-lg
                transition
              "
            >
              Accept
            </button>

            <button
              onClick={() => reject(m.maintenance_id)}
              className="
                flex-1
                bg-red-500/20 hover:bg-red-500/30
                text-red-300 py-2 rounded-lg
                transition
              "
            >
              Reject
            </button>
          </div>
        )}

        {m.status === "IN_PROGRESS" && (
          <div className="space-y-3">
            {/* Priority */}
            {/* <select
              value={m.priority}
              onChange={(e) =>
                update(m.maintenance_id, {
                  priority: e.target.value,
                })
              }
              className="
                w-full rounded-lg
                bg-white/10 border border-white/10
                px-3 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select> */}
<PrioritySelect
  value={m.priority}
  onChange={(v) =>
    update(m.maintenance_id, { priority: v })
  }
/>




            {/* Vendor */}
            <input
              className="
                w-full rounded-lg
                bg-white/10 border border-white/10
                px-3 py-2 text-white placeholder:text-white/40
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
              placeholder="Vendor / Technician"
              defaultValue={m.assigned_vendor || ""}
              onBlur={(e) =>
                update(m.maintenance_id, {
                  assigned_vendor: e.target.value,
                })
              }
            />

            {/* Complete */}
            <button
              onClick={() =>
                update(m.maintenance_id, { status: "COMPLETED" })
              }
              className="
                w-full
                bg-gradient-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                text-white py-2 rounded-lg
                transition
              "
            >
              Mark as Completed
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
);

}



const priorities = ["LOW", "MEDIUM", "HIGH"];

function PrioritySelect({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        {/* BUTTON */}
        <ListboxButton
          className="
            w-full flex items-center justify-between
            bg-black/40 text-white hover:bg-black/70
            px-3 py-2 rounded-lg
            border border-white/20
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        >
          <span>{value}</span>
          <ChevronDown size={16} className="text-white/60" />
        </ListboxButton>

        {/* OPTIONS */}
        <ListboxOptions
          className="
            absolute z-50 mt-2 w-full
            bg-black/90 backdrop-blur-xl
            border border-white/20
            rounded-xl shadow-2xl
            overflow-hidden
          "
        >
          {priorities.map((p) => (
            <ListboxOption
              key={p}
              value={p}
              className={({ active, selected }) =>
                `
                  cursor-pointer px-4 py-2 text-sm
                  ${
                    active
                      ? "bg-indigo-500/20 text-white"
                      : "text-white/80"
                  }
                  ${selected ? "font-semibold" : ""}
                `
              }
            >
              {p}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}