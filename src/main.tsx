import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/vazirmatn/arabic.css";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ColorModeProvider } from "./context/ColorModeContext";
import "./i18n/i18n";
import AppLoader from "./components/common/AppLoader.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Suspense
        fallback={<AppLoader />}
      >
        <ColorModeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ColorModeProvider>
      </Suspense>
    </StrictMode>
  </BrowserRouter>,
);
