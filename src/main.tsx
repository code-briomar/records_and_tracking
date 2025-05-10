import { HeroUIProvider, ToastProvider } from "@heroui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { AuthProvider } from "./context/auth_context";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <HeroUIProvider>
        <Toaster position="top-right" richColors />
        <ToastProvider placement="top-right" />
        <App />
      </HeroUIProvider>
    </AuthProvider>
  </React.StrictMode>
);
