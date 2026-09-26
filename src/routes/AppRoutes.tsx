import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ToastProvider } from "../hooks/ToastContext";
import { WebsiteLayout } from "./WebsiteLayout";
import AppLoader from "../components/common/AppLoader";

const Home = lazy(() => import("../components/feature/website/pages/Home"));
const About = lazy(() => import("../components/feature/website/pages/About").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("../components/feature/website/pages/Contact"));
const Services = lazy(() => import("../components/feature/website/pages/Services"));
const Registration = lazy(() => import("../components/feature/website/pages/Registration"));
const Companies = lazy(() => import("../components/feature/website/pages/Companies"));
const BlacklistedCompanies = lazy(() => import("../components/feature/website/pages/BlacklistedCompanies"));
const CertificationTypeSelection = lazy(() => import("../components/feature/website/pages/CertificationTypeSelection"));
const CertificationEntrySelection = lazy(() => import("../components/feature/website/pages/CertificationEntrySelection"));
const InternationalParties = lazy(() => import("../components/feature/website/pages/InternationalParties"));
const OrganizationServices = lazy(() => import("../components/feature/website/pages/OrganizationServices"));
const CertificationDetails = lazy(() => import("../components/feature/certification-request/CertificationDetails").then((m) => ({ default: m.CertificationDetails })));
const CertificationVerification = lazy(() => import("../components/feature/certification/CertificationVerification").then((m) => ({ default: m.CertificationVerification })));
const ForgotPassword = lazy(() => import("../components/feature/forgotpassword/ForgotPassword"));
const Login = lazy(() => import("../components/feature/Login").then((m) => ({ default: m.Login })));
const MainLayout = lazy(() => import("../components/Layout/MainLayout").then((m) => ({ default: m.MainLayout })));

export const AppRoutes = () => {
  return (
    <ToastProvider>
      <Suspense fallback={<AppLoader />}>
        <Routes>
        {/* Public route */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route
            path="/international-parties"
            element={<InternationalParties />}
          />
          <Route
            path="/organization-services"
            element={<OrganizationServices />}
          />
          <Route path="/companies" element={<Companies />} />
          <Route path="/blacklisted-companies" element={<BlacklistedCompanies />} />
          <Route path="/registration" element={<Registration />} />
          <Route
            path="/certification-detals"
            element={<CertificationDetails />}
          />
          <Route
            path="certification-verification"
            element={<CertificationVerification />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/certification/start"
            element={<CertificationEntrySelection />}
          />
          <Route
            path="/certification/select-type"
            element={<CertificationTypeSelection />}
          />
        </Route>

        {/* Protected routes with MainLayout */}
        <Route path="/login" element={<Login />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
};
