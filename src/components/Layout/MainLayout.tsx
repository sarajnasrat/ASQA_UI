import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import { AttachmentList } from "../feature/attachement/AttachementList";
import { AttachmentCreate } from "../feature/attachement/AttachmentCreate";
import { CertificationList } from "../feature/certification/CertificationList";

import { PrintCertificationPage } from "../feature/certification/PrintCertificationPage";
import ZoneList from "../feature/zone/ZoneList";
import { CommiteeList } from "../feature/commitee/CommiteeList";
import CommiteeMemberList from "../feature/commiteemember/CommiteeMemberList";
import { CommiteeAssignmentList } from "../feature/commiteeassignment/CommiteeAssignmentList";
import CertificationRequestView from "../feature/certification-request/CertificationRequestView";
import { CertificationRequestListDeadLine } from "../feature/setting-deadline/CertificationRequestListDeadLine";
import { CertificationRequestListStandardManagement } from "../feature/standardmanagement/CertificationRequestListStandardManagement";
import { ProtectedRoute } from "../../routes/ProtectedRoute";
import { UnauthorizedDialog } from "../common/UnauthorizedPage";
import { CertificationRequestPayment } from "../feature/certificationpayment/CertificationRequestPayment";


export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>('/dashboard');
  
  const location = useLocation();
  const navigate = useNavigate();

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

  // Track previous path for "Go Back" functionality
  useEffect(() => {
    if (location.pathname !== '/unauthorized') {
      setPreviousPath(location.pathname);
    }
  }, [location]);

  // Watch for unauthorized route and show dialog
  useEffect(() => {
    if (location.pathname === "/unauthorized") {
      setShowUnauthorized(true);
    }
  }, [location.pathname]);

  const handleCloseUnauthorized = () => {
    setShowUnauthorized(false);
    // Navigate back to previous page or dashboard
    navigate(previousPath, { replace: true });
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
              
              {/* Protected Routes */}
              <Route
                path="country"
                element={
                  <ProtectedRoute permission="VIEW_COUNTRY">
                    <CountryList />
                  </ProtectedRoute>
                }
              />
              <Route path="district" element={<DistrictList />} />
              <Route path="province" element={<ProvinceList />} />
              <Route path="category" element={<CategoryList />} />
              <Route path="commitee-assignment-list" element={<CommiteeAssignmentList />} />
              <Route path="commitee-list" element={<CommiteeList />} />
              <Route path="commitee-members-list" element={<CommiteeMemberList />} />
              <Route path="certification-request" element={<CertificationRequestList />} />
              <Route path="certification-request-deadline" element={<CertificationRequestListDeadLine />} />
              <Route path="standard-management" element={<CertificationRequestListStandardManagement />} />
                            <Route path="payment-management" element={<CertificationRequestPayment />} />
              <Route path="zone" element={<ZoneList />} />
              <Route path="certifications/print/:id" element={<PrintCertificationPage />} />
              <Route path="certifications" element={<CertificationList />} />
              <Route
                path="certification-request/edit/:id"
                element={<CertificationRequestUpdate
                  requestId={null}
                  currentStatus={""}
                  visible={false}
                  onHide={() => {}}
                  onSuccess={() => {}}
                />}
              />
              <Route path="certification-request/view/:id" element={<CertificationRequestView />} />
              <Route path="company" element={<CompanyList />} />
              <Route path="admin-attachments" element={<AttachmentList />} />
              <Route
                path="attachments/create"
                element={<AttachmentCreate
                  referenceId={0}
                  referenceType="COMPANY"
                  onSuccess={() => {}}
                />}
              />
              <Route path="company/create" element={<CompanyCreate />} />
              <Route path="company/view/:id" element={<CompanyDetails />} />
              <Route path="company/edit/:id" element={<CompanyUpdate />} />
              
              {/* Remove the unauthorized route from here */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Unauthorized Dialog - Rendered outside Routes so it overlays everything */}
      <UnauthorizedDialog 
        isOpen={showUnauthorized} 
        onClose={handleCloseUnauthorized} 
      />
    </div>
  );
};