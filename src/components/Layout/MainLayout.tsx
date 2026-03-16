import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";
import { Dashboard } from "../feature/Dashboard";
import { UserList } from "../feature/user/UserList";
import { Menu } from "../feature/menu/Menu";
import { UserRegistration } from "../feature/user/UserRegistration";
import { ViewUserDetails } from "../feature/user/ViewUserDetails";
import { EditUser } from "../feature/user/EditUser";
import ViewDetails from "../feature/role/ViewDetails";
import { RoleList } from "../feature/role/RoleList";
import { PermissionList } from "../feature/permission/PermissionList";
import { Navbar } from "./navbar/Navebar";
import { CountryCreate } from "../feature/location/country/CountryCreate";
import { CountryList } from "../feature/location/country/CountryList";
import { DistrictList } from "../feature/location/district/DistrictList";
import { ProvinceList } from "../feature/location/province/ProvinceList";
import { CategoryList } from "../feature/category/CategoryList";
import CompanyList from "../feature/company/CompanyList";
import { CompanyDetails } from "../feature/company/CompanyDetails";
import { CompanyCreate } from "../feature/company/CompanyCreate";
import CompanyUpdate from "../feature/company/CompanyUpdate";
import { CertificationRequestList } from "../feature/certification-request/CertificationRequestList";
import { CertificationRequestUpdate } from "../feature/certification-request/CertificationRequestUpdate";

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toggle sidebar collapse (desktop)
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Open mobile sidebar
  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar with props */}
      <Sidebar
      // collapsed={sidebarCollapsed}
      // isMobileOpen={mobileSidebarOpen}
      // onToggleCollapse={toggleSidebarCollapse}
      // onCloseMobile={closeMobileSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar with menu click handler */}
        <Navbar onMenuClick={openMobileSidebar} />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-1 sm:p-4 lg:p-1 bg-gray-50">
          <div className="max-w-full mx-auto">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/menu" element={<Menu />} />
              <Route path="users/new" element={<UserRegistration />} />
              <Route path="users/view/:id" element={<ViewUserDetails />} />
              <Route path="users/edit/:id" element={<EditUser />} />
              <Route path="users/role/:id" element={<ViewDetails />} />
              <Route path="users/roles" element={<RoleList />} />
              <Route path="users/permissions" element={<PermissionList />} />

              <Route path="/country" element={<CountryList />} />
              <Route path="/district" element={<DistrictList />} />
              <Route path="/province" element={<ProvinceList />} />
              <Route path="/category" element={<CategoryList />} />
                      <Route path="/certification-request" element={<CertificationRequestList />} />
                           <Route path="/certification-request/edit/:id" element={<CertificationRequestUpdate />} />
              <Route path="/company" element={<CompanyList />} />
              <Route path="/company/create" element={<CompanyCreate />} />
              <Route path="/company/view/:id" element={<CompanyDetails />} />
              <Route path="/company/edit/:id" element={<CompanyUpdate />} />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
