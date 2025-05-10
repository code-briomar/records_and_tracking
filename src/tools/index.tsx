import { Button, Card, CardBody, Tab, Tabs } from "@heroui/react";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import React from "react";
import { utils, writeFile } from "xlsx-js-style";
import { fileSectionData } from "../components/files_data";
import { notifications } from "../components/notifications_data";
import { staff } from "../components/staff_data";
import { useAuth } from "../context/auth_context";

const ExportExcelTool = () => {
  const [tableToExport, setTableToExport] = React.useState("cases");
  const exportToExcel = () => {
    let data = [];

    switch (tableToExport) {
      case "cases":
        data = fileSectionData;
        break;

      case "staff":
        data = staff;
        break;

      case "audit logs":
        data = notifications;
        break;

      default:
        data = fileSectionData;
        break;
    }

    const worksheet = utils.json_to_sheet([]);

    let Heading = undefined;
    switch (tableToExport) {
      case "cases":
        Heading = [
          [
            "#",
            "Case Number",
            "Purpose",
            "Uploaded By",
            "Current Location",
            "Notes",
            "Date Received",
            "Required On",
          ],
        ];
        break;

      case "staff":
        Heading = [["#", "Name", "Role", "Email", "Status", "Phone"]];
        break;

      case "audit logs":
        Heading = [["#", "Message", "Assigned To", "Date"]];
        break;

      default:
        Heading = [
          [
            "#",
            "Case Number",
            "Purpose",
            "Uploaded By",
            "Current Location",
            "Notes",
            "Date Received",
            "Required On",
          ],
        ];
        break;
    }

    // Add header row
    utils.sheet_add_aoa(worksheet, Heading);

    // Add data rows starting from A2
    utils.sheet_add_json(worksheet, data, {
      origin: "A2",
      skipHeader: true,
    });

    // Bold the header cells
    Heading[0].forEach((_, colIndex) => {
      const cellAddress = utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: {
          bold: true,
        },
      };
    });

    // Auto-width columns
    const columnWidths = Heading[0].map((header) => ({
      wch: header.length + 5, // adjust width based on header length
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Kilungu Law Courts - Cases");

    writeFile(workbook, "Kilungu-Law-Courts-Cases.xlsx");
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border dark:border-gray-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Export Kilungu Law Court's Data
      </h2>
      <p className="text-gray-600 mb-6 text-sm">
        Select the type of data you want to export as an Excel file.
      </p>

      <div className="mb-6">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className="w-full justify-between text-gray-700 dark:text-gray-200"
              endContent={<ChevronDown className="w-4 h-4" />}
            >
              {tableToExport.charAt(0).toUpperCase() + tableToExport.slice(1)}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Select table type"
            variant="faded"
            disallowEmptySelection
            selectionMode="single"
          >
            <DropdownItem key="cases" onPress={() => setTableToExport("cases")}>
              CTS
            </DropdownItem>
            <DropdownItem key="staff" onPress={() => setTableToExport("staff")}>
              Staff
            </DropdownItem>
            <DropdownItem
              key="audit_logs"
              onPress={() => setTableToExport("audit logs")}
            >
              Audit Logs
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Button
        onPress={exportToExcel}
        color="primary"
        className="w-full font-semibold"
        endContent={
          <img src="/icons/excel.png" alt="Excel Icon" className="w-4 h-4" />
        }
      >
        Export {tableToExport} to Excel
      </Button>
    </div>
  );
};

export default function Tools() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "Tools"];

  return (
    <>
      <Card
        isBlurred
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('light-bg.png')]  dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection breadcrumbs={breadcrumbs} />

            {/* Various Tools */}
            <Tabs
              aria-label="Options"
              placement={"start"}
              className="mx-4 mt-4"
            >
              <Tab
                key="export_to_excel"
                title="Export to Excel"
                className="w-full flex items-center justify-center"
              >
                <ExportExcelTool />
              </Tab>
            </Tabs>
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
