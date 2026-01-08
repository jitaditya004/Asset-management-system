import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import { useAuth } from "../hook/useAuth";

export default function Sidebar() {
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
      h-full min-w-0 overflow-hidden
      grid grid-rows-[auto_1fr_auto]
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      text-slate-200 shadow-xl
    "
  >
    {/* Header */}
    <div className="px-6 py-5 text-xl font-semibold border-b border-white/10">
      Asset<span className="text-indigo-400">Portal</span>
    </div>

    {/* Navigation (scrollable middle) */}
    <nav className="overflow-y-auto px-3 py-4 space-y-1">
      {NAV_ITEMS
        .filter(item =>
          item.roles
            .map(r => r.toLowerCase())
            .includes(user.role.toLowerCase())
        )
        .map(item => (
          <NavItem key={item.to} {...item} />
        ))}
    </nav>

    {/* User Plate (fixed bottom) */}
    <div className="px-4 py-4 border-t border-white/10 bg-slate-900/80">
      <div className="flex items-center gap-3">
        <div className="
          w-10 h-10 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-600
          flex items-center justify-center
          text-white font-bold
        ">
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
