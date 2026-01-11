
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
        const assigned = assets.filter(a => a.assigned_to !== null).length;
        const unassigned = total - assigned;

        const expired = assets.filter(
          a => a.warranty_expiry && new Date(a.warranty_expiry) < new Date()
        ).length;

        const active=assets.filter(a=>a.status==="ACTIVE").length;
        const inrepair=assets.filter(a=>a.status==="IN_REPAIR" || a.status==="IN_MAINTENANCE").length;
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


  if (!stats) return <p className="p-4 text-white/30">Loading stats...</p>;
  
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



  if (loading) return <p className="p-4 text-white/30">Loading dashboard...</p>;

  
  return (
  <div className="p-6 space-y-8 text-white">
    <h1 className="text-3xl font-semibold tracking-wide">
      Dashboard
    </h1>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard title="Asset Status">
        <StatusBarChart data={statusData} />
      </GlassCard>

      <GlassCard title="Assignment">
        <AssignmentPieChart data={assignmentData} />
      </GlassCard>

      <GlassCard title="Warranty Status">
        <WarrantyPieChart data={warrantyData} />
      </GlassCard>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Assets" value={stats.total} />
      <StatCard label="Active" value={stats.active} />
      <StatCard label="In Repair" value={stats.inrepair} danger />
      <StatCard label="Retired" value={stats.retired} warning />
      <StatCard label="Assigned" value={stats.assigned} />
      <StatCard label="Unassigned" value={stats.unassigned} />
      <StatCard label="Expired Warranty" value={stats.expired} danger />
      <StatCard label="Expiring Soon" value={stats.expiringSoon} warning />
    </div>

    {/* Quick Actions */}
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
      <h2 className="font-medium mb-4 text-white/90">
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-3">
        <ActionButton to="/assets/create" label="➕ Add Asset" />
        <ActionButton to="/assets" label="📦 View Assets" />
      </div>
    </div>
  </div>
);

}



  const COLORS = ["#16a34a", "#dc2626"];
  const WARRANTY_COLORS = ["#dc2626", "#f59e0b", "#16a34a"];

function StatCard({ label, value, danger, warning }) {
  let color = "text-indigo-300";
  if (danger) color = "text-red-400";
  if (warning) color = "text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        bg-white/10 
        border border-white/10
        rounded-xl p-4
        shadow-lg
        hover:translate-y-[-2px]
        transition
      "
    >
      <p className="text-sm text-white/60">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>
        {value}
      </p>
    </motion.div>
  );
}

function ActionButton({ to, label }) {
  return (
    <a
      href={to}
      className="
        bg-gradient-to-r from-indigo-600 to-purple-600
        hover:from-indigo-700 hover:to-purple-700
        text-white px-5 py-2
        rounded-lg text-sm font-medium
        shadow-md hover:shadow-lg
        transition
      "
    >
      {label}
    </a>
  );
}




function StatusBarChart({ data }) {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg hover:shadow-xl
        transition
      "
    >


      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            fill="url(#statusGradient)"
          />
          <defs>
            <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


function AssignmentPieChart({ data }) {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg hover:shadow-xl
        transition
      "
    >

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={55}
            paddingAngle={4}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i]}
                stroke="rgba(255,255,255,0.15)"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
            itemStyle={{
              color: "#fff",
            }}
            labelStyle={{
              color: "#fff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function WarrantyPieChart({ data }) {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg hover:shadow-xl
        transition 
      "
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={55}
            paddingAngle={4}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={WARRANTY_COLORS[i]}
                stroke="rgba(255,255,255,0.15)"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
             itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


function GlassCard({ title, children }) {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg
        hover:shadow-xl
        transition
      "
    >
      <h2 className="font-medium mb-3 text-white/90">
        {title}
      </h2>
      {children}
    </div>
  );
}
