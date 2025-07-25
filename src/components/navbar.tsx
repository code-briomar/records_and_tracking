import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import {
  LucideFolderSync,
  Moon,
  RotateCw,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/auth_context";
import { CustomSearchBar } from "./search_bar";

const NavbarSection = ({ breadcrumbs }: { breadcrumbs: string[] }) => {
  const { authData } = useAuth();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme")
  );
  const [spinning, setSpinning] = useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    setSpinning(true); // Start animation
    setTimeout(() => setSpinning(false), 1000); // Remove animation after 500ms
    // Get the current URL
    const currentUrl = window.location.href;
    // Create a new URL object
    const url = new URL(currentUrl);

    // navigate to the same URL to refresh the page
    navigate(url.pathname + url.search);
  };

  // const notifications = () => {
  //   navigate("/notifications");
  // };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  return (
    <div className="border-b-small border-divider p-5 flex flex-row items-center justify-between">
      {/* Breadcrumb */}
      <div>
        <Breadcrumbs>
          {breadcrumbs.map((item, index) => (
            <BreadcrumbItem key={index}>{item}</BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
      <div className="flex items-center space-x-2">
        {/* Check the page */}
        {window.location.pathname === "/cts" && <CustomSearchBar />}
        {/* <CustomSearchBar /> */}
        <div
          onClick={() => setDarkMode(!darkMode)}
          className="cursor-pointer w-5 h-5"
        >
          {darkMode ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </div>
        <RotateCw
          className={`w-5 h-5 cursor-pointer ${spinning ? "animate-spin" : ""}`}
          onClick={handleClick}
        />
        {/* {authData?.user?.role === "Super Admin" && (
          <Bell className="w-6 h-6" onClick={notifications} />
        )} */}
        {/* Sync Data */}
        {authData?.user?.role === "Super Admin" ||
        authData?.user?.role === "Court Admin" ? (
          <LucideFolderSync
            className="w-5 h-5 cursor-pointer"
            onClick={() => {
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
                    }
                  }),
                  {
                    loading: "🔄 Syncing data with server...",
                    success: (msg: any) => msg,
                    error: (msg: any) => msg,
                  }
                );
              };
              if (navigator.onLine) {
                handleOnline();
              } else {
                toast.error(
                  "You are offline. Please check your internet connection."
                );
              }
            }}
          />
        ) : null}

        {/* Offline or Online */}

        {!navigator.onLine ? (
          <WifiOff className="w-5 h-5 text-red-500" />
        ) : (
          <Wifi className="w-5 h-5 text-green-500" />
        )}
      </div>
    </div>
  );
};

export default NavbarSection;
