import {
  Button,
  Chip,
  ChipProps,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import React, { SVGProps } from "react";
import { Case } from "../services/cases";
import AddNewCaseFileForm from "./add_new_case_file_form";
import DeleteCaseFileModal from "./delete_case_file_form";
import EditCaseFileForm from "./edit _case_file_form";
import { fileSectionData as caseFiles } from "./files_data";
import { staff } from "./staff_data";
import ViewCaseFileModal from "./view_case_file_modal";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "CASE NUMBER", uid: "case_number", sortable: true },
  { name: "PURPOSE", uid: "purpose", sortable: true },
  //{ name: "STATUS", uid: "status", sortable: true }, // Assuming status is part of the case table
  { name: "UPLOADED BY", uid: "uploaded_by", sortable: true },
  { name: "CURRENT LOCATION", uid: "current_location", sortable: true },
  { name: "NOTES", uid: "notes" },
  { name: "DATE RECEIVED", uid: "date_recieved", sortable: true },
  { name: "REQUIRED ON", uid: "required_on", sortable: true },
  { name: "REQUIRED ON SIGNATURE", uid: "required_on_signature" },
  { name: "DATE RETURNED", uid: "date_returned", sortable: true },
  { name: "RETURNED SIGNATURE", uid: "date_returned_signature" },
  { name: "ACTIONS", uid: "actions" },
];

export const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
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

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = [
  "case_number",
  "purpose",
  //"status", // Only include if it's part of your case/file schema
  "uploaded_by",
  "current_location",
  "required_on",
  "actions",
];

export default function CaseFilters() {
  const [file_id, setFileID] = React.useState<number>(0);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );

  const { onOpen, isOpen, onOpenChange } = useDisclosure();

  const {
    onOpen: onOpenView,
    isOpen: isOpenView,
    onOpenChange: onOpenChangeView,
  } = useDisclosure();

  const {
    onOpen: onOpenEdit,
    isOpen: isOpenEdit,
    onOpenChange: onOpenChangeEdit,
  } = useDisclosure();

  const {
    onOpen: onOpenDelete,
    isOpen: isOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();

  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(caseFiles.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCaseFiles = [...caseFiles] as Case[];

    // if (hasSearchFilter) {
    //   filteredCaseFiles = filteredCaseFiles.filter((file) =>
    //     file.title.toLowerCase().includes(filterValue.toLowerCase())
    //   );
    // }
    // if (
    //   statusFilter !== "all" &&
    //   Array.from(statusFilter).length !== statusOptions.length
    // ) {
    //   filteredCaseFiles = filteredCaseFiles.filter((user) =>
    //     Array.from(statusFilter).includes(user.status)
    //   );
    // }

    return filteredCaseFiles;
  }, [caseFiles, filterValue, statusFilter]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Case, b: Case) => {
      const first = a[sortDescriptor.column as keyof Case];
      const second = b[sortDescriptor.column as keyof Case];

      let cmp = 0;

      if (typeof first === "number" && typeof second === "number") {
        cmp = first - second;
      } else if (typeof first === "string" && typeof second === "string") {
        cmp = first.localeCompare(second);
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((file: Case, columnKey: React.Key) => {
    const cellValue = file[columnKey as keyof Case];

    switch (columnKey) {
      case "case_number":
        return <p className="text-bold text-small">{file?.case_number}</p>;

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

      // case "status": // Optional: Only include if your files actually have a status field
      //   return (
      //     <Chip
      //       className="capitalize border-none gap-1 text-default-600"
      //       color={statusColorMap[file.status]}
      //       size="sm"
      //       variant="dot"
      //     >
      //       {cellValue}
      //     </Chip>
      //   );

      case "uploaded_by":
        return (
          <span>
            {/* {users.find((u) => u.user_id === file.uploaded_by)?.name ||
              `User #${file.uploaded_by}`} */}
            {staff.find((u) => u.user_id === file.uploaded_by)?.name ||
              `User #${file.uploaded_by}`}
          </span>
        );

      case "current_location":
        return <span>{file.current_location}</span>;

      case "notes":
        return <span className="text-sm text-default-600">{file.notes}</span>;

      case "date_recieved":
        return (
          <span className="text-xs font-semibold">
            {new Date(file.date_recieved).toLocaleString("en-US")}
          </span>
        );

      case "required_on":
        return (
          <span className="text-xs font-semibold">
            {new Date(file.required_on).toLocaleDateString("en-US", {
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

      case "actions":
        const launchViewModal = () => {
          setFileID(file.file_id);
          onOpenChangeView();
        };

        const launchEditModal = () => {
          setFileID(file.file_id);
          onOpenEdit();
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
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
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
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {caseFiles.length} case files
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
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

  return (
    <>
      <Table
        isCompact
        removeWrapper
        aria-label="Example table with custom cells, pagination and sorting"
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
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No case files found"} items={sortedItems}>
          {(item) => (
            <TableRow key={Math.random()}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ViewCaseFileModal
        file_id={file_id}
        isOpen={isOpenView}
        onOpenChange={onOpenChangeView}
      />

      <AddNewCaseFileForm
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />

      <EditCaseFileForm
        file_id={file_id}
        isOpen={isOpenEdit}
        onOpenChange={onOpenChangeEdit}
        onOpen={onOpen}
      />

      <DeleteCaseFileModal
        file_id={file_id}
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
      />
    </>
  );
}
