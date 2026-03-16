import { Routes, Route } from "react-router-dom";
import { Login } from "../components/feature/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "../components/Layout/MainLayout";
import { ToastProvider } from "../hooks/ToastContext";
import Home from "../components/feature/website/pages/Home";
import { About } from "../components/feature/website/pages/About";
import Contact from "../components/feature/website/pages/Contact";
import Services from "../components/feature/website/pages/Services";
import Registration from "../components/feature/website/pages/Registration";
import Companies from "../components/feature/website/pages/Companies";
import { WebsiteLayout } from "./WebsiteLayout";
import CertificationTypeSelection from "../components/feature/website/pages/CertificationTypeSelection";


export const AppRoutes = () => {
  return (
    <ToastProvider>

      <Routes>
        {/* Public route */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/contact" element={<Contact />} />
             <Route path="/certification/select-type" element={<CertificationTypeSelection />} />
        </Route>

        {/* Protected routes with MainLayout */}
             <Route path="/login" element={<Login />} />

            <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />

      </Routes>
    </ToastProvider>
  );
};
