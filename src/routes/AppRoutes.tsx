import { Routes, Route } from "react-router-dom";
import { Login } from "../components/feature/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "../components/Layout/MainLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes with MainLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};