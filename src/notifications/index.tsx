import { Card, CardBody } from "@heroui/react";
import { BellRing } from "lucide-react";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import NotificationsSection from "../components/notifications_section";
import RightPanel from "../components/right_panel";
import { useAuth } from "../context/auth_context";

export default function Notifications() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.name, "Notifications"];
  return (
    <>
      <Card
        isBlurred
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('public/light-bg.png')]  dark:bg-[url('public/dark-bg.png')] bg-no-repeat bg-cover"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection breadcrumbs={breadcrumbs} />

            {/* All Notifications */}
            <div className="p-2">
              <div className="flex items-center space-x-2 m-2">
                <BellRing className="text-[#F6AD2B] w-6 h-6" />
                <h2 className="text-2xl">All Notifications</h2>
              </div>
              <NotificationsSection />
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
