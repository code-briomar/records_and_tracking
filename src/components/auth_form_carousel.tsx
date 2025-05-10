import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthFormCarousel() {
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
    <div className="relative w-full flex flex-col items-center p-4 overflow-y-auto">
      <div className={"flex items-center justify-center space-x-2 mb-4"}>
        <h2 className="text-2xl font-semibold flex items-center space-x-4 justify-center">
          <img src={"./icons/balance.png"} className={"w-8 h-8"} />
          <span>Kilungu Law Courts</span>
        </h2>
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
      </div>
      <div className="flex flex-wrap justify-center">
        <div className="m-2" style={{ width: 186, height: 211 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/300/200"
              alt="Image 1"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 164, height: 195 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/400/300"
              alt="Image 2"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 162, height: 226 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/350/250"
              alt="Image 3"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 155, height: 155 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/500/400"
              alt="Image 4"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 243, height: 188 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/450/350"
              alt="Image 5"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 291, height: 189 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/320/240"
              alt="Image 6"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 220, height: 183 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/320/240"
              alt="Image 7"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>

        <div className="m-2" style={{ width: 253, height: 189 }}>
          <div className="flex flex-col relative text-foreground box-border bg-content1 outline-none shadow-lg rounded-lg overflow-hidden w-full h-full">
            <img
              src="https://picsum.photos/320/240"
              alt="Image 8"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
