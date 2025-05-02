import { Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";
import CaseFilters from "../components/cts_case_filters";
import { fetchFileData } from "../components/files_data";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { useAuth } from "../context/auth_context";
import { File } from "../services/files";

export default function CTS() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "CTS"];

  const [caseFiles, setCaseFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      const data: File[] = await fetchFileData();
      setCaseFiles(data);
    };
    loadFiles();
  }, []);

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
              <CaseFilters caseFiles={caseFiles} setCaseFiles={setCaseFiles} />
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
