import { addToast, BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import { Bell, LucideFolderSync, Moon, RotateCw, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    navigate(url.pathname + url.search, { replace: true });
  };

  const notifications = () => {
    navigate("/notifications");
  };

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
          className="cursor-pointer w-6 h-6"
        >
          {darkMode ? (
            <Moon className="w-6 h-6" />
          ) : (
            <Sun className="w-6 h-6" />
          )}
        </div>
        <RotateCw
          className={`w-6 h-6 cursor-pointer ${spinning ? "animate-spin" : ""}`}
          onClick={handleClick}
        />
        {authData?.role == "Super Admin" && (
          <Bell className="w-6 h-6" onClick={notifications} />
        )}
        {/* Sync Data */}
        <LucideFolderSync
          className="w-6 h-6 cursor-pointer"
          onClick={() => {
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
          }}
        />
      </div>
    </div>
  );
};

export default NavbarSection;
