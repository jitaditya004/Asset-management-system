import { Link, useLocation,useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import { useAuth } from "../hook/useAuth";
import { logout } from "../auth/auth";
import API from "../api/api";
import OnlineStatusPill from "../components/OnlineStatusPill";

export default function Sidebar() {
  const nav=useNavigate();
  const { user, loading, reloadUser } = useAuth();

  if (loading) {
    return (
      <aside className=" h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </aside>
    );
  }

  if (!user) {
    reloadUser();
    return null;
  }

return (
  <aside
    className="
      h-full min-w-0 min-h-0 overflow-hidden
      
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      text-slate-200 shadow-xl 
    "
  >
    {/* Header */}
    <div className="px-6 py-5 text-xl font-semibold border-b border-white/10">
      Asset<span className="text-indigo-400">Portal</span>
    </div>

    {/* Navigation (scrollable middle) */}
    <nav className="overflow-y-auto min-h-0 px-3 py-4 space-y-1 h-[59vh]">
      {NAV_ITEMS
        .filter(item =>
          item.roles
            .map(r => r.toLowerCase())
            .includes(user.role.toLowerCase())
        )
        .map(item => (
          <NavItem key={item.to} {...item}/>
        ))}
    </nav>

    {/* User Plate (fixed bottom) */}
<div className="
  px-4 py-4 
  border-t border-white/10
  bg-slate-900/80
  space-y-4 
">
  {/* User info */}
  <div className="flex items-center gap-3">
    <div
      className="
        w-10 h-10 rounded-full
        bg-gradient-to-br from-indigo-500 to-purple-600
        flex items-center justify-center
        text-white font-bold
        shrink-0
      "
    >
      {(user.full_name || "U")[0].toUpperCase()}
    </div>

    <div className="min-w-0">
      <p className="text-sm font-semibold text-white truncate">
        {user.full_name || "User"}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user.role}
      </p>
    </div>
  </div>

<div className="md:hidden flex flex-col gap-2">
  {/* Status */}
  <div className="flex justify-start">
    <OnlineStatusPill />
  </div>

  {/* Divider */}
  <div className="h-px bg-white/10" />

  {/* Actions */}
  <button
    onClick={async () => {
      await logout(API);
      nav("/login");
    }}
    className="
      w-full 
      flex items-center justify-center gap-2
      bg-red-500/20 text-red-300
      border border-red-500/30
      hover:bg-red-500/30 hover:text-red-200
      px-4 py-2 rounded-lg
      text-sm font-medium
      transition
      active:scale-95
    "
  >
    ⏻ Logout
  </button>
  </div>
</div>

    
  </aside>
);

}

function NavItem({ to, label, icon: Icon }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`
        group flex items-center gap-3
        px-4 py-2 rounded-lg text-sm
        transition-all duration-200
        ${
          active
            ? "bg-indigo-600 text-white shadow-md"
            : "hover:bg-white/10 hover:translate-x-1"
        }
      `}
    >
      <Icon
        size={18}
        className={`
          transition-transform duration-200
          ${active ? "text-white" : "text-indigo-400"}
          group-hover:scale-110
        `}
      />
      <span className="tracking-wide">{label}</span>
    </Link>
  );
}
