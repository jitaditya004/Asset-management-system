
import { useEffect, useState } from "react";
import API from "../api/api";
import { motion } from "framer-motion";
import {
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get("/assets");
        const assets = res.data;

        const total = assets.length;
        const assigned = assets.filter(a => a.assigned_to !== "NOT ASSIGNED").length;
        const unassigned = total - assigned;

        const expired = assets.filter(
          a => a.warranty_expiry && new Date(a.warranty_expiry) < new Date()
        ).length;

        const active=assets.filter(a=>a.status==="ACTIVE").length;
        const inrepair=assets.filter(a=>a.status==="IN_REPAIR").length;
        const retired=assets.filter(a=>a.status==="RETIRED").length;

        const expiringSoon = assets.filter(a => {
          if (!a.warranty_expiry) return false;
          const d = new Date(a.warranty_expiry);
          const now = new Date();
          const in30 = new Date();
          in30.setDate(now.getDate() + 30);
          return d >= now && d <= in30;
        }).length;

        setStats({
          total,
          active,
          inrepair,
          retired,
          assigned,
          unassigned,
          expired,
          expiringSoon,
        });
        setLoading(false);
      }catch(err){
          console.error(err);        
      }
    }

    load();
  }, []);


  if (!stats) return <p className="p-4">Loading stats...</p>;
  
  const assignmentData = [
    { name: "Assigned", value: stats.assigned },
    { name: "Unassigned", value: stats.unassigned },
  ];

  const statusData = [
    { name: "Active", value: stats.active },
    { name: "In Repair", value: stats.inrepair },
    { name: "Retired", value: stats.retired },
  ];

  const warrantyData = [
    { name: "Expired", value: stats.expired },
    { name: "Expiring Soon", value: stats.expiringSoon },
    {
      name: "Not Expiring",
      value:
        stats.total -
        stats.expired -
        stats.expiringSoon,
    },
  ];



  if (loading) return <p className="p-4">Loading dashboard...</p>;

  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusBarChart data={statusData} />
        <AssignmentPieChart data={assignmentData} />
        <WarrantyPieChart data={warrantyData} />
      </div>

      {/* Stat cards (always top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="In Repair" value={stats.inrepair} danger/>
        <StatCard label="Retired" value={stats.retired} warning/>
        <StatCard label="Assigned" value={stats.assigned} />
        <StatCard label="Unassigned" value={stats.unassigned} />
        <StatCard label="Expired Warranty" value={stats.expired} danger />
        <StatCard label="Expiring Soon" value={stats.expiringSoon} warning />
      </div>

      

      {/* Quick actions (moves below charts on small screens) */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <ActionButton to="/assets/create" label="Add Asset" />
          <ActionButton to="/assets" label="View Assets" />
        </div>
      </div>
    </div>

  );
}



  const COLORS = ["#16a34a", "#dc2626"];
  const WARRANTY_COLORS = ["#dc2626", "#f59e0b", "#16a34a"];

function StatCard({ label, value, danger, warning }) {
  let color = "text-gray-800";
  if (danger) color = "text-red-600";
  if (warning) color = "text-yellow-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded shadow p-4"
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </motion.div>
  );
}


function ActionButton({ to, label }) {
  return (
    <a
      href={to}
      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
    >
      {label}
    </a>
  );
}



function StatusBarChart({ data }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-medium mb-3">Asset Status</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


function AssignmentPieChart({ data }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-medium mb-3">Assignment</h2>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


function WarrantyPieChart({ data }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-medium mb-3">Warranty Status</h2>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={WARRANTY_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}