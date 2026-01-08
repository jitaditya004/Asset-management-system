import { Navigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}


//usage
{/* <Route
  path="/users"
  element={
    <RequireRole allowed={["ADMIN"]}>
      <UsersPage />
    </RequireRole>
  }
/>

<Route
  path="/assets"
  element={
    <RequireRole allowed={["ADMIN", "ASSET_MANAGER"]}>
      <AssetsPage />
    </RequireRole>
  }
/>

<Route
  path="/dashboard"
  element={
    <RequireRole allowed={["ADMIN", "ASSET_MANAGER", "USER"]}>
      <Dashboard />
    </RequireRole>
  }
/> */}
