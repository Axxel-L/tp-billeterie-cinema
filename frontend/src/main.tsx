import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "./styles/global.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

const clientRequetes = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const racine = document.getElementById("root");
if (!racine) {
  throw new Error("Élément #root introuvable");
}

createRoot(racine).render(
  <StrictMode>
    <QueryClientProvider client={clientRequetes}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

const moduleVerre = "/liquidglass/components.js";
setTimeout(() => {
  void import(/* @vite-ignore */ moduleVerre).catch(() => undefined);
}, 0);
