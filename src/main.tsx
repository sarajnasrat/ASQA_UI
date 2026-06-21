import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./i18n/i18n";
import AppLoader from "./components/common/AppLoader.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Suspense
        fallback={<AppLoader />}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </Suspense>
    </StrictMode>
  </BrowserRouter>,
);
