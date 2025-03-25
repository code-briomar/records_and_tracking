import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Bell, RotateCcwIcon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomSearchBar } from "../components/search_bar";

const NavbarSection = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme")
  );

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
    <div className="border-b-2 border-gray-300 p-5 flex flex-row items-center justify-between">
      {/* Breadcrumb */}
      <div>
        <Breadcrumbs>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Default</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex items-center space-x-2">
        <CustomSearchBar />
        <Sun onClick={() => setDarkMode(!darkMode)} className="w-6 h-6" />
        <RotateCcwIcon className="w-6 h-6" />
        <Bell className="w-6 h-6" />
      </div>
    </div>
  );
};

export default NavbarSection;
