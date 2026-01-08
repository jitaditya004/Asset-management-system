import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetCreate from "./pages/AssetCreate";
import AssetDetail from "./pages/AssetDetail";
import ProtectedRoute from "./auth/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import Signup from "./pages/Signup"
import Department from "./pages/Departments";
import Users from "./pages/UserList";
import Categories from "./pages/Categories";
import DesignationPage from "./pages/Designations";
import Subcategories from "./pages/Subcategories";
import Vendors from "./pages/Vendors";
import AssetUpdate from "./pages/AssetUpdate";
import RegionAssets from "./pages/regions/RegionAssets";
import RegionMapPicker from "./pages/regions/RegionMapPicker";
import RegionSelect from "./pages/regions/RegionSelect";
import MyRequests from "./pages/MyRequests";
import AdminRequests from "./pages/AdminRequests";
import RequestAsset from "./pages/RequestAsset";
import MaintenanceAdmin from "./pages/maintenance/MaintenanceAdmin";
import LocationsAdmin from "./pages/LocationsAdmin";
import SuggestionPage from "./pages/SuggestionPage";
import Unauthorized from "./pages/Unauthorized";
import RequireRole from "./components/auth/RequireRole";

export default function App() {
  
  return (
    //<div className="min-h-screen bg-gray-100">
      //<div className="container mx-auto px-4 py-6">

        
          <Routes>
            {/* Public Route (NO Navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes (WITH Navbar) */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

              {/* Public / all authenticated users */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:public_id" element={<AssetDetail />} />
              <Route path="/regionassets/:regionName" element={<RegionAssets />} />
              <Route path="/regionselect" element={<RegionSelect />} />
              <Route path="/regionmappicker" element={<RegionMapPicker />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/asset/:assetId/request" element={<RequestAsset />} />
              <Route path="/suggestion" element={<SuggestionPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* ADMIN ONLY */}
              <Route
                path="/assets/create"
                element={
                  <RequireRole roles={["ADMIN"]}>
                    <AssetCreate />
                  </RequireRole>
                }
              />

              <Route
                path="/asset/:id/update"
                element={
                  <RequireRole roles={["ADMIN"]}>
                    <AssetUpdate />
                  </RequireRole>
                }
              />

              <Route
                path="/adminrequests"
                element={
                  <RequireRole roles={["ADMIN"]}>
                    <AdminRequests />
                  </RequireRole>
                }
              />

              <Route
                path="/maintenance/admin"
                element={
                  <RequireRole roles={["ADMIN"]}>
                    <MaintenanceAdmin />
                  </RequireRole>
                }
              />

              {/* Optional: admin-only master data */}
              <Route
                path="/category"
                element={
               
                    <Categories />
            
                }
              />

              <Route
                path="/departments"
                element={
            
                    <Department />
            
                }
              />

              <Route
                path="/designations"
                element={
           
                    <DesignationPage />
          
                }
              />

              <Route
                path="/users"
                element={
                  <RequireRole roles={["ADMIN"]}>
                    <Users />
                  </RequireRole>
                }
              />

              <Route
                path="/subcat"
                element={
          
                    <Subcategories />
         
                }
              />

              <Route
                path="/vendors"
                element={
              
                    <Vendors />
           
                }
              />

              <Route
                path="/locations"
                element={
               
                    <LocationsAdmin />
             
                }
              />

            </Route>

          </Routes>
        

    //  </div>
   // </div>
  );
}

  

