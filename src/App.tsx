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
import WhyUseThis from "./why_use_this";

import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./context/auth_context.tsx";
import Diary from "./diary/index.tsx";

import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

import { addToast } from "@heroui/react";
import { info, error as log_error } from "@tauri-apps/plugin-log";
import TitleBar from "./components/title_bar.tsx";

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
    const checkForUpdates = async () => {
      try {
        const update = await check();
        console.log("Update from check:", update);

        if (update) {
          info(`Found update: ${update.version}`);
          console.log(
            `found update ${update.version} from ${update.date} with notes ${update.body}`
          );
          let downloaded = 0;
          let contentLength = 0;

          await update.downloadAndInstall((event) => {
            info(`Update event: ${event.event}`);
            console.log("Download event:", event);
            switch (event.event) {
              case "Started":
                contentLength = event.data.contentLength ?? 0;
                console.log(
                  `started downloading ${event.data.contentLength} bytes`
                );
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

          info("Update installed successfully.");

          console.log("update installed");
          addToast({
            title: "Update Installed",
            description: `The application has been updated to version ${update.version}.`,
            color: "success",
            shouldShowTimeoutProgress: true,
          });

          console.log("Relaunching application...");
          await relaunch();
          console.log("Application relaunched.");
        } else {
          info("No updates available.");
          console.log("No update found.");
          toast.info("No new updates found.");
        }
      } catch (error) {
        console.error("Error checking for update:", error);
        toast.error(
          "Error checking for update. Please check your internet connection."
        );
        log_error(`Error checking for updates: ${error}`);
      }
    };

    const handleOnline = () => {
      toast.promise(
        new Promise(async (resolve, reject) => {
          try {
            console.log("Online detected — syncing data...");
            await invoke("sync_files");
            resolve("Sync complete!");
          } catch (err) {
            console.error("❌ Sync failed:", err);
            reject(
              "Sync failed. Check your internet connection and try again."
            );
          } finally {
            await checkForUpdates();
          }
        }),
        {
          loading: "🔄 Syncing data with server...",
          success: (msg: any) => msg,
          error: (msg: any) => msg,
        }
      );
    };

    window.addEventListener("online", handleOnline);

    // Optional: trigger immediately if already online
    if (navigator.onLine) {
      handleOnline();
    }

    // Remove drag and drop events
    window.addEventListener("dragover", (event) => {
      event.preventDefault();
      return false;
    });

    window.addEventListener("drop", (event) => {
      event.preventDefault();
      return false;
    });

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      <TitleBar />
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Auth />} />
          {/* INCLUDE IN FUTURE RELEASE */}
          {/* <Route path="/splashscreen" element={<SplashScreen />} /> */}

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
          <Route
            path="/why-use-this"
            element={
              <PrivateRoute authData={authData}>
                <WhyUseThis />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
