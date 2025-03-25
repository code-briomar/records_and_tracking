import { Card, CardBody } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { FilesProcessedChart } from "../components/files_processed_simple_chart";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { SummaryCards } from "../components/summary_cards";

export default function Dashboard() {
  return (
    <>
      <Card
        isBlurred
        className="h-full w-full border-none bg-background/60 dark:bg-default-100/50"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection />

            {/* Today's Summaries Section */}
            <div className="p-5">
              <div className="flex items-center">
                <h3 className="text-md">Today</h3>
                <ChevronDown className="w-4 h-4" />
              </div>
              <SummaryCards />
            </div>

            {/* Dashboard Charts */}
            <div className="flex items-center justify-center">
              <FilesProcessedChart />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div>
            <RightPanel />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
