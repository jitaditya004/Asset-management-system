import { Navigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";

export default function RequireRole({ allowed, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
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
