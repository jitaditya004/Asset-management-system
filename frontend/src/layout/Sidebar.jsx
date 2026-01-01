import { Link,useLocation } from "react-router-dom";
import {NAV_ITEMS} from "../config/navigation";
import { useAuth } from "../hook/useAuth";


export default function Sidebar() {
  const { user, loading,reloadUser }= useAuth();

  if(loading){   
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }
  if(!user){ //to fix , white screen on first load of sidebar
    reloadUser();  
    return null;
  }

  
  return (
    <aside className=" h-screen flex flex-col bg-gradient-to-br from-green-500 via-teal-600 to-green-800 text-white shadow-xl overflow-auto">
      <div className="px-6 py-5 overflow-y-auto text-2xl font-bold tracking-wide border-b border-orange-300 ">
         Asset Portal
      </div>
      <nav className="flex-1 mt-4 space-y-1 px-3 overflow-auto">
        {NAV_ITEMS
          .filter(item=>Array.isArray(item.roles)&&item.roles.map(r=>r.toLowerCase()).includes(user.role.toLowerCase()))
          .map(item=>(<NavItem key={item.to} to={item.to} label={item.label} />
          ))}
      </nav>
    </aside>
  );
}

function NavItem({ to, label}) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 
        ${
          active
            ? "bg-white/25 font-semibold"
            : "hover:bg-white/15 hover:translate-x-1"
        }`}
    >
      {/* <Icon className="text-lg opacity-90" /> */}
      <span className="text-sm tracking-wide">{label}</span>
    </Link>
  );
}




// import { Link, useLocation } from "react-router-dom";
// import {
//   FaHome,
//   FaBox,
//   FaUsers,
//   FaBuilding,
//   FaUserTie,
//   FaTags,
//   FaLayerGroup,
//   FaIndustry,
// } from "react-icons/fa";

// export default function Sidebar() {
//   return (
//     <aside className="w-64 h-screen flex flex-col bg-gradient-to-br from-green-500 via-teal-600 to-green-800 text-white shadow-xl">
//       {/* Logo / Title */}
//       <div className="px-6 py-5 overflow-y-auto text-2xl font-bold tracking-wide border-b border-orange-300">
//         Asset Portal
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 mt-4 space-y-1 px-3">
//         <NavItem to="/" label="Dashboard" icon={FaHome} />
//         <NavItem to="/assets" label="Assets" icon={FaBox} />
//         <NavItem to="/departments" label="Departments" icon={FaBuilding} />
//         <NavItem to="/users" label="Users" icon={FaUsers} />
//         <NavItem to="/designations" label="Designations" icon={FaUserTie} />
//         <NavItem to="/category" label="Category" icon={FaTags} />
//         <NavItem to="/subcat" label="Subcategory" icon={FaLayerGroup} />
//         <NavItem to="/vendors" label="Vendors" icon={FaIndustry} />
//       </nav>
//     </aside>
//   );
// }

// function NavItem({ to, label, icon: Icon }) {
//   const { pathname } = useLocation();
//   const active = pathname === to;

//   return (
//     <Link
//       to={to}
//       className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 
//         ${
//           active
//             ? "bg-white/25 font-semibold"
//             : "hover:bg-white/15 hover:translate-x-1"
//         }`}
//     >
//       <Icon className="text-lg opacity-90" />
//       <span className="text-sm tracking-wide">{label}</span>
//     </Link>
//   );
// }
