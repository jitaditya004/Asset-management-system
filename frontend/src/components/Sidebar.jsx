import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-50 border-r min-h-screen p-4 bg-gradient-to-tr from-orange-400 via-yellow-300 to-orange-400">
      <nav className="space-y-2">
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/assets" label="Assets" />
        <NavItem to="/departments" label="Departments" />
        <NavItem to="/users" label="Users" />
        <NavItem to="/designations" label="Designation" />
        <NavItem to="/category" label="Category" />
        <NavItem to="/subcat" label="Subcategory" />
        <NavItem to="/vendors" label="Vendors" />
      </nav>
    </aside>
  );
}

function NavItem({ to, label }) {
  return (
    <Link
      to={to}
      className="block border border-blue-700 px-3 py-2 rounded-lg hover:bg-blue-500 hover:text-white text-lg"
    >
      {label}
    </Link>
  );
}
