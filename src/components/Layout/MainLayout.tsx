import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import CompanyStatusList from "../feature/company/CompanyStatusList";
import { CompanyCreate } from "../feature/company/CompanyCreate";
import CompanyUpdate from "../feature/company/CompanyUpdate";
import { CertificationRequestList } from "../feature/certification-request/CertificationRequestList";
import { CertificationRequestUpdate } from "../feature/certification-request/CertificationRequestUpdate";
import { AttachmentList } from "../feature/attachement/AttachementList";
import { AttachmentCreate } from "../feature/attachement/AttachmentCreate";
import { CertificationList } from "../feature/certification/CertificationList";
import { CertificationDetails } from "../feature/certification/CertificationDetails";

import { PrintCertificationPage } from "../feature/certification/PrintCertificationPage";
import ZoneList from "../feature/zone/ZoneList";
import { CommiteeList } from "../feature/commitee/CommiteeList";
import CommiteeMemberList from "../feature/commiteemember/CommiteeMemberList";
import { CommiteeAssignmentList } from "../feature/commiteeassignment/CommiteeAssignmentList";
import { CommiteeAssignmentDetails } from "../feature/commiteeassignment/CommiteeAssignmentDetails.tsx";
import CertificationRequestView from "../feature/certification-request/CertificationRequestView";
import { CertificationRequestListDeadLine } from "../feature/setting-deadline/CertificationRequestListDeadLine";
import { CertificationRequestListStandardManagement } from "../feature/standardmanagement/CertificationRequestListStandardManagement";
import { ProtectedRoute } from "../../routes/ProtectedRoute";
import { UnauthorizedDialog } from "../common/UnauthorizedPage";
import { CertificationRequestPayment } from "../feature/certificationpayment/CertificationRequestPayment";
import { CertificationRequestReport } from "../feature/report/CertificationRequestReport";
import { CommiteeDetails } from "../feature/commitee/CommiteeDetails";
import AboutUsList from "../feature/aboutus/AboutUsList";
import AboutUsDetails from "../feature/aboutus/AboutUsDetails";
import OrganizationInfoList from "../feature/organizationinfo/OrganizationInfoList";
import OrganizationInfoDetails from "../feature/organizationinfo/OrganizationInfoDetails";
import ContactUsList from "../feature/contactus/ContactUsList";
import ContactUsDetails from "../feature/contactus/ContactUsDetails";
import CommentList from "../feature/comment/CommentList";
import CommentDetails from "../feature/comment/CommentDetails";
import { InspectionCommitteApprovedRequest } from "../feature/inspection-committee-approved-request/InspectionCommitteApprovedRequest.tsx";
import { RejectedRequest } from "../feature/rejected-request/RejectedRequest.tsx";
import { AcceptedRequest } from "../feature/accepted-request/AcceptedRequest.tsx";
import OrganizationServicesList from "../feature/organizationservices/OrganizationServicesList.tsx";
import InternationalPartyList from "../feature/internationalparty/InternationalPartyList.tsx";
import OrganizationServicesDetails from "../feature/organizationservices/OrganizationServicesDetails.tsx";
import InternationalPartyDetails from "../feature/internationalparty/InternationalPartyDetails.tsx";
import NotificationList from "../feature/notification/NotificationList.tsx";
import CompanyDetails from "../feature/company/CompanyDetails.tsx";
import { CertificationVerification } from "../feature/certification/CertificationVerification.tsx";
import { ApprovalCommiteeList } from "../feature/commitee/ApprovalCommiteeList.tsx";
import { InspectionCommiteeList } from "../feature/commitee/InspectionCommiteeList.tsx";
import { InspectionAssignmentList } from "../feature/commiteeassignment/InspectionAssignmentList.tsx";
import { ApprovalAssignmentList } from "../feature/commiteeassignment/ApprovalAssignmentList.tsx";
import AuditLogList from "../feature/auditlog/AuditLogList.tsx";
import UserProfilePage from "../feature/user/profile/UserProfilePage";
import UserSettingsPage from "../feature/user/profile/UserSettingsPage";
import CertificationRequestTracking from "../feature/certification-request/CertificationRequestTracking.tsx";

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>("/dashboard");

  const location = useLocation();
  const navigate = useNavigate();

  // Track previous path for "Go Back" functionality
  useEffect(() => {
    if (location.pathname !== "/unauthorized") {
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
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar with menu click handler */}
        <Navbar collapsed={sidebarCollapsed} />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-1 sm:p-4 lg:p-1 bg-gray-50">
          <div className="max-w-full mx-auto">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute permission="VIEW_USER">
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/new"
                element={
                  <ProtectedRoute permission="ADD_USER">
                    <UserRegistration />
                  </ProtectedRoute>
                }
              />
              <Route path="users/menu" element={<Menu />} />
              {/* <Route path="users/new" element={<UserRegistration />} /> */}
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
              <Route path="reports" element={<CertificationRequestReport />} />

              <Route path="province" element={<ProvinceList />} />
              <Route path="general-info" element={<OrganizationInfoList />} />
              <Route path="category" element={<CategoryList />} />
              <Route
                path="commitee-assignment-list"
                element={<InspectionAssignmentList />}
              />
              <Route
                path="request-tracking"
                element={<CertificationRequestTracking />}
              />
              <Route
                path="approval-commitee-assignment"
                element={<ApprovalAssignmentList />}
              />
              <Route
                path="commitee-assignment/view/:id"
                element={<CommiteeAssignmentDetails />}
              />
              <Route path="commitee-list" element={<CommiteeList />} />
              <Route
                path="approva-commitee"
                element={<ApprovalCommiteeList />}
              />
              <Route
                path="inspection-commitee"
                element={<InspectionCommiteeList />}
              />
              <Route
                path="commitee-members-list"
                element={<CommiteeMemberList />}
              />
              <Route
                path="certification-request"
                element={<CertificationRequestList />}
              />

              <Route
                path="certification-verification"
                element={<CertificationVerification />}
              />
              <Route
                path="partner-organization"
                element={<InternationalPartyList />}
              />
              <Route
                path="certification-request-deadline"
                element={<CertificationRequestListDeadLine />}
              />
              <Route
                path="standard-management"
                element={<CertificationRequestListStandardManagement />}
              />

              <Route
                path="approved-request"
                element={<InspectionCommitteApprovedRequest />}
              />

              <Route path="rejected-request" element={<RejectedRequest />} />

              <Route path="accepted-request" element={<AcceptedRequest />} />
              <Route
                path="payment-management"
                element={<CertificationRequestPayment />}
              />
              <Route path="zone" element={<ZoneList />} />
              <Route
                path="certifications/print/:id"
                element={<PrintCertificationPage />}
              />
              <Route
                path="certification-details/:requestId"
                element={<CertificationDetails />}
              />
              <Route path="certifications" element={<CertificationList />} />
              <Route
                path="certification-request/edit/:id"
                element={
                  <CertificationRequestUpdate
                    requestId={null}
                    currentStatus={""}
                    visible={false}
                    onHide={() => {}}
                    onSuccess={() => {}}
                  />
                }
              />
              <Route
                path="certification-request/view/:id"
                element={<CertificationRequestView />}
              />

              <Route path="commitee/view/:id" element={<CommiteeDetails />} />
              <Route path="company" element={<CompanyList />} />
              <Route
                path="company/certificate-issued"
                element={<CompanyStatusList status="CERTIFICATE_ISSUED" />}
              />
              <Route
                path="company/rejected"
                element={<CompanyStatusList status="REJECTED" />}
              />
              <Route
                path="company/under-review"
                element={
                  <CompanyStatusList
                    statuses={[
                      "SUBMITTED",
                      "UNDER_REVIEW",
                      "STANDARDS_PROVIDED",
                      "DEADLINE_REQUIRED",
                      "DEADLINE_ASSIGNED",
                      "INSPECTION_IN_PROGRESS",
                      "REPORTED_TO_COMMITTEE",
                      "REPORT_APPROVED",
                      "PAYMENT_PENDING",
                    ]}
                  />
                }
              />

              {/* <Route
                path="company/inspection-in-progress"
                element={<CompanyStatusList status="INSPECTION_IN_PROGRESS" statuses={["INSPECTION_IN_PROGRESS", "PAYMENT_PENDING", "CERTIFICATE_ISSUED"]} />}
              /> */}
              <Route
                path="company/payment-pending"
                element={<CompanyStatusList status="PAYMENT_PENDING" />}
              />
              <Route path="admin-attachments" element={<AttachmentList />} />
              <Route
                path="attachments/create"
                element={
                  <AttachmentCreate
                    referenceId={0}
                    referenceType="COMPANY"
                    onSuccess={() => {}}
                  />
                }
              />
              <Route path="company/create" element={<CompanyCreate />} />
              <Route path="company/view/:id" element={<CompanyDetails />} />
              <Route path="company/edit/:id" element={<CompanyUpdate />} />
              <Route path="about-us" element={<AboutUsList />} />
              <Route
                path="about-us/view/:id"
                element={
                  <AboutUsDetails
                    aboutUsId={null}
                    visible={false}
                    onHide={() => {}}
                  />
                }
              />
              <Route
                path="organization-info"
                element={<OrganizationInfoList />}
              />

              <Route
                path="organization-activity"
                element={<OrganizationServicesList />}
              />
              <Route
                path="organization-services"
                element={<OrganizationServicesList />}
              />
              <Route
                path="organization-services/view/:id"
                element={<OrganizationServicesDetails />}
              />
              <Route
                path="international-party"
                element={<InternationalPartyList />}
              />
              <Route
                path="international-party/view/:id"
                element={<InternationalPartyDetails />}
              />
              <Route
                path="organization-info/view/:id"
                element={<OrganizationInfoDetails />}
              />
              <Route path="contact-us" element={<ContactUsList />} />
              <Route
                path="contact-us/view/:id"
                element={<ContactUsDetails />}
              />
              <Route path="comment" element={<CommentList />} />
              <Route path="comment/view/:id" element={<CommentDetails />} />
              <Route path="notification" element={<NotificationList />} />
              <Route path="audit-log" element={<AuditLogList />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="settings" element={<UserSettingsPage />} />

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
