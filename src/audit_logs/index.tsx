import { Card, CardBody } from "@heroui/react";
import { BellRing } from "lucide-react";
import AuditLogsSection from "../components/audit_logs_section.tsx";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { useAuth } from "../context/auth_context.tsx";

export default function AuditLogs() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "Audit Logs"];
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
                <h2 className="text-2xl">Audit Logs</h2>
              </div>
              <div className="flex items-center space-x-2 m-2">
                <p>Monitor system activities.</p>
              </div>
              <AuditLogsSection />
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
