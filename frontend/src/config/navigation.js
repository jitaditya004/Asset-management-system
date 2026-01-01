// src/config/navigation.js

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    roles: ["ADMIN", "ASSET_MANAGER", "USER"]
  },
  {
    label: "Assets",
    to: "/assets",
    roles: ["ADMIN", "ASSET_MANAGER","USER"]
  },
  {
    label: "Departments",
    to: "/departments",
    roles: ["ADMIN"]
  },
  {
    label: "Users",
    to: "/users",
    roles: ["ADMIN"]
  },
  {
    label: "Designations",
    to: "/designations",
    roles: ["ADMIN"]
  },
  {
    label: "Category",
    to: "/category",
    roles: ["ADMIN", "ASSET_MANAGER"]
  },
  {
    label: "Subcategory",
    to: "/subcat",
    roles: ["ADMIN", "ASSET_MANAGER"]
  },
  {
    label: "Vendors",
    to: "/vendors",
    roles: ["ADMIN","ASSET_MANAGER"]
  }
];
