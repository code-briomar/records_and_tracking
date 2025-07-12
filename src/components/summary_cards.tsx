import { Card, CardBody } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import React from "react";
import { staff } from "./staff_data.ts";

export const SummaryCards = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Simulate a brief refresh animation when component re-mounts
  React.useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => setIsRefreshing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-3 my-4 space-x-4">
      {/* Files Processed */}
      <Card
        className={`p-2 border dark:border-background/40 shadow-sm backdrop-blur-sm my-2 transition-all duration-300 ${
          isRefreshing ? "scale-105 shadow-lg" : ""
        }`}
      >
        <CardBody>
          <div className="">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-xl" id="primary-color">
                Files Processed
              </h1>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              )}
            </div>

            <div className="w-full flex items-center justify-between mt-4">
              <h1 className="uppercase font-semibold text-3xl mt-2 ">308</h1>
              <div className="text-right flex items-center mt-4">
                <span className="text-sm">+11.02%</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Absent Staff */}
      <Card
        className={`p-2 border dark:border-background/40 shadow-sm backdrop-blur-sm my-2 transition-all duration-300 ${
          isRefreshing ? "scale-105 shadow-lg" : ""
        }`}
      >
        <CardBody className="">
          <div className="">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-xl " id="primary-color">
                Absent Staff
              </h1>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              )}
            </div>

            <div className="w-full flex items-center justify-between mt-4">
              <h1 className="uppercase font-semibold text-3xl mt-2 ">
                {staff.filter((item) => item.status == "Absent").length}
              </h1>
              <div className="text-right flex items-center mt-4">
                <span className="text-sm">-5%</span>
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Upcoming Issues */}
      <Card
        className={`p-2 border dark:border-background/40 shadow-sm backdrop-blur-sm my-2 transition-all duration-300 ${
          isRefreshing ? "scale-105 shadow-lg" : ""
        }`}
      >
        <CardBody className="">
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-xl " id="primary-color">
              Upcoming Issues
            </h1>
            <HelpCircle className="w-4 h-4 " />
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-primary animate-spin ml-auto" />
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-4">
            <h1 className="uppercase font-semibold text-3xl mt-2 ">6</h1>
            <div className="text-right flex items-center mt-4">
              <span className="text-sm">-10%</span>
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
