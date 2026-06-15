import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./i18n/i18n";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Suspense
        fallback={(
          <div className="min-h-screen flex items-center justify-center text-gray-600">
            Loading...
          </div>
        )}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </Suspense>
    </StrictMode>
  </BrowserRouter>,
);
