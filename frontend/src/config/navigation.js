import {
  LayoutDashboard,
  Boxes,
  Building2,
  Users,
  UserCog,
  Tags,
  Layers,
  Truck,
  MapPin,
  ClipboardList,
  Wrench,
  MessageSquare
} from "lucide-react";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Assets",
    to: "/assets",
    icon: Boxes,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Departments",
    to: "/departments",
    icon: Building2,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Users",
    to: "/users",
    icon: Users,
    roles: ["ADMIN"]
  },
  {
    label: "Designations",
    to: "/designations",
    icon: UserCog,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Category",
    to: "/category",
    icon: Tags,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Subcategory",
    to: "/subcat",
    icon: Layers,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Vendors",
    to: "/vendors",
    icon: Truck,
    roles: ["ADMIN", "ASSET_MANAGER","USER"]
  },
  {
    label: "Locations",
    to: "/locations",
    icon: MapPin,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "My Requests",
    to: "/my-requests",
    icon: ClipboardList,
    roles: ["ADMIN", "ASSET_MANAGER","USER"]
  },
  {
    label: "Admin Asset Requests",
    to: "/adminrequests",
    icon: ClipboardList,
    roles: ["ADMIN"]
  },
  {
    label: "Repair Requests",
    to: "/maintenance/admin",
    icon: Wrench,
    roles: ["ADMIN"]
  },
  {
    label: "Suggestions",
    to: "/suggestion",
    icon: MessageSquare,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },











   {
    label: "Subcategory",
    to: "/subcat",
    icon: Layers,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Vendors",
    to: "/vendors",
    icon: Truck,
    roles: ["ADMIN", "ASSET_MANAGER","USER"]
  },
  {
    label: "Locations",
    to: "/locations",
    icon: MapPin,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "My Requests",
    to: "/my-requests",
    icon: ClipboardList,
    roles: ["ADMIN", "ASSET_MANAGER","USER"]
  },
  {
    label: "Admin Asset Requests",
    to: "/adminrequests",
    icon: ClipboardList,
    roles: ["ADMIN"]
  },
  {
    label: "Repair Requests",
    to: "/maintenance/admin",
    icon: Wrench,
    roles: ["ADMIN"]
  },
  {
    label: "Suggestions",
    to: "/suggestion",
    icon: MessageSquare,
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
];

