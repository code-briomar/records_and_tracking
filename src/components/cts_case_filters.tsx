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
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Download,
  FileText,
  FilterIcon,
  FolderOpen,
  Gavel,
  Mail,
  MessageCircle,
  RotateCcw,
  Save,
  Scale,
  Settings,
  ShieldAlert,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { SVGProps, useEffect, useState } from "react";
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
  // Removed pinnedAnalytics since it's not used in the new implementation

  // Save custom views to localStorage
  useEffect(() => {
    localStorage.setItem("customViews", JSON.stringify(customViews));
  }, [customViews]);

  // Removed pinnedAnalytics localStorage sync since it's not used anymore

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

  // Pin/unpin analytics widgets - removed unused code
  // const analyticsOptions = [
  //   { key: "weekly", label: "Cases Created Per Week" },
  //   { key: "monthly", label: "Cases Created Per Month" },
  //   { key: "byPurpose", label: "Cases by Purpose" },
  //   { key: "byUploader", label: "Cases by Uploader" },
  //   { key: "overdueTrend", label: "Overdue Cases Per Week" },
  // ];
  // const togglePin = (key: string) => {
  //   setPinnedAnalytics((prev: string[]) =>
  //     prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
  //   );
  // };

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

  // Analytics panel removed - replaced with new insights tab
  // const analyticsPanel = (...)

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
          <div className="p-4 space-y-6">
            {/* Action Required Section */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Action Required
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.overdue}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Overdue Cases
                  </div>
                  {analytics.overdue > 0 && (
                    <Button
                      size="sm"
                      color="danger"
                      className="mt-2"
                      onPress={() => {
                        setShowOverdueOnly(true);
                        setSelectedTab("cases");
                      }}
                    >
                      View Overdue Cases
                    </Button>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      caseFiles.filter((f) => {
                        const dueDate = new Date(f.required_on);
                        const threeDaysFromNow = new Date();
                        threeDaysFromNow.setDate(
                          threeDaysFromNow.getDate() + 3
                        );
                        return (
                          dueDate <= threeDaysFromNow &&
                          dueDate > new Date() &&
                          !f.date_returned
                        );
                      }).length
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Due This Week
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    className="mt-2"
                    onPress={() => {
                      const threeDaysFromNow = new Date();
                      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                      setCaseTypeFilter("all");
                      setPurposeFilter("all");
                      setSelectedTab("cases");
                    }}
                  >
                    View This Week
                  </Button>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.avgProcessing}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Processing Days
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.total > 0
                      ? Math.round((analytics.closed / analytics.total) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.total - analytics.closed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Cases
                  </div>
                </div>
              </div>
            </div>

            {/* Workload Distribution */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Workload Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.byUploader).map(
                  ([uploader, count]) => (
                    <div
                      key={uploader}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded"
                    >
                      <span className="text-sm">User #{uploader}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                ((count as number) / analytics.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {count as number}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Case Type Breakdown */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Case Type Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Civil Cases</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analytics.byType.Civil}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (analytics.byType.Civil / analytics.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    className="mt-2"
                    onPress={() => {
                      setCaseTypeFilter(new Set(["civil"]));
                      setSelectedTab("cases");
                    }}
                  >
                    View Civil Cases
                  </Button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Criminal Cases</span>
                    <span className="text-lg font-bold text-red-600">
                      {analytics.byType.Criminal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (analytics.byType.Criminal / analytics.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    className="mt-2"
                    onPress={() => {
                      setCaseTypeFilter(new Set(["criminal"]));
                      setSelectedTab("cases");
                    }}
                  >
                    View Criminal Cases
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  color="primary"
                  onPress={() => {
                    const rows = caseFiles.filter((f) => !f.deleted);
                    const csv = [
                      "Case Number,Type,Purpose,Due Date,Status,Days Until Due",
                    ]
                      .concat(
                        rows.map((f) => {
                          const dueDate = new Date(f.required_on);
                          const today = new Date();
                          const daysUntilDue = Math.ceil(
                            (dueDate.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return `${f.case_number},${f.case_type},${
                            f.purpose
                          },${f.required_on},${
                            f.date_returned ? "Completed" : "Pending"
                          },${daysUntilDue}`;
                        })
                      )
                      .join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    saveAs(blob, "case_report.csv");
                  }}
                >
                  Export Report
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    setCaseTypeFilter("all");
                    setPurposeFilter("all");
                    setShowOverdueOnly(false);
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                >
                  Clear All Filters
                </Button>
                <Button color="warning" onPress={onOpen}>
                  Add New Case
                </Button>
              </div>
            </div>
          </div>
        </Tab>
        <Tab key="custom" title="Custom Views">
          <div className="p-4 space-y-6">
            {/* Preset Views */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Preset Views
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  variant="flat"
                  color="danger"
                  onPress={() => {
                    setShowOverdueOnly(true);
                    setCaseTypeFilter("all");
                    setPurposeFilter("all");
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Overdue Cases
                    </div>
                    <div className="text-xs opacity-75">
                      {analytics.overdue} cases
                    </div>
                  </div>
                </Button>
                <Button
                  variant="flat"
                  color="warning"
                  onPress={() => {
                    setShowOverdueOnly(false);
                    setCaseTypeFilter(new Set(["civil"]));
                    setPurposeFilter("all");
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Civil Cases
                    </div>
                    <div className="text-xs opacity-75">
                      {analytics.byType.Civil} cases
                    </div>
                  </div>
                </Button>
                <Button
                  variant="flat"
                  color="secondary"
                  onPress={() => {
                    setShowOverdueOnly(false);
                    setCaseTypeFilter(new Set(["criminal"]));
                    setPurposeFilter("all");
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Criminal Cases
                    </div>
                    <div className="text-xs opacity-75">
                      {analytics.byType.Criminal} cases
                    </div>
                  </div>
                </Button>
                <Button
                  variant="flat"
                  color="success"
                  onPress={() => {
                    setShowOverdueOnly(false);
                    setCaseTypeFilter("all");
                    setPurposeFilter(new Set(["judgement"]));
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Judgements
                    </div>
                    <div className="text-xs opacity-75">
                      {(analytics.byPurpose as Record<string, number>)
                        .judgement || 0}{" "}
                      cases
                    </div>
                  </div>
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => {
                    setShowOverdueOnly(false);
                    setCaseTypeFilter("all");
                    setPurposeFilter(new Set(["appeal"]));
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Appeals
                    </div>
                    <div className="text-xs opacity-75">
                      {(analytics.byPurpose as Record<string, number>).appeal ||
                        0}{" "}
                      cases
                    </div>
                  </div>
                </Button>
                <Button
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setShowOverdueOnly(false);
                    setCaseTypeFilter("all");
                    setPurposeFilter("all");
                    setFilterValue("");
                    setSelectedTab("cases");
                  }}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                    <div className="text-xs opacity-75">
                      {analytics.closed} cases
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Custom View Creator */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Current View
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <Input
                    size="sm"
                    placeholder="Enter view name (e.g., 'High Priority Cases')"
                    value={newViewName}
                    onValueChange={setNewViewName}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    color="success"
                    onPress={saveCurrentView}
                    isDisabled={!newViewName.trim()}
                  >
                    Save Current View
                  </Button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current filters:{" "}
                  {filterValue ? `Search: "${filterValue}"` : "No search"}, Case
                  Type:{" "}
                  {caseTypeFilter === "all"
                    ? "All"
                    : Array.from(caseTypeFilter as Set<string>).join(", ")}
                  , Purpose:{" "}
                  {purposeFilter === "all"
                    ? "All"
                    : Array.from(purposeFilter as Set<string>).join(", ")}
                  , {showOverdueOnly ? "Overdue Only" : "All Cases"}
                </div>
              </div>
            </div>

            {/* Saved Views */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Saved Views
              </h3>
              {customViews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No saved views yet</p>
                  <p className="text-sm">
                    Create custom views by saving your current filter settings
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customViews.map((view: any, idx: any) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{view.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {view.filterValue &&
                            `Search: "${view.filterValue}" • `}
                          {view.showOverdueOnly ? "Overdue Only" : "All Cases"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            applyCustomView(view);
                            setSelectedTab("cases");
                          }}
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => removeCustomView(idx)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View Statistics */}
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Currently Viewing
                  </div>
                  <div className="text-lg font-semibold">
                    {filteredItems.length} of {caseFiles.length} cases
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Saved Views
                  </div>
                  <div className="text-lg font-semibold">
                    {customViews.length} custom views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>
        <Tab key="integrations" title="Integrations">
          <div className="p-4 space-y-6">
            {/* Export & Reporting */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export & Reporting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Case Reports
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Export detailed case reports with analytics
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="w-full"
                      onPress={() => {
                        const rows = caseFiles.filter((f) => !f.deleted);
                        const csv = [
                          "Case Number,Type,Purpose,Created,Due Date,Status,Days Until Due,Uploader",
                        ]
                          .concat(
                            rows.map((f) => {
                              const dueDate = new Date(f.required_on);
                              const today = new Date();
                              const daysUntilDue = Math.ceil(
                                (dueDate.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              return `${f.case_number},${f.case_type},${
                                f.purpose
                              },${f.date_recieved},${f.required_on},${
                                f.date_returned ? "Completed" : "Pending"
                              },${daysUntilDue},${f.uploaded_by}`;
                            })
                          )
                          .join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        saveAs(
                          blob,
                          `case_report_${
                            new Date().toISOString().split("T")[0]
                          }.csv`
                        );
                      }}
                    >
                      Export All Cases (CSV)
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        const overdueRows = caseFiles.filter((f) => {
                          const requiredDate = new Date(f.required_on);
                          requiredDate.setHours(0, 0, 0, 0);
                          return (
                            !f.deleted &&
                            requiredDate < today &&
                            !f.date_returned
                          );
                        });
                        const csv = [
                          "Case Number,Type,Purpose,Due Date,Days Overdue,Uploader",
                        ]
                          .concat(
                            overdueRows.map((f) => {
                              const dueDate = new Date(f.required_on);
                              const daysOverdue = Math.ceil(
                                (today.getTime() - dueDate.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              return `${f.case_number},${f.case_type},${f.purpose},${f.required_on},${daysOverdue},${f.uploaded_by}`;
                            })
                          )
                          .join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        saveAs(
                          blob,
                          `overdue_cases_${
                            new Date().toISOString().split("T")[0]
                          }.csv`
                        );
                      }}
                    >
                      Export Overdue Cases Only
                    </Button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Calendar Integration
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Export deadlines to your calendar app
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="success"
                      className="w-full"
                      onPress={() => {
                        const events = caseFiles
                          .filter((f) => !f.deleted && f.required_on)
                          .map((f) => {
                            const start = new Date(f.required_on);
                            const end = new Date(
                              start.getTime() + 60 * 60 * 1000
                            );
                            return `BEGIN:VEVENT\nSUMMARY:${f.case_number} - ${
                              f.case_type
                            } (${f.purpose})\nDESCRIPTION:Case ${
                              f.case_number
                            } is due for ${f.purpose}\nDTSTART:${start
                              .toISOString()
                              .replace(/[-:]/g, "")
                              .replace(/\.\d+Z$/, "Z")}\nDTEND:${end
                              .toISOString()
                              .replace(/[-:]/g, "")
                              .replace(/\.\d+Z$/, "Z")}\nEND:VEVENT`;
                          })
                          .join("\n");
                        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Case Management//Case Deadlines//EN\n${events}\nEND:VCALENDAR`;
                        const blob = new Blob([ics], { type: "text/calendar" });
                        saveAs(blob, "case_deadlines.ics");
                      }}
                    >
                      Export All Deadlines (.ics)
                    </Button>
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const events = caseFiles
                          .filter(
                            (f) =>
                              !f.deleted &&
                              f.required_on &&
                              new Date(f.required_on) <= nextWeek
                          )
                          .map((f) => {
                            const start = new Date(f.required_on);
                            const end = new Date(
                              start.getTime() + 60 * 60 * 1000
                            );
                            return `BEGIN:VEVENT\nSUMMARY:${f.case_number} - ${
                              f.case_type
                            } (${f.purpose})\nDESCRIPTION:Case ${
                              f.case_number
                            } is due for ${f.purpose}\nDTSTART:${start
                              .toISOString()
                              .replace(/[-:]/g, "")
                              .replace(/\.\d+Z$/, "Z")}\nDTEND:${end
                              .toISOString()
                              .replace(/[-:]/g, "")
                              .replace(/\.\d+Z$/, "Z")}\nEND:VEVENT`;
                          })
                          .join("\n");
                        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Case Management//Case Deadlines//EN\n${events}\nEND:VCALENDAR`;
                        const blob = new Blob([ics], { type: "text/calendar" });
                        saveAs(blob, "upcoming_deadlines.ics");
                      }}
                    >
                      Export Next Week Only
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Tools */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Communication Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Templates
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Quick email templates for common scenarios
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="w-full"
                      onPress={() => {
                        const overdueList = caseFiles
                          .filter((f) => {
                            const requiredDate = new Date(f.required_on);
                            requiredDate.setHours(0, 0, 0, 0);
                            return (
                              !f.deleted &&
                              requiredDate < today &&
                              !f.date_returned
                            );
                          })
                          .map(
                            (f) =>
                              `• ${f.case_number} (${
                                f.case_type
                              }) - Due: ${new Date(
                                f.required_on
                              ).toLocaleDateString()}`
                          )
                          .join("\n");
                        const subject = `Overdue Cases Alert - ${new Date().toLocaleDateString()}`;
                        const body = `Dear Team,\n\nPlease find below the list of overdue cases that require immediate attention:\n\n${overdueList}\n\nTotal overdue cases: ${analytics.overdue}\n\nPlease prioritize these cases and update their status as soon as possible.\n\nBest regards,\nCase Management System`;
                        const mailto = `mailto:?subject=${encodeURIComponent(
                          subject
                        )}&body=${encodeURIComponent(body)}`;
                        window.open(mailto, "_blank");
                      }}
                    >
                      Email Overdue Cases Alert
                    </Button>
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        const weeklyList = caseFiles
                          .filter((f) => !f.deleted)
                          .map(
                            (f) =>
                              `• ${f.case_number} (${
                                f.case_type
                              }) - Due: ${new Date(
                                f.required_on
                              ).toLocaleDateString()}`
                          )
                          .join("\n");
                        const subject = `Weekly Case Report - ${new Date().toLocaleDateString()}`;
                        const body = `Dear Team,\n\nHere's your weekly case summary:\n\n📊 Summary:\n• Total Cases: ${
                          analytics.total
                        }\n• Overdue Cases: ${
                          analytics.overdue
                        }\n• Completed Cases: ${
                          analytics.closed
                        }\n• Active Cases: ${
                          analytics.total - analytics.closed
                        }\n\n📋 All Cases:\n${weeklyList}\n\nBest regards,\nCase Management System`;
                        const mailto = `mailto:?subject=${encodeURIComponent(
                          subject
                        )}&body=${encodeURIComponent(body)}`;
                        window.open(mailto, "_blank");
                      }}
                    >
                      Email Weekly Report
                    </Button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Quick Actions
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Instant notifications and reminders
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="warning"
                      className="w-full"
                      onPress={() => {
                        if (analytics.overdue > 0) {
                          if (Notification.permission === "granted") {
                            new Notification("Case Management Alert", {
                              body: `You have ${analytics.overdue} overdue cases that need attention!`,
                              icon: "/favicon.ico",
                            });
                          } else if (Notification.permission !== "denied") {
                            Notification.requestPermission().then(
                              (permission) => {
                                if (permission === "granted") {
                                  new Notification("Case Management Alert", {
                                    body: `You have ${analytics.overdue} overdue cases that need attention!`,
                                    icon: "/favicon.ico",
                                  });
                                }
                              }
                            );
                          }
                        } else {
                          alert("No overdue cases at this time! 🎉");
                        }
                      }}
                    >
                      Test Overdue Notification
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        const summary = `📊 Case Summary:\n• Total: ${
                          analytics.total
                        }\n• Overdue: ${analytics.overdue}\n• Completed: ${
                          analytics.closed
                        }\n• Active: ${
                          analytics.total - analytics.closed
                        }\n\n📈 Performance:\n• Avg Processing: ${
                          analytics.avgProcessing
                        } days\n• Completion Rate: ${
                          analytics.total > 0
                            ? Math.round(
                                (analytics.closed / analytics.total) * 100
                              )
                            : 0
                        }%`;
                        navigator.clipboard.writeText(summary).then(() => {
                          alert("Case summary copied to clipboard!");
                        });
                      }}
                    >
                      Copy Summary to Clipboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Automation & Workflows */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automation & Workflows
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Automated Reminders
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Set up automatic notifications for upcoming deadlines
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="w-full"
                      onPress={() => {
                        const nextWeekCases = caseFiles.filter((f) => {
                          const dueDate = new Date(f.required_on);
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          return (
                            !f.deleted &&
                            dueDate <= nextWeek &&
                            dueDate > new Date() &&
                            !f.date_returned
                          );
                        });
                        alert(
                          `Found ${nextWeekCases.length} cases due within the next week. In a full implementation, this would set up automated email reminders.`
                        );
                      }}
                    >
                      Setup Weekly Reminders
                    </Button>
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        alert(
                          "Daily overdue alerts would be configured here. This would send notifications every morning for overdue cases."
                        );
                      }}
                    >
                      Configure Daily Alerts
                    </Button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Batch Operations
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Perform bulk actions on multiple cases
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      color="success"
                      className="w-full"
                      onPress={() => {
                        const completedToday = caseFiles.filter((f) => {
                          const today = new Date().toDateString();
                          return (
                            f.date_returned &&
                            new Date(f.date_returned).toDateString() === today
                          );
                        });
                        alert(
                          `${completedToday.length} cases were completed today. In a full system, this would trigger completion workflows.`
                        );
                      }}
                    >
                      Process Today's Completions
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="w-full"
                      onPress={() => {
                        const oldCases = caseFiles.filter((f) => {
                          const caseDate = new Date(f.date_recieved);
                          const sixMonthsAgo = new Date();
                          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                          return caseDate < sixMonthsAgo && f.date_returned;
                        });
                        alert(
                          `Found ${oldCases.length} cases older than 6 months that could be archived.`
                        );
                      }}
                    >
                      Archive Old Cases
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-green-600">
                    <CheckCircle className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    System Online
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {caseFiles.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Records
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Last Updated
                  </div>
                </div>
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
