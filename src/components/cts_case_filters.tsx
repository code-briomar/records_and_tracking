import {
  addToast,
  Button,
  Chip,
  DateValue,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  RangeValue,
  Selection,
  SortDescriptor,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  useDisclosure,
  User,
} from "@heroui/react";
import { saveAs } from "file-saver";
import { Check, FilterIcon } from "lucide-react";
import React, { SVGProps, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { deleteFile, File, getAllFiles, restoreFile } from "../services/files";
import AddNewCaseFileForm from "./add_new_case_file_form";
import ControlledRangeDatePicker from "./controlled_range_date_picker";
import DeleteCaseFileModal from "./delete_case_file_form";
import EditCaseFileForm from "./edit _case_file_form";
import { staff } from "./staff_data";
import ViewCaseFileModal from "./view_case_file_modal";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "CASE NUMBER", uid: "case_number", sortable: true },
  { name: "TYPE", uid: "case_type", sortable: true },
  { name: "PURPOSE", uid: "purpose", sortable: true },
  //{ name: "STATUS", uid: "status", sortable: true }, // Assuming status is part of the case table
  { name: "UPLOADED BY", uid: "uploaded_by", sortable: true },
  { name: "NOTES", uid: "notes" },
  { name: "DATE RECEIVED", uid: "date_recieved", sortable: true },
  { name: "DUE", uid: "required_on", sortable: true },
  // {name: "STATUS",uid:"status",sortable:true},
  { name: "DATE RETURNED", uid: "date_returned", sortable: true },
  { name: "", uid: "#" },
  { name: "⚙️", uid: "actions" },
];

export const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
];

export const caseStatusOptions = [
  { name: "Open", uid: "open" },
  { name: "Closed", uid: "closed" },
  { name: "Pending", uid: "pending" },
];

export const caseTypeOptions = [
  { name: "Civil", uid: "civil" },
  { name: "Criminal", uid: "criminal" },
];

export const purposeOptions = [
  { name: "Judgement", uid: "judgement" },
  { name: "Ruling", uid: "ruling" },
  { name: "Review", uid: "review" },
  { name: "Appeal", uid: "appeal" },
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const PlusIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

export const VerticalDotsIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SearchIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

export const ChevronDownIcon = ({
  strokeWidth = 1.5,
  ...otherProps
}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

const INITIAL_VISIBLE_COLUMNS = [
  "case_number",
  "case_type",
  "purpose",
  "required_on",
  "notes",
  "#",
  "actions",
];

const getDateRanges = () => {
  const today = new Date();
  const day = today.getDay(); // Sunday = 0

  // Adjust so Monday = 0
  const mondayOffset = (day + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  const getRange = (offset: number) => {
    const start = new Date(monday);
    const end = new Date(monday);
    start.setDate(start.getDate() + offset);
    end.setDate(end.getDate() + offset + 4);
    return { start, end };
  };

  return {
    lastWeek: getRange(-7),
    thisWeek: getRange(0),
    nextWeek: getRange(7),
  };
};

// const dateFilterOptions = [
//   { name: "All", uid: "all" },
//   { name: "Last Week", uid: "lastWeek" },
//   { name: "This Week", uid: "thisWeek" },
//   { name: "Next Week", uid: "nextWeek" },
// ];

export default function CaseFilters({
  caseFiles,
  setCaseFiles,
}: {
  caseFiles: File[];
  setCaseFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [file_id, setFileID] = React.useState<number>(0);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [dateFilter] = React.useState<string>("all");
  const [showOverdueOnly, setShowOverdueOnly] = React.useState(false);

  const dateRanges = getDateRanges();

  const { onOpen, isOpen, onOpenChange } = useDisclosure();

  const { isOpen: isOpenView, onOpenChange: onOpenChangeView } =
    useDisclosure();

  const { isOpen: isOpenEdit, onOpenChange: onOpenChangeEdit } =
    useDisclosure();

  const {
    onOpen: onOpenDelete,
    isOpen: isOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();

  const [visibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter] = React.useState<Selection>("all");
  const [caseTypeFilter, setCaseTypeFilter] = React.useState<Selection>("all");
  const [purposeFilter, setPurposeFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "required_on",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [selectedTab, setSelectedTab] = React.useState("cases");

  // Filter By Date
  const [dateSearchValue, setDateSearchValue] =
    React.useState<RangeValue<DateValue> | null>(null);

  const handleDateRangeChange = (newValue: RangeValue<DateValue> | null) => {
    setDateSearchValue(newValue);
    if (!newValue) {
      // If user clears date picker, optionally reset pagination, filters, etc.
      setPage(1);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCases = caseFiles.filter((file) => {
    const requiredDate = new Date(file.required_on);
    requiredDate.setHours(0, 0, 0, 0);
    return !file.deleted && requiredDate < today && !file.date_returned;
  });

  const pages = Math.ceil(caseFiles.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCaseFiles = [...caseFiles] as File[];

    console.log(
      "🔍 Filter Debug - Starting with:",
      filteredCaseFiles.length,
      "files"
    );
    console.log(
      "🔍 Case Type Filter:",
      caseTypeFilter,
      "Type:",
      typeof caseTypeFilter
    );
    console.log(
      "🔍 Purpose Filter:",
      purposeFilter,
      "Type:",
      typeof purposeFilter
    );

    // Exclude deleted files
    filteredCaseFiles = filteredCaseFiles.filter((file) => !file.deleted);
    console.log(
      "🔍 After excluding deleted:",
      filteredCaseFiles.length,
      "files"
    );

    if (showOverdueOnly) {
      filteredCaseFiles = filteredCaseFiles.filter((file) => {
        const requiredDate = new Date(file.required_on);
        requiredDate.setHours(0, 0, 0, 0);
        return requiredDate < today && !file.date_returned;
      });
      console.log(
        "🔍 After overdue filter:",
        filteredCaseFiles.length,
        "files"
      );
    }

    if (hasSearchFilter) {
      filteredCaseFiles = filteredCaseFiles.filter((file) =>
        file.case_number.toLowerCase().includes(filterValue.toLowerCase())
      );
      console.log("🔍 After search filter:", filteredCaseFiles.length, "files");
    }

    // Case type filtering - fixed logic
    const shouldApplyCaseTypeFilter =
      caseTypeFilter !== "all" &&
      caseTypeFilter instanceof Set &&
      caseTypeFilter.size > 0 &&
      caseTypeFilter.size !== caseTypeOptions.length;

    console.log("🔍 Should apply case type filter:", shouldApplyCaseTypeFilter);

    if (shouldApplyCaseTypeFilter) {
      const caseTypeArray = Array.from(caseTypeFilter as Set<string>);
      console.log("🔍 Filtering by case types:", caseTypeArray);
      filteredCaseFiles = filteredCaseFiles.filter((file) =>
        caseTypeArray.includes(file.case_type.toLowerCase())
      );
      console.log(
        "🔍 After case type filter:",
        filteredCaseFiles.length,
        "files"
      );
    }

    // Purpose filtering - fixed logic
    const shouldApplyPurposeFilter =
      purposeFilter !== "all" &&
      purposeFilter instanceof Set &&
      purposeFilter.size > 0 &&
      purposeFilter.size !== purposeOptions.length;

    console.log("🔍 Should apply purpose filter:", shouldApplyPurposeFilter);

    if (shouldApplyPurposeFilter) {
      const purposeArray = Array.from(purposeFilter as Set<string>);
      console.log("🔍 Filtering by purposes:", purposeArray);
      filteredCaseFiles = filteredCaseFiles.filter((file) =>
        purposeArray.includes(file.purpose.toLowerCase())
      );
      console.log(
        "🔍 After purpose filter:",
        filteredCaseFiles.length,
        "files"
      );
    }

    // Date filtering logic
    if (dateFilter !== "all") {
      const range = dateRanges[dateFilter as keyof typeof dateRanges];

      if (range) {
        filteredCaseFiles = filteredCaseFiles.filter((file) => {
          const reqDate = new Date(file.required_on);
          return reqDate >= range.start && reqDate <= range.end;
        });
      }
    }

    if (dateSearchValue && dateSearchValue.start && dateSearchValue.end) {
      const startDate = new Date(dateSearchValue.start.toString());
      const endDate = new Date(dateSearchValue.end.toString());

      filteredCaseFiles = filteredCaseFiles.filter((file) => {
        const fileDate = new Date(file.required_on);
        return fileDate >= startDate && fileDate <= endDate;
      });
      console.log(
        "🔍 After date range filter:",
        filteredCaseFiles.length,
        "files"
      );
    }

    console.log("🔍 Final filtered result:", filteredCaseFiles.length, "files");
    return filteredCaseFiles;
  }, [
    caseFiles,
    filterValue,
    dateFilter,
    dateSearchValue,
    showOverdueOnly,
    caseTypeFilter,
    purposeFilter,
  ]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: File, b: File) => {
      const first = a[sortDescriptor.column as keyof File];
      const second = b[sortDescriptor.column as keyof File];

      let cmp = 0;

      if (typeof first === "number" && typeof second === "number") {
        cmp = first - second;
      } else if (typeof first === "string" && typeof second === "string") {
        cmp = first.localeCompare(second);
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((file: File, columnKey: React.Key) => {
    const cellValue = file[columnKey as keyof File];

    switch (columnKey) {
      case "case_number":
        const isOverdue = (() => {
          const requiredDate = new Date(file.required_on);
          requiredDate.setHours(0, 0, 0, 0);
          return requiredDate < today && !file.date_returned;
        })();
        return (
          <p
            className={`text-bold text-small ${
              isOverdue ? "bg-red-100 text-red-700 px-2 rounded" : ""
            }`}
          >
            {file?.case_number}
            {isOverdue && (
              <span title="Overdue" className="ml-1">
                ⚠️
              </span>
            )}
          </p>
        );

      case "case_type":
        return (
          <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={
              file.case_type === "Civil"
                ? "default"
                : file.case_type === "Criminal"
                ? "warning"
                : "default"
            }
            size="sm"
            variant="flat"
          >
            {file.case_type === "Civil"
              ? "⚖️ Civil"
              : file.case_type === "Criminal"
              ? "🚨 Criminal"
              : file.case_type}
          </Chip>
        );

      case "purpose":
        return (
          <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={
              file.purpose === "Judgement"
                ? "primary"
                : file.purpose === "Ruling"
                ? "success"
                : "warning"
            }
            size="sm"
            variant="dot"
          >
            {file.purpose}
          </Chip>
        );

      case "uploaded_by":
        const uploader = staff.find((u) => u.user_id === file.uploaded_by);
        return (
          <User
            avatarProps={{
              radius: "full",
              size: "sm",
              src:
                uploader?.avatar ||
                `https://i.pravatar.cc/150?u=${file.uploaded_by}`,
            }}
            classNames={{
              description: "text-default-500",
            }}
            description={
              uploader?.email || `user${file.uploaded_by}@example.com`
            }
            name={uploader?.name || `User #${file.uploaded_by}`}
          >
            {uploader?.email || `user${file.uploaded_by}@example.com`}
          </User>
        );

      case "current_location":
        return <span>{file.current_location}</span>;

      case "notes":
        return <span className="text-base text-default-600">{file.notes}</span>;

      case "date_recieved":
        return (
          <span className="text-xs font-semibold">
            {new Date(file.date_recieved).toLocaleString("en-US")}
          </span>
        );

      case "required_on":
        const requiredDate = new Date(file.required_on);
        return (
          <span className="text-sm font-semibold">
            {requiredDate.toLocaleDateString("en-UK", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </span>
        );

      case "required_on_signature":
        return <span>{file.required_on_signature}</span>;

      case "date_returned":
        return (
          <span className="text-xs font-semibold">
            {file.date_returned
              ? new Date(file.date_returned).toLocaleString("en-US")
              : "Pending"}
          </span>
        );

      case "date_returned_signature":
        return <span>{file.date_returned_signature || "—"}</span>;

      case "#":
        return (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={async () => {
              // Soft delete the file
              const result = await deleteFile(file.file_id);
              if (result) {
                // Update the caseFiles state to remove the deleted file
                setCaseFiles((prevFiles) =>
                  prevFiles.filter((f) => f.file_id !== file.file_id)
                );
              }

              // Optionally, you can show a success message or perform other actions
              addToast({
                title: "File Closed",
                description: `${file.case_number} has been closed.`,
                endContent: (
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={async () => {
                      const response = await restoreFile(file.file_id);
                      if (response) {
                        // Update the caseFiles state to restore the file
                        const caseFiles = await getAllFiles();

                        setCaseFiles(caseFiles);
                      }

                      addToast({
                        title: "File Restored",
                        description: `${file.case_number} has been restored.`,
                        endContent: null,
                      });
                    }}
                  >
                    Undo
                  </Button>
                ),
              });
            }}
          >
            <Check className="w-4 h-4 text-lime-500" />
          </Button>
        );

      case "actions":
        const launchViewModal = () => {
          setFileID(file.file_id);
          onOpenChangeView();
        };

        const launchEditModal = () => {
          setFileID(file.file_id);

          setTimeout(() => {
            onOpenChangeEdit();
          }, 0);
        };

        const launchDeleteModal = () => {
          setFileID(file.file_id);
          onOpenDelete();
        };

        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view" onPress={launchViewModal}>
                  View
                </DropdownItem>
                <DropdownItem key="edit" onPress={launchEditModal}>
                  Edit
                </DropdownItem>
                <DropdownItem key="delete" onPress={launchDeleteModal}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        {/* Main Search and Filter Controls */}
        <div className="flex justify-between gap-3 items-center">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1 py-[26px]",
            }}
            placeholder="Search by Case No..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-2 items-center">
            <ControlledRangeDatePicker
              value={dateSearchValue}
              setValue={handleDateRangeChange}
            />

            <Button
              className={
                showOverdueOnly
                  ? "bg-danger text-background"
                  : "bg-foreground text-background"
              }
              size="sm"
              variant="flat"
              onPress={() => setShowOverdueOnly((v) => !v)}
            >
              {showOverdueOnly ? "Show All" : "Overdue Only"}
            </Button>
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
              onPress={onOpen}
            >
              Add New
            </Button>
          </div>
        </div>

        {/* Clean Status Bar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-default-400 text-small">
              Showing {filteredItems.length} of {caseFiles.length} cases
            </span>

            {overdueCases.length > 0 && (
              <Chip
                className="capitalize border-none gap-1 text-danger-600"
                size="sm"
                variant="flat"
                color="danger"
              >
                {overdueCases.length} Overdue
              </Chip>
            )}

            <div className="flex gap-2 items-center text-default-400 text-small">
              <span>This week:</span>
              <span className="font-semibold">
                {
                  caseFiles.filter((eachCase) => {
                    const requiredDate = new Date(eachCase.required_on);
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

                    requiredDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    startOfWeek.setHours(0, 0, 0, 0);

                    return requiredDate >= startOfWeek && requiredDate <= today;
                  }).length
                }{" "}
                cases
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Rows per page selector */}
            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-none text-default-400 text-small ml-2"
                onChange={onRowsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </label>

            {/* Advanced Filters Dropdown */}
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  <FilterIcon className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Advanced Filters"
                closeOnSelect={false}
              >
                {[
                  <DropdownItem key="type" isReadOnly>
                    <div className="font-semibold">Case Type</div>
                  </DropdownItem>,
                  ...caseTypeOptions.map((type) => (
                    <DropdownItem
                      key={type.uid}
                      className="capitalize pl-6"
                      onPress={() => {
                        console.log(
                          "🔧 Case Type Filter - Before:",
                          caseTypeFilter
                        );

                        // Handle the case where filter is "all" vs Set
                        const currentFilter =
                          caseTypeFilter === "all"
                            ? new Set<string>()
                            : new Set<string>(caseTypeFilter as Set<string>);
                        console.log("🔧 Current filter as Set:", currentFilter);

                        if (currentFilter.has(type.uid)) {
                          currentFilter.delete(type.uid);
                          console.log("🔧 Removed:", type.uid);
                        } else {
                          currentFilter.add(type.uid);
                          console.log("🔧 Added:", type.uid);
                        }
                        console.log("🔧 New filter size:", currentFilter.size);

                        // Automatically reset to "all" when no items selected
                        const finalFilter: Selection =
                          currentFilter.size === 0 ? "all" : currentFilter;
                        console.log("🔧 Final filter:", finalFilter);
                        setCaseTypeFilter(finalFilter);
                      }}
                    >
                      {caseTypeFilter === "all" ||
                      !Array.from(caseTypeFilter as Set<string>).includes(
                        type.uid
                      )
                        ? ""
                        : "✓ "}
                      {capitalize(type.name)}
                    </DropdownItem>
                  )),
                  <DropdownItem key="purpose" isReadOnly>
                    <div className="font-semibold">Purpose</div>
                  </DropdownItem>,
                  ...purposeOptions.map((purpose) => (
                    <DropdownItem
                      key={purpose.uid}
                      className="capitalize pl-6"
                      onPress={() => {
                        console.log(
                          "🔧 Purpose Filter - Before:",
                          purposeFilter
                        );

                        // Handle the case where filter is "all" vs Set
                        const currentFilter =
                          purposeFilter === "all"
                            ? new Set<string>()
                            : new Set<string>(purposeFilter as Set<string>);
                        console.log("🔧 Current filter as Set:", currentFilter);

                        if (currentFilter.has(purpose.uid)) {
                          currentFilter.delete(purpose.uid);
                          console.log("🔧 Removed:", purpose.uid);
                        } else {
                          currentFilter.add(purpose.uid);
                          console.log("🔧 Added:", purpose.uid);
                        }
                        console.log("🔧 New filter size:", currentFilter.size);

                        // Automatically reset to "all" when no items selected
                        const finalFilter: Selection =
                          currentFilter.size === 0 ? "all" : currentFilter;
                        console.log("🔧 Final filter:", finalFilter);
                        setPurposeFilter(finalFilter);
                      }}
                    >
                      {purposeFilter === "all" ||
                      !Array.from(purposeFilter as Set<string>).includes(
                        purpose.uid
                      )
                        ? ""
                        : "✓ "}
                      {capitalize(purpose.name)}
                    </DropdownItem>
                  )),
                ]}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    caseFiles.length,
    hasSearchFilter,
    overdueCases.length,
    showOverdueOnly,
    caseTypeFilter,
    purposeFilter,
    filteredItems.length,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        // changing the rows border radius
        // first
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        // middle
        "group-data-[middle=true]/tr:before:rounded-none",
        // last
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    []
  );

  // Bulk selection state
  const [selectedBulk, setSelectedBulk] = useState<Set<number>>(new Set());
  const [, setSelectAll] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    total: 0,
    overdue: 0,
    closed: 0,
    avgProcessing: 0,
    byType: { Civil: 0, Criminal: 0 },
    byPurpose: {},
    byUploader: {},
    weekly: [] as { week: string; count: number }[],
    monthly: [] as { month: string; count: number }[],
    overdueTrend: [] as { week: string; count: number }[],
  });

  // --- Custom Views State ---
  const [customViews, setCustomViews] = useState(() => {
    // Load from localStorage or start with empty
    try {
      return JSON.parse(localStorage.getItem("customViews") || "[]");
    } catch {
      return [];
    }
  });
  const [newViewName, setNewViewName] = useState("");
  const [pinnedAnalytics, setPinnedAnalytics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pinnedAnalytics") || "[]");
    } catch {
      return [];
    }
  });

  // Save custom views and pins to localStorage
  useEffect(() => {
    localStorage.setItem("customViews", JSON.stringify(customViews));
  }, [customViews]);
  useEffect(() => {
    localStorage.setItem("pinnedAnalytics", JSON.stringify(pinnedAnalytics));
  }, [pinnedAnalytics]);

  // Save current filter as a custom view
  const saveCurrentView = () => {
    if (!newViewName.trim()) return;
    setCustomViews((prev: any) => [
      ...prev,
      {
        name: newViewName,
        filterValue,
        showOverdueOnly,
        visibleColumns: Array.from(visibleColumns),
        sortDescriptor,
        rowsPerPage,
      },
    ]);
    setNewViewName("");
  };

  // Apply a saved view
  const applyCustomView = (view: any) => {
    setFilterValue(view.filterValue);
    setShowOverdueOnly(view.showOverdueOnly);
    // setVisibleColumns(new Set(view.visibleColumns)); // Uncomment if you allow column selection
    setSortDescriptor(view.sortDescriptor);
    setRowsPerPage(view.rowsPerPage);
  };

  // Remove a saved view
  const removeCustomView = (idx: number) => {
    setCustomViews((prev: any) => prev.filter((_: any, i: any) => i !== idx));
  };

  // Pin/unpin analytics widgets
  const analyticsOptions = [
    { key: "weekly", label: "Cases Created Per Week" },
    { key: "monthly", label: "Cases Created Per Month" },
    { key: "byPurpose", label: "Cases by Purpose" },
    { key: "byUploader", label: "Cases by Uploader" },
    { key: "overdueTrend", label: "Overdue Cases Per Week" },
  ];
  const togglePin = (key: string) => {
    setPinnedAnalytics((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Calculate analytics
  useEffect(() => {
    const total = caseFiles.length;
    const overdue = overdueCases.length;
    const closed = caseFiles.filter((f) => !!f.date_returned).length;
    const processingTimes = caseFiles
      .filter((f) => f.date_returned)
      .map((f) => {
        const start = new Date(f.date_recieved).getTime();
        const end = f.date_returned
          ? new Date(f.date_returned).getTime()
          : start;
        return (end - start) / (1000 * 60 * 60 * 24);
      });
    const avgProcessing =
      processingTimes.length > 0
        ? Math.round(
            processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
          )
        : 0;
    const byType = { Civil: 0, Criminal: 0 };
    const byPurpose: Record<string, number> = {};
    const byUploader: Record<string, number> = {};
    caseFiles.forEach((f) => {
      if (f.case_type === "Civil") byType.Civil++;
      if (f.case_type === "Criminal") byType.Criminal++;
      byPurpose[f.purpose] = (byPurpose[f.purpose] || 0) + 1;
      byUploader[f.uploaded_by] = (byUploader[f.uploaded_by] || 0) + 1;
    });
    // Weekly stats (by required_on week)
    const weekMap: Record<string, number> = {};
    const overdueTrendMap: Record<string, number> = {};
    caseFiles.forEach((f) => {
      const d = new Date(f.required_on);
      const week = `${d.getFullYear()}-W${Math.ceil(
        (d.getDate() + 6 - d.getDay()) / 7
      )}`;
      weekMap[week] = (weekMap[week] || 0) + 1;
      // Overdue trend
      if (!f.date_returned && new Date(f.required_on) < today) {
        overdueTrendMap[week] = (overdueTrendMap[week] || 0) + 1;
      }
    });
    const weekly = Object.entries(weekMap).map(([week, count]) => ({
      week,
      count,
    }));
    const overdueTrend = Object.entries(overdueTrendMap).map(
      ([week, count]) => ({
        week,
        count,
      })
    );
    // Monthly stats
    const monthMap: Record<string, number> = {};
    caseFiles.forEach((f) => {
      const d = new Date(f.required_on);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthly = Object.entries(monthMap).map(([month, count]) => ({
      month,
      count,
    }));
    setAnalytics({
      total,
      overdue,
      closed,
      avgProcessing,
      byType,
      byPurpose,
      byUploader,
      weekly,
      monthly,
      overdueTrend,
    });
  }, [caseFiles, overdueCases.length]);

  // Bulk actions handlers
  const handleBulkClose = () => {
    // Example: mark all selected as closed (simulate)
    setCaseFiles((prev) =>
      prev.map((f) =>
        selectedBulk.has(f.file_id)
          ? { ...f, date_returned: new Date().toISOString() }
          : f
      )
    );
    setSelectedBulk(new Set());
    setSelectAll(false);
  };
  const handleBulkExport = () => {
    // Simple CSV export
    const rows = filteredItems.filter((f) => selectedBulk.has(f.file_id));
    const csv = [Object.keys(rows[0] || {}).join(",")]
      .concat(rows.map((f) => Object.values(f).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cases_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Analytics panel (above table)
  const analyticsPanel = (
    <div className="flex flex-col gap-6 mb-4 p-4 rounded shadow transition-colors duration-300 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white">
      <div className="flex flex-wrap gap-4">
        <div>
          <span className="font-semibold">Total Cases:</span>{" "}
          <b>{analytics.total}</b>
        </div>
        <div>
          <span className="font-semibold">Overdue Cases:</span>{" "}
          <b className="text-danger-600">{analytics.overdue}</b>
        </div>
        <div>
          <span className="font-semibold">Closed Cases:</span>{" "}
          <b>{analytics.closed}</b>
        </div>
        <div>
          <span className="font-semibold">Average Processing Time (days):</span>{" "}
          <b>{analytics.avgProcessing}</b>
        </div>
        <div>
          <span className="font-semibold">Civil Cases:</span>{" "}
          <b>{analytics.byType.Civil}</b>
        </div>
        <div>
          <span className="font-semibold">Criminal Cases:</span>{" "}
          <b>{analytics.byType.Criminal}</b>
        </div>
      </div>
      <div className="flex flex-wrap gap-8">
        <div className="w-80 h-48">
          <div className="mb-2 font-semibold text-center">
            Cases Created Per Week
          </div>
          <Bar
            data={{
              labels: analytics.weekly.map((w) => w.week),
              datasets: [
                {
                  label: "Cases/Week",
                  data: analytics.weekly.map((w) => w.count),
                  backgroundColor: "#6366f1",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="w-80 h-48">
          <div className="mb-2 font-semibold text-center">
            Cases Created Per Month
          </div>
          <Bar
            data={{
              labels: analytics.monthly.map((m) => m.month),
              datasets: [
                {
                  label: "Cases/Month",
                  data: analytics.monthly.map((m) => m.count),
                  backgroundColor: "#f59e42",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="w-80 h-48">
          <div className="mb-2 font-semibold text-center">Cases by Purpose</div>
          <Bar
            data={{
              labels: Object.keys(analytics.byPurpose),
              datasets: [
                {
                  label: "Cases by Purpose",
                  data: Object.values(analytics.byPurpose),
                  backgroundColor: "#10b981",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="w-80 h-48">
          <div className="mb-2 font-semibold text-center">
            Cases by Uploader
          </div>
          <Bar
            data={{
              labels: Object.keys(analytics.byUploader),
              datasets: [
                {
                  label: "Cases by Uploader",
                  data: Object.values(analytics.byUploader),
                  backgroundColor: "#e11d48",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="w-80 h-48">
          <div className="mb-2 font-semibold text-center">
            Overdue Cases Per Week
          </div>
          <Bar
            data={{
              labels: analytics.overdueTrend.map((w) => w.week),
              datasets: [
                {
                  label: "Overdue/Week",
                  data: analytics.overdueTrend.map((w) => w.count),
                  backgroundColor: "#f43f5e",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );

  // Bulk actions bar (above table)
  const bulkBar = React.useMemo(
    () =>
      selectedBulk.size > 0 && (
        <div className="flex gap-2 mb-2 p-2 bg-blue-50 rounded items-center">
          <span>{selectedBulk.size} selected</span>
          <Button size="sm" color="danger" onPress={handleBulkClose}>
            Close
          </Button>
          <Button size="sm" color="primary" onPress={handleBulkExport}>
            Export
          </Button>
          {/* Add more bulk actions as needed */}
        </div>
      ),
    [selectedBulk, handleBulkClose, handleBulkExport]
  );

  return (
    <>
      <Tabs
        aria-label="Case Tracking Tabs"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(String(key))}
        fullWidth
        size="lg"
        className="mb-6"
      >
        <Tab key="cases" title="Cases Table">
          {bulkBar}
          <Table
            isCompact
            isStriped
            removeWrapper
            aria-label="Case Table"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            checkboxesProps={{
              classNames: {
                wrapper:
                  "after:bg-foreground after:text-background text-background",
              },
            }}
            classNames={classNames}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={"sortable" in column ? column.sortable : false}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={"No case files found"} items={sortedItems}>
              {(item) => (
                <TableRow key={item.file_id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>
        <Tab key="insights" title="Case Insights">
          {analyticsPanel}
        </Tab>
        <Tab key="custom" title="Custom Views">
          <div className="p-4 flex flex-col gap-6">
            <div className="mb-4">
              <div className="font-bold mb-2">Save Current Table View</div>
              <div className="flex gap-2 items-center">
                <Input
                  size="sm"
                  placeholder="View name..."
                  value={newViewName}
                  onValueChange={setNewViewName}
                />
                <Button size="sm" onPress={saveCurrentView}>
                  Save View
                </Button>
              </div>
              <div className="mt-2">
                {customViews.length === 0 && (
                  <span className="text-default-400">No saved views yet.</span>
                )}
                {customViews.map((view: any, idx: any) => (
                  <div key={idx} className="flex gap-2 items-center mt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => applyCustomView(view)}
                    >
                      {view.name}
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => removeCustomView(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">Pin Analytics Widgets</div>
              <div className="flex flex-wrap gap-2">
                {analyticsOptions.map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={
                      pinnedAnalytics.includes(opt.key) ? "solid" : "flat"
                    }
                    onPress={() => togglePin(opt.key)}
                  >
                    {pinnedAnalytics.includes(opt.key) ? "Unpin" : "Pin"}{" "}
                    {opt.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-8 mt-4">
                {pinnedAnalytics.includes("weekly") && (
                  <div className="w-80 h-48">
                    <div className="mb-2 font-semibold text-center">
                      Cases Created Per Week
                    </div>
                    <Bar
                      data={{
                        labels: analytics.weekly.map((w) => w.week),
                        datasets: [
                          {
                            label: "Cases/Week",
                            data: analytics.weekly.map((w) => w.count),
                            backgroundColor: "#6366f1",
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                )}
                {pinnedAnalytics.includes("monthly") && (
                  <div className="w-80 h-48">
                    <div className="mb-2 font-semibold text-center">
                      Cases Created Per Month
                    </div>
                    <Bar
                      data={{
                        labels: analytics.monthly.map((m) => m.month),
                        datasets: [
                          {
                            label: "Cases/Month",
                            data: analytics.monthly.map((m) => m.count),
                            backgroundColor: "#f59e42",
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                )}
                {pinnedAnalytics.includes("byPurpose") && (
                  <div className="w-80 h-48">
                    <div className="mb-2 font-semibold text-center">
                      Cases by Purpose
                    </div>
                    <Bar
                      data={{
                        labels: Object.keys(analytics.byPurpose),
                        datasets: [
                          {
                            label: "Cases by Purpose",
                            data: Object.values(analytics.byPurpose),
                            backgroundColor: "#10b981",
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                )}
                {pinnedAnalytics.includes("byUploader") && (
                  <div className="w-80 h-48">
                    <div className="mb-2 font-semibold text-center">
                      Cases by Uploader
                    </div>
                    <Bar
                      data={{
                        labels: Object.keys(analytics.byUploader),
                        datasets: [
                          {
                            label: "Cases by Uploader",
                            data: Object.values(analytics.byUploader),
                            backgroundColor: "#e11d48",
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                )}
                {pinnedAnalytics.includes("overdueTrend") && (
                  <div className="w-80 h-48">
                    <div className="mb-2 font-semibold text-center">
                      Overdue Cases Per Week
                    </div>
                    <Bar
                      data={{
                        labels: analytics.overdueTrend.map((w) => w.week),
                        datasets: [
                          {
                            label: "Overdue/Week",
                            data: analytics.overdueTrend.map((w) => w.count),
                            backgroundColor: "#f43f5e",
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tab>
        <Tab key="integrations" title="Integrations">
          <div className="p-4 flex flex-col gap-6">
            <div className="font-bold mb-2">Calendar Integration</div>
            <div className="mb-4">
              <Button
                size="sm"
                onPress={() => {
                  // Export all upcoming case deadlines to .ics (iCalendar) file
                  const events = caseFiles
                    .filter((f) => !f.deleted && f.required_on)
                    .map((f) => {
                      const start = new Date(f.required_on);
                      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour event
                      return `BEGIN:VEVENT\nSUMMARY:Case ${
                        f.case_number
                      } Due\nDESCRIPTION:${f.purpose || ""}\nDTSTART:${start
                        .toISOString()
                        .replace(/[-:]/g, "")
                        .replace(/\.\d+Z$/, "Z")
                        .replace("T", "T")
                        .slice(0, 15)}\nDTEND:${end
                        .toISOString()
                        .replace(/[-:]/g, "")
                        .replace(/\.\d+Z$/, "Z")
                        .replace("T", "T")
                        .slice(0, 15)}\nEND:VEVENT`;
                    })
                    .join("\n");
                  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\n${events}\nEND:VCALENDAR`;
                  const blob = new Blob([ics], { type: "text/calendar" });
                  saveAs(blob, "case_deadlines.ics");
                }}
              >
                Export All Deadlines to Calendar (.ics)
              </Button>
              <div className="text-default-400 mt-2">
                Download and import into Google Calendar, Outlook, or any
                calendar app.
              </div>
            </div>
            <div className="font-bold mb-2">Communication Integration</div>
            <div className="mb-4">
              <Button
                size="sm"
                onPress={() => {
                  const mailto = `mailto:?subject=Case%20Deadlines&body=${encodeURIComponent(
                    caseFiles
                      .filter((f) => !f.deleted)
                      .map((f) => `Case ${f.case_number}: Due ${f.required_on}`)
                      .join("\n")
                  )}`;
                  window.open(mailto, "_blank");
                }}
              >
                Email All Deadlines
              </Button>
              <div className="text-default-400 mt-2">
                Send a summary of all deadlines to your email client.
              </div>
            </div>
            <div className="font-bold mb-2">Webhooks (Advanced)</div>
            <div className="mb-4">
              <div className="text-default-400">
                (Coming soon) Notify Slack, Teams, or custom endpoints when a
                case is updated.
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>

      <ViewCaseFileModal
        file_id={file_id}
        isOpen={isOpenView}
        onOpenChange={onOpenChangeView}
      />

      <AddNewCaseFileForm
        isOpen={isOpen}
        setCaseFiles={setCaseFiles}
        onOpenChange={onOpenChange}
      />

      <EditCaseFileForm
        file_id={file_id}
        isOpen={isOpenEdit}
        caseFiles={caseFiles}
        setCaseFiles={setCaseFiles}
        onOpenChange={onOpenChangeEdit}
        onOpen={onOpen}
      />

      <DeleteCaseFileModal
        file_id={file_id}
        caseFiles={caseFiles}
        setCaseFiles={setCaseFiles}
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
      />
    </>
  );
}
