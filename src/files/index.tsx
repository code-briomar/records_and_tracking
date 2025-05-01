import { Card, CardBody } from "@heroui/react";
import FileFilters from "../components/files_data_filters";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { useAuth } from "../context/auth_context";

export default function File() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "File Explorer"];
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

            {/* Case Files Tracking */}
            <div className="p-2">
              <FileFilters />
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
