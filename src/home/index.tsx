import { Card, Input } from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className={"grid grid-cols-3 gap-4 h-screen overflow-hidden"}>
      <div className="col-span-1">
        <Card
          isBlurred
          className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('light-bg.png')]  dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
          shadow="sm"
        >
          <div className="flex items-center justify-center h-full">
            <h1 className="text-3xl font-bold">Welcome to the Home Page</h1>
          </div>
        </Card>
      </div>
      <div className="col-span-2">
        {/* Search Bar To Explore The News */}
        <div className="flex items-center justify-center h-[30px] m-2">
          <Input
            isClearable
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700 dark:placeholder:text-white/60",
                // Center the placeholder text
                "text-center",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-md",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            placeholder="Explore"
            radius="lg"
            startContent={
              // Center the icon
              <SearchIcon className="text-black mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
          />
        </div>

        {/* Explore Section */}
        <div className="flex items-center justify-center h-full">
          <h2 className="text-xl font-semibold">Explore Section</h2>
          <button
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => navigate("/explore")}
          >
            Go to Explore
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
