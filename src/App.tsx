import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuditLogs from "./audit_logs";
import Auth from "./auth";
import NotificationsSection from "./components/notifications_section.tsx";
import CTS from "./cts";
import Customize from "./customize";
import Dashboard from "./dashboard";
import File from "./files";
import Home from "./home";
import Messaging from "./messaging";
import Notifications from "./notifications";
import Staff from "./staff";
import Tools from "./tools/index.tsx";


import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

import { addToast } from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

import { Navigate } from "react-router-dom";
import { useAuth } from "./context/auth_context.tsx";
import Diary from "./diary/index.tsx";

(async () => {
  const update = await check();
  if (update) {
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );
    let downloaded = 0;
    let contentLength = 0;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength ?? 0;
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case "Finished":
          console.log("download finished");
          break;
      }
    });

    console.log("update installed");
    await relaunch();
  }
})();

const PrivateRoute = ({
  authData,
  children,
}: {
  authData: any;
  children: React.ReactNode;
}) => {
  return authData ? children : <Navigate to="/" replace />;
};

function App() {
  const { authData } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      addToast({
        title: "Syncing data...",
        description: "Your data is being synced with the server.",
        promise: new Promise((resolve) => {
          console.log("Online detected — syncing data...");
          invoke("sync_files").catch((err) =>
            console.error("Sync failed:", err)
          );

          setTimeout(() => {
            resolve("Sync complete!");
          }, 2000); // Simulate a delay for the promise
        }),
      });
    };

    window.addEventListener("online", handleOnline);

    // Optional: trigger immediately if already online
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Auth />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute authData={authData}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute authData={authData}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cts"
          element={
            <PrivateRoute authData={authData}>
              <CTS />
            </PrivateRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <PrivateRoute authData={authData}>
              <Diary />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute authData={authData}>
              <Staff />
            </PrivateRoute>
          }
        />
        <Route
          path="/files"
          element={
            <PrivateRoute authData={authData}>
              <File />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute authData={authData}>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/all_notifications"
          element={
            <PrivateRoute authData={authData}>
              <NotificationsSection />
            </PrivateRoute>
          }
        />
        <Route
          path="/messaging"
          element={
            <PrivateRoute authData={authData}>
              <Messaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/tools"
          element={
            <PrivateRoute authData={authData}>
              <Tools />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit_logs"
          element={
            <PrivateRoute authData={authData}>
              <AuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/customize"
          element={
            <PrivateRoute authData={authData}>
              <Customize />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
