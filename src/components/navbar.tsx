import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Bell, Moon, RotateCcwIcon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomSearchBar } from "../components/search_bar";
import {useNavigate} from "react-router-dom";

const NavbarSection = ({breadcrumbs}:{breadcrumbs:string[]}) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme")
  );
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setSpinning(true); // Start animation
    setTimeout(() => setSpinning(false), 500); // Remove animation after 500ms
    window.location.reload(); // Refresh page
  };

  const notifications = () =>{
    navigate("/notifications");
  }

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
          {breadcrumbs.map((item,index)=>(
            <BreadcrumbItem key={index}>{item}</BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
      <div className="flex items-center space-x-2">
        <CustomSearchBar />
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
        <RotateCcwIcon
          className={`w-6 h-6 cursor-pointer ${spinning ? "animate-spin" : ""}`}
          onClick={handleClick}
        />
        <Bell className="w-6 h-6"
          onClick={notifications}
        />
      </div>
    </div>
  );
};

export default NavbarSection;
