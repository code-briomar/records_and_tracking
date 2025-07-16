import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import { Field, FieldArray, Form, Formik, FormikHelpers } from "formik";
import {
  ArrowLeft,
  Camera,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  InfoIcon,
  Moon,
  MoreVertical,
  OctagonAlert,
  Plus,
  RotateCcw,
  Scale,
  Search,
  SunIcon,
  Trash2,
  Upload,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
// Enhanced Offender interface to match backend
export interface Offender {
  offender_id?: number;
  full_name: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: string;
  photo_path?: string;
  notes?: string;
  date_created?: string;
  photo_url?: string;
  photo_file?: File;
  file_id?: number; // Foreign key to files table
  penalty?: string;
  penalty_notes?: string;
}

// Mock data with better structure - will be replaced by real data from Tauri
const initialOffenders: Offender[] = [];

export default function OffenderRecords() {
  const [offenders, setOffenders] = useState<Offender[]>(initialOffenders);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  // const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Smart duplicate detection states
  const [quickSearchId, setQuickSearchId] = useState("");
  const [quickSearchResults, setQuickSearchResults] = useState<Offender[]>([]);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  // Extend Partial<Offender> to include optional history property
  type OffenderWithHistory = Partial<Offender> & { history?: any[] };

  const [newOffender, setNewOffender] = useState<OffenderWithHistory>({});
  const [editingOffender, setEditingOffender] = useState<
    (Offender & { history?: any[] }) | null
  >(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selected, setSelected] = useState<Offender | null>(null);
  const [allCases, setAllCases] = useState<any[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const imageEditorRef = useRef<HTMLCanvasElement>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);

  // --- Offender History State ---
  const [offenderHistory, setOffenderHistory] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  // Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Navigation
  const navigate = useNavigate();

  // Create a map of offender ID to case count for efficient lookup
  // useMemo to avoid recalculating on every render
  // Also fetch data from fetchAllOffendersHistories() and don't use offenderHistory state
  const [allHistories, setAllHistories] = useState<any[]>([]);
  useEffect(() => {
    fetchAllOffendersHistories().then(setAllHistories);
  }, [offenders]);

  const offenderCaseCounts = useMemo(() => {
    const map: Record<number, number> = {};
    allHistories.forEach((h) => {
      if (h.offender_id) {
        map[h.offender_id] = (map[h.offender_id] || 0) + 1;
      }
    });
    return map;
  }, [allHistories]);

  // Fetch offenders from backend on component mount
  React.useEffect(() => {
    invoke<Offender[]>("list_offenders")
      .then(setOffenders)
      .catch((error) => {
        console.error("Failed to load offenders:", error);
      });
  }, []);

  // Fetch all cases for linking
  useEffect(() => {
    invoke<any[]>("get_all_files")
      .then(setAllCases)
      .catch(() => {});
  }, []);

  // Filter offenders
  const filtered = offenders.filter((o) => {
    const matchesSearch =
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.national_id && o.national_id.includes(search));
    const matchesGender = !filterGender || o.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  // Smart duplicate detection function
  const findSimilarOffenders = (id: string) => {
    if (!id || id.length < 2) {
      setQuickSearchResults([]);
      return;
    }

    const similar = offenders.filter((offender) => {
      const nationalId = (offender.national_id || "").toLowerCase();
      const searchId = id.toLowerCase();

      return (
        nationalId.includes(searchId) ||
        searchId.includes(nationalId) ||
        nationalId === searchId
      );
    });

    setQuickSearchResults(similar);
  };

  // Add new offender (with photo upload)
  const handleAdd = async (newOffender: any) => {
    console.log("Adding new offender:", newOffender);
    if (!newOffender.full_name) return;

    try {
      let photoBytes = undefined;
      let photoFilename = undefined;

      if (newOffender.photo_url && newOffender.photo_file) {
        photoBytes = await newOffender.photo_file.arrayBuffer();
        photoBytes = Array.from(new Uint8Array(photoBytes));
        photoFilename = newOffender.photo_file.name;
      }

      const created = await invoke<Offender>("create_offender", {
        fullName: newOffender.full_name,
        nationalId: newOffender.national_id,
        dateOfBirth: newOffender.date_of_birth,
        gender: newOffender.gender,
        notes: newOffender.notes,
        fileId: newOffender.file_id || null,
        penalty: newOffender.penalty || null,
        penaltyNotes: newOffender.penalty_notes || null,
        photo: photoBytes,
        photoFilename: photoFilename,
      });

      // Save all history records for this offender
      if (Array.isArray(newOffender.history) && created.offender_id) {
        for (const h of newOffender.history) {
          await invoke("add_offender_history", {
            offenderId: created.offender_id,
            fileId: h.file_id || null,
            caseId: h.case_id || null,
            offenseDate: h.offense_date || null,
            penalty: h.penalty || null,
            penaltyNotes: h.penalty_notes || null,
            notes: h.notes || null,
          });
        }
      }

      // Refresh the offenders list from backend to ensure consistency
      await fetchOffenders();

      // Also refresh the offender history to include new entries
      await fetchAllHistories(created.offender_id); // Fetch all histories after adding

      setNewOffender({});
      setShowAdd(false);

      console.log("Offender added successfully and list refreshed");
    } catch (error) {
      console.error("Failed to create offender:", error);
    }
  };

  // Fetch photo from backend (if not already loaded)
  // const fetchPhoto = async (offender: Offender) => {
  //   if (!offender.photo_url && offender.offender_id) {
  //     try {
  //       const bytes = await invoke<number[]>("get_offender_photo", {
  //         offenderId: offender.offender_id,
  //       });
  //       const blob = new Blob([new Uint8Array(bytes)], { type: "image/jpeg" });
  //       const url = URL.createObjectURL(blob);
  //       setOffenders((prev) =>
  //         prev.map((o) =>
  //           o.offender_id === offender.offender_id
  //             ? { ...o, photo_url: url }
  //             : o
  //         )
  //       );
  //     } catch (error) {
  //       console.error("Failed to fetch photo:", error);
  //     }
  //   }
  // };

  const fetchOffenders = () => {
    invoke<Offender[]>("list_offenders")
      .then(setOffenders)
      .catch((error) => {
        console.error("Failed to load offenders:", error);
      });
  };
  // Centralized function to fetch all offender histories
  const fetchAllHistories = async (offender_id?: number | null) => {
    try {
      // Param : offender_id pass to list_offender_history
      // const params: any = {};
      // if (offender_id !== undefined && offender_id !== null) {
      //   params.offenderId = offender_id;
      // }

      console.log("Fetching histories with params:", offender_id);
      const all = await invoke<any[]>("list_offender_history", {
        offenderId: offender_id,
      });

      setOffenderHistory(all || []);

      console.log("All histories refreshed:", all?.length || 0, "records");
      console.log("Sample history data:", all?.slice(0, 2));
    } catch (error) {
      console.error("Failed to fetch all histories:", error);
      setOffenderHistory([]);
    }
  };

  const fetchAllOffendersHistories = async () => {
    try {
      const all = await invoke<any[]>("fetch_all_histories");
      console.log(
        "Fetched all offenders' histories:",
        all?.length || 0,
        "records"
      );
      return all;
    } catch (error) {
      console.error("Failed to fetch all offenders' histories:", error);
      return [];
    }
  };

  // Update offender (with optional photo update)
  const handleUpdate = async (editingOffender: any) => {
    try {
      let photoBytes = undefined;
      let photoFilename = undefined;

      if (editingOffender.photo_file) {
        photoBytes = await editingOffender.photo_file.arrayBuffer();
        photoBytes = Array.from(new Uint8Array(photoBytes));
        photoFilename = editingOffender.photo_file.name;
      }

      // 1. Fetch current history from backend
      let currentHistory: any[] = [];
      if (editingOffender.offenderId) {
        try {
          currentHistory = await invoke<any[]>("list_offender_history", {
            offenderId: editingOffender.offenderId,
          });
        } catch (error) {
          console.error(
            "An Error Occurred Trying To Set the current history : ",
            error
          );
        }
      }

      // 2. Update offender main record
      const result = await invoke<Offender>("update_offender", {
        offenderId: editingOffender.offenderId,
        fullName: editingOffender.full_name,
        nationalId: editingOffender.national_id,
        dateOfBirth: editingOffender.date_of_birth,
        gender: editingOffender.gender,
        notes: editingOffender.notes,
        fileId: editingOffender.file_id || null,
        penalty: editingOffender.penalty || null,
        penaltyNotes: editingOffender.penalty_notes || null,
        photo: photoBytes,
        photoFilename: photoFilename,
      });

      console.log("Updated offender:", result);

      // 3. Sync history
      const newHistory = Array.isArray(editingOffender.history)
        ? editingOffender.history
        : [];

      console.log("New History", newHistory);
      const oldById = Object.fromEntries(
        (currentHistory || []).map((h) => [h.id, h])
      );

      console.log("Old ID", oldById);
      const newById = Object.fromEntries(
        newHistory.filter((h: any) => h.id).map((h: any) => [h.id, h])
      );

      console.log("New ID", newById);

      // a) Add new records (no id)
      for (const h of newHistory) {
        if (!h.id) {
          console.log("Add New Offender Records", h);
          await invoke("add_offender_history", {
            offender_id: editingOffender.offenderId,
            file_id: h.file_id || null,
            case_id: h.case_id || null,
            offense_date: h.offense_date || null,
            penalty: h.penalty || null,
            penalty_notes: h.penalty_notes || null,
            notes: h.notes || null,
          });
        }
      }
      // b) Update existing records (with id)
      for (const h of newHistory) {
        if (h.id && oldById[h.id]) {
          console.log("History record to update:", h);
          const response = await invoke("update_offender_history", {
            id: h.id,
            offender_id: editingOffender.offenderId,
            file_id: h.file_id || null,
            case_id: h.case_id || null,
            offense_date: h.offense_date || null,
            penalty: h.penalty || null,
            penalty_notes: h.penalty_notes || null,
            notes: h.notes || null,
          });

          console.log("Updated history record:", response);
        }
      }
      // c) Delete removed records
      for (const old of currentHistory) {
        if (!newById[old.id]) {
          await invoke("delete_offender_history", { id: old.id });
        }
      }

      // Refresh the offenders list from backend to ensure consistency
      await fetchOffenders();

      // Also refresh the offender history to include updated entries
      await fetchAllHistories(editingOffender.offenderId); // Fetch all histories after updating

      setEditingOffender(null);
      setShowEdit(false);

      console.log("Offender updated successfully and list refreshed");
    } catch (error) {
      console.error("Failed to update offender:", error);
    }
  };

  // Delete offender
  const handleDelete = async (id: number) => {
    try {
      await invoke("delete_offender", { offender_id: id });

      // Refresh the offenders list from backend to ensure consistency
      await fetchOffenders();

      // Also refresh the offender history to remove deleted entries
      await fetchAllHistories(id); // Fetch all histories after deletion

      console.log("Offender deleted successfully and list refreshed");
    } catch (error) {
      console.error("Failed to delete offender:", error);
    }
  };

  // Photo upload handler
  // const handlePhoto = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   isEdit = false
  // ) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const url = URL.createObjectURL(e.target.files[0]);
  //     if (isEdit && editingOffender) {
  //       setEditingOffender((prev) =>
  //         prev
  //           ? {
  //               ...prev,
  //               photo_url: url,
  //               photo_file: e.target.files![0],
  //             }
  //           : null
  //       );
  //     } else {
  //       setNewOffender((prev) => ({
  //         ...prev,
  //         photo_url: url,
  //         photo_file: e.target.files![0],
  //       }));
  //     }
  //   }
  // };

  const OffenderCard = ({ offender }: { offender: Offender }) => (
    <Card className="group w-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/30 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/20 backdrop-blur-sm">
      {/* Enhanced Header with Better Visual Hierarchy */}
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex justify-between w-full items-start gap-4">
          {/* Main Info Section */}
          <div className="flex gap-4 items-start flex-1">
            {/* Enhanced Avatar Section */}
            <div className="relative group/avatar flex-shrink-0">
              <div className="relative">
                <Avatar
                  src={offender.photo_url}
                  name={offender.full_name}
                  size="lg"
                  className="ring-3 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-lg"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  }
                />

                {/* Photo Status & Hover Effects */}
                {offender.photo_url && (
                  <>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        className="text-white hover:bg-white/20"
                        onPress={() => {
                          setSelected(offender);
                          setShowImageModal(true);
                          setImageZoom(1);
                        }}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Photo indicator */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <Camera className="w-2.5 h-2.5 text-white" />
                    </div>
                  </>
                )}

                {/* Status indicator for cases */}
                {/* <div className="absolute -bottom-1 -left-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white text-xs font-semibold shadow-lg">
                  {offenderCaseCounts[offender.offender_id!] || 0}
                </div> */}
              </div>
            </div>

            {/* Enhanced Info Section */}
            <div className="flex-1 min-w-0">
              {/* Primary Information */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                    {offender.full_name || "Unknown"}
                  </h3>
                  {offender.penalty && (
                    <div className="flex-shrink-0">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                        startContent={<OctagonAlert className="w-3 h-3" />}
                      >
                        Active Penalty
                      </Chip>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-default-600">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    ID: {offender.national_id || "N/A"}
                  </span>
                </div>
              </div>

              {/* Enhanced Chips Section */}
              <div className="flex flex-wrap gap-2 mb-3">
                {offender.gender && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                    startContent={
                      offender.gender === "Male" ? (
                        <UserCheck className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )
                    }
                  >
                    {offender.gender}
                  </Chip>
                )}

                <Chip
                  size="sm"
                  variant="flat"
                  className={`${
                    (offenderCaseCounts[offender.offender_id!] || 0) > 1
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  }`}
                  startContent={<FileText className="w-3 h-3" />}
                >
                  {offenderCaseCounts[offender.offender_id!] || 0}{" "}
                  {(offenderCaseCounts[offender.offender_id!] || 0) === 1
                    ? "case"
                    : "cases"}
                </Chip>

                {offender.date_of_birth && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                    startContent={<Clock className="w-3 h-3" />}
                  >
                    Born {new Date(offender.date_of_birth).toLocaleDateString()}
                  </Chip>
                )}
              </div>

              {/* Current Penalty Display */}
              {offender.penalty && (
                <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <span className="font-semibold text-orange-800 dark:text-orange-200">
                      Current Penalty:
                    </span>
                    <span className="text-orange-700 dark:text-orange-300">
                      {(() => {
                        const penaltyMap: { [key: string]: string } = {
                          Fine: "Fine",
                          "Locked Up": "Incarceration",
                          "Community Service": "Community Service",
                          Probation: "Probation",
                          "Suspended Sentence": "Suspended Sentence",
                          "Discharge Under Section 35 of The Penal Code":
                            "Discharge Under Section 35",
                          "Withdrawal Under Section 204 CPC":
                            "Withdrawal Under Section 204 CPC",
                          "Withdrawal Under Section 87a CPC":
                            "Withdrawal Under Section 87a CPC",
                          Other: "Other",
                        };
                        return penaltyMap[offender.penalty] || offender.penalty;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Actions Menu */}
          <div className="flex-shrink-0">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="opacity-60 group-hover:opacity-100 transition-opacity duration-300 hover:bg-default-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="view"
                  startContent={<Eye className="w-4 h-4" />}
                  onPress={() => {
                    setSelected(offender);
                    onOpen();
                  }}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => {
                    setEditingOffender(offender);
                    setTimeout(() => {
                      setShowEdit(true);
                    }, 0);
                  }}
                >
                  Edit Profile
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() =>
                    offender.offender_id && handleDelete(offender.offender_id)
                  }
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardHeader>

      {/* Enhanced Body */}
      <CardBody className="pt-0 px-6 pb-6">
        {/* Notes Section */}
        {offender.notes && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Notes:
                </span>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {offender.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-default-400">
            <Clock className="w-3 h-3" />
            <span>
              Added:{" "}
              {offender.date_created
                ? new Date(offender.date_created).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {/* Enhanced Action Button */}
          <Button
            size="sm"
            color="primary"
            variant="solid"
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onPress={() => {
              setEditingOffender(offender);
              setTimeout(() => {
                setShowEdit(true);
              }, 0);
            }}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add New Case
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  // Add Formik value type
  interface OffenderFormValues {
    offenderId: number | undefined;
    full_name: string;
    national_id: string;
    date_of_birth: string;
    gender: string;
    notes: string;
    file_id: string | number;
    photo_url: string;
    photo_file: File | undefined;
    penalty: string;
    penalty_notes: string;
    history: {
      id: any;
      file_id: any;
      case_id: any;
      offense_date: any;
      penalty: any;
      penalty_notes: any;
      notes: any;
    }[];
  }

  const FormModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const data = isEdit ? editingOffender : newOffender;
    // const setData = isEdit ? setEditingOffender : setNewOffender;
    const isOpen = isEdit ? showEdit : showAdd;
    const setIsOpen = isEdit ? setShowEdit : setShowAdd;
    // const handleSave = isEdit ? handleUpdate : handleAdd;

    // For edit: use the full offenderHistory (with id) as initial history

    const initialHistory = allHistories
      .filter((h) => h.offender_id === data?.offender_id)
      .map((h) => ({
        id: h.id || null,
        file_id: h.file_id || null,
        case_id: h.case_id || null,
        offense_date: h.offense_date || "",
        penalty: h.penalty || "",
        penalty_notes: h.penalty_notes || "",
        notes: h.notes || "",
      }));

    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size="2xl"
        classNames={{
          base: "bg-background",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <User className="w-5 h-5" />
            {isEdit ? "Edit Offender" : "Add New Offender"}
          </ModalHeader>
          <ModalBody className="space-y-4 pb-6 max-h-[80vh] overflow-y-auto">
            <Formik
              initialValues={{
                offenderId: data?.offender_id || undefined,
                full_name: data?.full_name || "",
                national_id: data?.national_id || "",
                date_of_birth: data?.date_of_birth || "",
                gender: data?.gender || "",
                notes: data?.notes || "",
                file_id: data?.file_id || "",
                penalty: data?.penalty || "",
                penalty_notes: data?.penalty_notes || "",
                photo_url: data?.photo_url || "",
                photo_file: data?.photo_file || undefined,
                history: initialHistory,
              }}
              enableReinitialize={true}
              onSubmit={async (
                values: OffenderFormValues,
                { setSubmitting, resetForm }: FormikHelpers<OffenderFormValues>
              ) => {
                // setData((prev: any) => ({ ...prev, ...values }));
                if (isEdit) {
                  console.log("Editing offender:", values);
                  setEditingOffender((prev) => ({
                    ...prev,
                    ...values,
                    file_id:
                      typeof values.file_id === "string"
                        ? values.file_id === ""
                          ? undefined
                          : Number(values.file_id)
                        : values.file_id,
                    photo_file: values.photo_file || prev?.photo_file,
                  }));
                } else {
                  setNewOffender((prev) => ({
                    ...prev,
                    ...values,
                    file_id:
                      typeof values.file_id === "string"
                        ? values.file_id === ""
                          ? undefined
                          : Number(values.file_id)
                        : values.file_id,
                    photo_file: values.photo_file || prev?.photo_file,
                  }));
                }

                console.log("Form values:", values);
                if (isEdit) {
                  handleUpdate(values);
                } else {
                  console.log("Adding new offender:", values);
                  handleAdd(values);
                }

                console.log("Offender saved:", values);
                setSubmitting(false);
                console.log("Form submitted successfully");
                resetForm();
                console.log("Form reset after submission");
                setIsOpen(false);
                console.log("Modal closed after submission");
                if (!isEdit) setNewOffender({});
                console.log("New offender state reset");
                if (isEdit) setEditingOffender(null);
                console.log("Editing offender state reset");

                // Refresh the filtered offenders list
                await fetchOffenders();
              }}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="full_name">
                      {({ field }: { field: any }) => (
                        <Input
                          label="Full Name"
                          placeholder="Enter full name"
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          startContent={
                            <User className="w-4 h-4 text-default-400" />
                          }
                          variant="bordered"
                          isRequired
                        />
                      )}
                    </Field>
                    <Field name="national_id">
                      {({ field }: { field: any }) => (
                        <Input
                          label="National ID"
                          placeholder="Enter national ID"
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          startContent={
                            <CreditCard className="w-4 h-4 text-default-400" />
                          }
                          variant="bordered"
                        />
                      )}
                    </Field>
                    <Field name="date_of_birth">
                      {({ field, form }: { field: any; form: any }) => (
                        <Input
                          label="Date of Birth"
                          placeholder="YYYY-MM-DD"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            // Allow typing or pasting date in YYYY-MM-DD format
                            form.setFieldValue(field.name, e.target.value);
                          }}
                          variant="bordered"
                          inputMode="text"
                          pattern="\d{4}-\d{2}-\d{2}"
                          maxLength={10}
                        />
                      )}
                    </Field>
                    <Field name="gender">
                      {({ field }: { field: any }) => (
                        <Select
                          label="Gender"
                          placeholder="Select gender"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const gender = Array.from(keys)[0] as string;
                            setFieldValue("gender", gender);
                          }}
                          variant="bordered"
                        >
                          <SelectItem key="Male">Male</SelectItem>
                          <SelectItem key="Female">Female</SelectItem>
                          <SelectItem key="Other">Other</SelectItem>
                        </Select>
                      )}
                    </Field>
                  </div>
                  <Divider className="my-6" />
                  <Field name="notes">
                    {({ field }: { field: any }) => (
                      <Textarea
                        startContent={
                          <FileText className="w-4 h-4 text-default-400" />
                        }
                        label="Additional Notes"
                        placeholder="Add any additional notes..."
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        minRows={3}
                        variant="bordered"
                      />
                    )}
                  </Field>
                  <div className="my-2 text-xs text-default-400 flex items-center gap-1">
                    <InfoIcon className="w-3 h-3" />
                    This section is for any extra context or remarks.
                  </div>
                  {/* Link to File (Case) and Penalty as dynamic FieldArray */}
                  <Divider className="my-6" />
                  <div className="mb-8 my-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-600 dark:bg-blue-800 rounded-lg">
                        <Scale className="w-6 h-6 text-white dark:text-blue-200" />
                      </div>
                      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Case History & Penalties
                      </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Manage case linkages and associated penalties
                    </p>
                  </div>
                  <FieldArray name="history">
                    {({ push, remove }) => (
                      <div className="space-y-6">
                        {values.history && values.history.length > 0 ? (
                          values.history.map((entry: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300
                              bg-white border-slate-200
                              dark:bg-slate-800 dark:border-slate-700"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Case/Penalty #{idx + 1}
                                  </h3>
                                </div>
                                <div className="flex gap-2">
                                  {idx === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        push({
                                          file_id: null,
                                          penalty: "",
                                          penalty_notes: "",
                                        })
                                      }
                                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Entry
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => remove(idx)}
                                      className="flex items-center gap-2 px-4 py-2 bg-red-500 dark:bg-red-700 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-6">
                                {/* Case Selection */}
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <FileText className="w-4 h-4" />
                                    Link to Case
                                  </label>
                                  <select
                                    value={entry.file_id || ""}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `history.${idx}.file_id`,
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
                                      )
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200"
                                  >
                                    <option value="">Select a case...</option>
                                    {allCases.map((c: any) => (
                                      <option key={c.file_id} value={c.file_id}>
                                        {c.case_number} - {c.case_type} for{" "}
                                        {c.purpose}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {/* Penalty Selection */}
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <Scale className="w-4 h-4" />
                                    Penalty Type
                                  </label>
                                  <select
                                    value={entry.penalty || ""}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `history.${idx}.penalty`,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200"
                                  >
                                    {/* TODO::Option to add a custom penalty */}
                                    <option value="">Select penalty...</option>
                                    <option value="Fine">💰 Fine</option>
                                    <option value="Locked Up">
                                      🔒 Incarceration
                                    </option>
                                    <option value="Community Service">
                                      🤝 Community Service
                                    </option>
                                    <option value="Probation">
                                      📋 Probation
                                    </option>
                                    <option value="Suspended Sentence">
                                      ⚖️ Suspended Sentence
                                    </option>
                                    <option value="Discharge Under Section 35 of The Penal Code">
                                      ⚖️ Discharge Under Section 35 of The Penal
                                      Code
                                    </option>
                                    <option value="Withdrawal Under Section 204 CPC">
                                      ⚖️ Withdrawal Under Section 204 CPC
                                    </option>
                                    <option value="Withdrawal Under Section 87a CPC">
                                      ⚖️ Withdrawal Under Section 87a CPC
                                    </option>
                                    <option value="Other">⚖️ Other</option>
                                  </select>
                                </div>
                                {/* Penalty Notes */}
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <Users className="w-4 h-4" />
                                    Additional Notes
                                  </label>
                                  <textarea
                                    value={entry.penalty_notes || ""}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `history.${idx}.penalty_notes`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Add any additional information about the penalty..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200 resize-none"
                                  />
                                </div>
                              </div>
                              {/* Preview Card */}
                              {(entry.file_id ||
                                entry.penalty ||
                                entry.penalty_notes) && (
                                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                                  <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                                    Entry Summary
                                  </h4>
                                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    {entry.file_id && (
                                      <p>
                                        <strong>Case:</strong>{" "}
                                        {
                                          allCases.find(
                                            (c: any) =>
                                              c.file_id === entry.file_id
                                          )?.case_number
                                        }
                                      </p>
                                    )}
                                    {entry.penalty && (
                                      <p>
                                        <strong>Penalty:</strong>{" "}
                                        {(() => {
                                          switch (entry.penalty) {
                                            case "Fine":
                                              return "Fine";
                                            case "Locked Up":
                                              return "Incarceration";
                                            case "Community Service":
                                              return "Community Service";
                                            case "Probation":
                                              return "Probation";
                                            case "Other":
                                              return "Other";
                                            default:
                                              return entry.penalty;
                                          }
                                        })()}
                                      </p>
                                    )}
                                    {entry.penalty_notes && (
                                      <p>
                                        <strong>Notes:</strong>{" "}
                                        {entry.penalty_notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            onClick={() =>
                              push({
                                file_id: null,
                                penalty: "",
                                penalty_notes: "",
                              })
                            }
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Case/Penalty
                          </button>
                        )}
                      </div>
                    )}
                  </FieldArray>
                  <div className="space-y-3 mt-4">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFieldValue("photo_file", e.target.files[0]);
                            setFieldValue(
                              "photo_url",
                              URL.createObjectURL(e.target.files[0])
                            );
                          }
                        }}
                        className="hidden"
                        id={`photo-${isEdit ? "edit" : "add"}`}
                      />
                      <label
                        htmlFor={`photo-${isEdit ? "edit" : "add"}`}
                        className="cursor-pointer"
                      >
                        <Button
                          as="span"
                          variant="bordered"
                          startContent={<Upload className="w-4 h-4" />}
                        >
                          Choose Photo
                        </Button>
                      </label>
                      {values.photo_url && (
                        <Avatar
                          src={values.photo_url}
                          size="lg"
                          className="ring-2 ring-primary/20"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      color="primary"
                      type="submit"
                      className="flex-1"
                      startContent={<Plus className="w-4 h-4" />}
                      isLoading={isSubmitting}
                    >
                      {isEdit ? "Update" : "Create"} Offender
                    </Button>
                    <Button
                      variant="light"
                      type="button"
                      onPress={() => {
                        setIsOpen(false);
                        if (isEdit) setEditingOffender(null);
                        else setNewOffender({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  useEffect(() => {
    if (editingOffender) {
      console.log("New Edit Values For Offender: ", editingOffender);
    }
  }, [editingOffender]);

  // Fetch offender history when a new offender is selected
  useEffect(() => {
    if (selected?.offender_id) {
      // Refresh histories for the specific selected offender to ensure we have the latest data for the modal
      fetchAllHistories(selected.offender_id);
    }
  }, [selected]);

  // Filtered history for search
  // const filteredHistory = offenderHistory.filter((h) => {
  //   const q = historySearch.toLowerCase();
  //   return (
  //     (h.penalty || "").toLowerCase().includes(q) ||
  //     (h.penalty_notes || "").toLowerCase().includes(q) ||
  //     (h.notes || "").toLowerCase().includes(q) ||
  //     (h.offense_date || "").toLowerCase().includes(q)
  //   );
  // });

  // Fetch all offender photos after offenders are loaded
  useEffect(() => {
    async function fetchAllPhotos() {
      for (const offender of offenders) {
        if (!offender.photo_url && offender.offender_id) {
          try {
            const bytes = await invoke<number[]>("get_offender_photo", {
              offenderId: offender.offender_id,
            });
            const blob = new Blob([new Uint8Array(bytes)], {
              type: "image/jpeg",
            });
            const url = URL.createObjectURL(blob);
            setOffenders((prev) =>
              prev.map((o) =>
                o.offender_id === offender.offender_id
                  ? { ...o, photo_url: url }
                  : o
              )
            );
          } catch (error) {
            // Ignore missing photo
          }
        }
      }
    }
    if (offenders.length > 0) fetchAllPhotos();
  }, [offenders]);

  // Fetch all offender histories on mount
  useEffect(() => {
    fetchAllOffendersHistories();
    // fetchAllHistories(); // No parameter = fetch all histories
    console.log("Fetching all histories for case count display");
  }, []);

  // Utility: Export offenders and their histories as CSV
  // Enhanced utility: Export offenders and their histories as professionally formatted CSV

  async function handleExport() {
    try {
      const allRows = [];

      for (const offender of offenders) {
        const histories =
          (await invoke<any[]>("list_offender_history", {
            offenderId: offender.offender_id,
          })) ?? [];

        if (Array.isArray(histories) && histories.length === 0) {
          allRows.push({
            fullName: offender.full_name || "",
            nationalId: offender.national_id || "",
            dateOfBirth: offender.date_of_birth || "",
            gender: offender.gender || "",
            notes: offender.notes || "",
            caseNumber: "",
            penalty: "",
            penaltyNotes: "",
            dateTime: offender.date_created || "",
            recordType: "Offender Record",
          });
        } else if (Array.isArray(histories)) {
          histories.forEach((history) => {
            const relatedCase = allCases.find(
              (c) => c.file_id === history.file_id
            );

            allRows.push({
              fullName: offender.full_name || "",
              nationalId: offender.national_id || "",
              dateOfBirth: offender.date_of_birth || "",
              gender: offender.gender || "",
              notes: offender.notes || "",
              caseNumber: relatedCase?.case_number || "",
              penalty: history.penalty || "",
              penaltyNotes: history.penalty_notes || "",
              dateTime: history.created_at || "",
              recordType: "History Record",
            });
          });
        }
      }

      allRows.sort((a, b) => {
        const nameCompare = a.fullName.localeCompare(b.fullName);
        return nameCompare !== 0
          ? nameCompare
          : new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      });

      const exportDate = new Date();
      const formattedDate = exportDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = exportDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Start building the worksheet rows
      const worksheetData = [
        [" RECORDS & TRACKING - OFFENDERS MANAGEMENT SYSTEM"],
        ["Export Report Generated"],
        [`Date: ${formattedDate}`],
        [`Time: ${formattedTime}`],
        [`Total Records: ${allRows.length}`],
        [`Total Offenders: ${offenders.length}`],
        [""],
        ["DETAILED RECORDS"],
        [""],
        [
          "Full Name",
          "National ID",
          "Date of Birth",
          "Gender",
          "Personal Notes",
          "Case Number",
          "Penalty Applied",
          "Penalty Details",
          "Record Date & Time",
        ],
      ];

      allRows.forEach((row) => {
        worksheetData.push([
          row.fullName,
          row.nationalId,
          formatDate(row.dateOfBirth),
          row.gender,
          row.notes,
          row.caseNumber,
          row.penalty,
          row.penaltyNotes,
          formatDateTime(row.dateTime),
        ]);
      });

      worksheetData.push(
        [""],
        ["REPORT SUMMARY"],
        [`Generated by: Records & Tracking - Offender Management System`],
        [`Export completed at: ${formattedDate} ${formattedTime}`],
        [""],
        [
          "Note: This report contains sensitive information and should be handled according to data protection policies.",
        ]
      );

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Apply bold styling to headers and section titles
      const boldRows = [0, 1, 7, 9]; // Rows you want to bold

      boldRows.forEach((rowIndex) => {
        const row = worksheetData[rowIndex];
        if (row) {
          row.forEach((_, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({
              r: rowIndex,
              c: colIndex,
            });
            if (!ws[cellRef]) return;
            if (!ws[cellRef].s) ws[cellRef].s = {};
            ws[cellRef].s.font = { bold: true };
          });
        }
      });

      // Create workbook and export
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Offender Records");

      const filename = `Offender_Records_Export_${exportDate
        .toISOString()
        .slice(0, 19)
        .replace(/[T:]/g, "_")
        .replace(/-/g, "")}.xlsx`;

      XLSX.writeFile(wb, filename);

      console.log(`Export completed successfully: ${filename}`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }

  // Helper function to format dates consistently
  function formatDate(dateString: string) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  }

  // Helper function to format date and time consistently
  function formatDateTime(dateTimeString: string) {
    if (!dateTimeString) return "";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return dateTimeString; // Return original if parsing fails
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                Offender Records
              </h1>
              <p className="text-default-500">
                Manage and track offender information
              </p>
              {/* Back to the normal system */}
              <Chip
                variant="flat"
                className="mt-2 cursor-pointer"
                onClick={() => navigate("/dashboard")}
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                To Dashboard
              </Chip>
            </div>

            {/* Theme Toggle */}
            <div className="cursor-pointer w-6 h-6">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="relative inline-flex items-center justify-center p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {/* Total Offenders Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:scale-105">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {offenders.length}
                    </div>
                    <div className="text-xs text-blue-500 dark:text-blue-400">
                      {offenders.length === 1 ? "person" : "people"}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Total Offenders
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Registered in the system
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Repeat Offenders Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:scale-105">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                    <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {
                        offenders.filter((offender) => {
                          return (
                            offender.offender_id &&
                            offenderCaseCounts[offender.offender_id] > 1
                          );
                        }).length
                      }
                    </div>
                    <div className="text-xs text-orange-500 dark:text-orange-400">
                      {Math.round(
                        (offenders.filter((offender) => {
                          return (
                            offender.offender_id &&
                            offenderCaseCounts[offender.offender_id] > 1
                          );
                        }).length /
                          (offenders.length || 1)) *
                          100
                      )}
                      % of total
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Repeat Offenders
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Multiple case records
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Male Offenders Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:scale-105">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                    <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {offenders.filter((o) => o.gender === "Male").length}
                    </div>
                    <div className="text-xs text-purple-500 dark:text-purple-400">
                      {Math.round(
                        (offenders.filter((o) => o.gender === "Male").length /
                          (offenders.length || 1)) *
                          100
                      )}
                      % of total
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                    Male Offenders
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Gender distribution
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Female Offenders Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 hover:scale-105">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                    <UserX className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                      {offenders.filter((o) => o.gender === "Female").length}
                    </div>
                    <div className="text-xs text-pink-500 dark:text-pink-400">
                      {Math.round(
                        (offenders.filter((o) => o.gender === "Female").length /
                          (offenders.length || 1)) *
                          100
                      )}
                      % of total
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-pink-800 dark:text-pink-200 mb-1">
                    Female Offenders
                  </h3>
                  <p className="text-xs text-pink-600 dark:text-pink-400">
                    Gender distribution
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6 shadow-sm">
          <CardBody className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <Input
                  placeholder="Search by ID..."
                  value={search}
                  onValueChange={setSearch}
                  startContent={<Search className="w-4 h-4 text-default-400" />}
                  className="md:max-w-xs"
                  variant="bordered"
                />
                <Select
                  placeholder="Filter by gender"
                  selectedKeys={filterGender ? [filterGender] : []}
                  onSelectionChange={(keys) =>
                    setFilterGender((Array.from(keys)[0] as string) || "")
                  }
                  className="md:max-w-xs"
                  variant="bordered"
                  startContent={<Filter className="w-4 h-4 text-default-400" />}
                >
                  <SelectItem key="">All Genders</SelectItem>
                  <SelectItem key="Male">Male</SelectItem>
                  <SelectItem key="Female">Female</SelectItem>
                  <SelectItem key="Other">Other</SelectItem>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  startContent={<Download className="w-4 h-4" />}
                  onPress={handleExport}
                >
                  Export
                </Button>

                {/* Smart Add Offender Workflow */}
                {!showQuickSearch ? (
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setShowQuickSearch(true)}
                    className="bg-gradient-to-r from-primary to-primary-600"
                  >
                    Add Offender
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Enter offender's ID number first..."
                      value={quickSearchId}
                      onValueChange={(value) => {
                        setQuickSearchId(value);
                        findSimilarOffenders(value);
                      }}
                      startContent={
                        <CreditCard className="w-4 h-4 text-default-400" />
                      }
                      className="w-80"
                      variant="bordered"
                      autoFocus
                    />
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => {
                        setShowQuickSearch(false);
                        setQuickSearchId("");
                        setQuickSearchResults([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Duplicate Check Results */}
        {showQuickSearch && (
          <Card className="mb-6 shadow-lg border-orange-200 dark:border-orange-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <InfoIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                  ID Duplicate Check Results
                </h3>
              </div>

              {quickSearchId.length < 2 ? (
                <div className="text-center py-8 text-default-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>
                    Type at least 2 characters to search for similar ID numbers
                  </p>
                </div>
              ) : quickSearchResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                      No Similar ID Numbers Found
                    </h4>
                    <p className="text-default-600 mb-4">
                      ID "{quickSearchId}" appears to be a new offender
                    </p>
                  </div>
                  <Button
                    color="success"
                    size="lg"
                    onPress={() => {
                      // Pre-fill the form with the ID and open modal
                      setNewOffender({ national_id: quickSearchId });
                      setShowAdd(true);
                      setShowQuickSearch(false);
                      setQuickSearchId("");
                    }}
                    startContent={<Plus className="w-5 h-5" />}
                    className="font-semibold"
                  >
                    Continue Adding ID "{quickSearchId}"
                  </Button>
                </div>
              ) : (
                <div>
                  {" "}
                  <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <OctagonAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                        ⚠️ Similar ID Number Found
                      </h4>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      Please verify if this is a repeat offender or a new person
                      with similar ID before proceeding.
                    </p>
                  </div>
                  <div className="border-b py-4 mb-6">
                    <div className="text-center">
                      <p className="text-default-600 mb-4">
                        If none of the above matches, this is a new person with
                        a similar ID number
                      </p>
                      <Button
                        color="success"
                        variant="bordered"
                        onPress={() => {
                          // New person with similar ID
                          setNewOffender({ national_id: quickSearchId });
                          setShowAdd(true);
                          setShowQuickSearch(false);
                          setQuickSearchId("");
                        }}
                        startContent={<Plus className="w-5 h-5" />}
                        className="font-semibold"
                      >
                        Add ID "{quickSearchId}" as New Person
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {quickSearchResults.map((offender) => (
                      <Card
                        key={offender.offender_id}
                        className="border-2 border-orange-200 dark:border-orange-800"
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar
                              src={offender.photo_url}
                              name={offender.full_name}
                              size="md"
                              fallback={<User className="w-5 h-5" />}
                            />
                            <div>
                              <h4 className="font-semibold text-lg">
                                {offender.full_name}
                              </h4>
                              <p className="text-sm text-default-500">
                                ID: {offender.national_id || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-default-600">Gender:</span>
                              <Chip size="sm" color="primary" variant="flat">
                                {offender.gender || "N/A"}
                              </Chip>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-default-600">DOB:</span>
                              <span className="font-medium">
                                {offender.date_of_birth
                                  ? new Date(
                                      offender.date_of_birth
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-default-600">Cases:</span>
                              <Chip size="sm" color="secondary" variant="flat">
                                {`${
                                  offenderCaseCounts[offender?.offender_id!] ||
                                  0
                                } `}
                              </Chip>
                            </div>

                            {offender.penalty && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-default-600">
                                  Current Penalty:
                                </span>
                                <Chip size="sm" color="danger" variant="flat">
                                  {offender.penalty}
                                </Chip>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              variant="solid"
                              onPress={() => {
                                // This is an existing offender - add new case
                                setEditingOffender(offender);
                                setShowEdit(true);
                                setShowQuickSearch(false);
                                setQuickSearchId("");
                              }}
                              className="flex-1"
                            >
                              Add New Case
                            </Button>
                            <Button
                              size="sm"
                              variant="bordered"
                              onPress={() => {
                                setSelected(offender);
                                onOpen();
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="p-12 text-center">
              <Users className="w-16 h-16 text-default-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-default-500 mb-2">
                No offenders found
              </h3>
              <p className="text-default-400 mb-4">
                {search || filterGender
                  ? "Try adjusting your search criteria"
                  : "Start by adding your first offender"}
              </p>
              {!search && !filterGender && (
                <Button
                  color="primary"
                  onPress={() => setShowAdd(true)}
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add First Offender
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((offender) => (
              <OffenderCard key={offender.offender_id} offender={offender} />
            ))}
          </div>
        )}

        {/* Modals */}
        {showAdd && <FormModal key="add" />}
        {showEdit && <FormModal isEdit key="edit" />}

        {/* Details Modal */}
        {selected && (
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="3xl"
            classNames={{
              base: "bg-background",
              backdrop: "bg-black/50 backdrop-blur-sm",
            }}
          >
            <ModalContent>
              <ModalHeader className="flex gap-2 items-center border-b">
                <Eye className="w-5 h-5" />
                Offender Details
              </ModalHeader>
              <ModalBody className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {/* <Avatar
                      src={selected.photo_url}
                      name={selected.full_name}
                      size="xl"
                      className="w-32 h-32 ring-4 ring-primary/20"
                      fallback={<User className="w-16 h-16" />}
                    /> */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <div className="relative">
                        {selected.photo_url ? (
                          <img
                            src={selected.photo_url}
                            alt={selected.full_name + " photo"}
                            className="w-32 h-32 object-cover rounded-lg ring-4 ring-primary/20 bg-default-200"
                            style={{ minHeight: 128, minWidth: 128 }}
                            onError={(e) =>
                              (e.currentTarget.src =
                                "/images/avatar-placeholder.png")
                            }
                            onLoad={(e) =>
                              e.currentTarget.classList.add("loaded")
                            }
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-default-200 rounded-lg ring-4 ring-primary/20">
                            <User className="w-16 h-16 text-default-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {selected.photo_url && (
                          <>
                            <Button
                              size="sm"
                              variant="bordered"
                              onPress={() => {
                                setShowImageModal(true);
                                setImageZoom(1);
                              }}
                            >
                              View Full
                            </Button>
                            <Button
                              size="sm"
                              variant="bordered"
                              onPress={() => {
                                const link = document.createElement("a");
                                link.href = selected.photo_url || "";
                                link.download =
                                  selected.full_name + "_photo.jpg";
                                link.click();
                              }}
                            >
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="bordered"
                              onPress={() => {
                                setEditImageUrl(selected.photo_url!);
                                setShowImageEditor(true);
                              }}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {selected.full_name}
                      </h2>
                      <div className="flex gap-2 mb-4">
                        {selected.gender && (
                          <Chip color="primary" variant="flat">
                            {selected.gender}
                          </Chip>
                        )}
                        <Chip color="secondary" variant="flat">
                          {/* {Cases}                           */}
                          {
                            offenderHistory.filter(
                              (h) => h.offender_id === selected.offender_id
                            ).length
                          }{" "}
                          {offenderHistory.filter(
                            (h) => h.offender_id === selected.offender_id
                          ).length > 1
                            ? "cases"
                            : "case"}
                        </Chip>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selected.national_id && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-default-400" />
                          <span className="text-sm text-default-600">
                            National ID:
                          </span>
                          <span className="font-medium">
                            {selected.national_id}
                          </span>
                        </div>
                      )}
                      {selected.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-default-400" />
                          <span className="text-sm text-default-600">
                            Date of Birth:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              selected.date_of_birth
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Show The Penalty */}
                    {selected.penalty && (
                      <div className="flex items-start gap-2">
                        <OctagonAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-default-400" />
                        <span className="text-sm text-default-600 font-semibold">
                          Current Penalty:{" "}
                        </span>
                        <span className="font-medium">
                          {(() => {
                            // Map penalty values to consistent display format
                            const penaltyMap: { [key: string]: string } = {
                              Fine: "💰 Fine",
                              "Locked Up": "🔒 Incarceration",
                              "Community Service": "🤝 Community Service",
                              Probation: "📋 Probation",
                              "Suspended Sentence": "⚖️ Suspended Sentence",
                              "Discharge Under Section 35 of The Penal Code":
                                "⚖️ Discharge Under Section 35",
                              "Withdrawal Under Section 204 CPC":
                                "⚖️ Withdrawal Under Section 204 CPC",
                              "Withdrawal Under Section 87a CPC":
                                "⚖️ Withdrawal Under Section 87a CPC",
                              Other: "⚖️ Other",
                            };

                            return (
                              penaltyMap[selected.penalty] ||
                              `⚖️ ${selected.penalty}`
                            );
                          })()}
                          {selected.penalty_notes &&
                            ` (${selected.penalty_notes})`}
                        </span>
                      </div>
                    )}

                    {selected.notes && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-default-400" />
                          <span className="text-sm font-medium text-default-600">
                            Notes:
                          </span>
                        </div>
                        <p className="text-sm text-default-700 bg-default-100 p-3 rounded-lg">
                          {selected.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Divider className="my-6" />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Offender History
                  </h3>
                  <Input
                    placeholder="Search history (penalty, notes, date...)"
                    value={historySearch}
                    onValueChange={setHistorySearch}
                    className="mb-4 max-w-md"
                    variant="bordered"
                    startContent={
                      <Search className="w-4 h-4 text-default-400" />
                    }
                  />
                  {(() => {
                    // First filter by the selected offender's ID, then by search terms
                    const offenderSpecificHistory = offenderHistory.filter(
                      (h) => h.offender_id === selected?.offender_id
                    );

                    const filteredHistory = offenderSpecificHistory.filter(
                      (h) => {
                        // If no search query, show all records for this offender
                        if (!historySearch.trim()) return true;

                        const q = historySearch.toLowerCase();
                        return (
                          (h.penalty || "").toLowerCase().includes(q) ||
                          (h.penalty_notes || "").toLowerCase().includes(q) ||
                          (h.notes || "").toLowerCase().includes(q) ||
                          (h.created_at || "").toLowerCase().includes(q)
                        );
                      }
                    );
                    return filteredHistory.length === 0 ? (
                      <div className="text-center py-6 text-default-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No history records found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredHistory.map((h, idx) => {
                          const linkedFile = allCases.find(
                            (c) => c.file_id === h.file_id
                          );

                          // Format penalty display consistently
                          const formatPenalty = (
                            penalty: string | null | undefined
                          ) => {
                            if (!penalty || penalty.trim() === "")
                              return "No penalty assigned";

                            // Map internal values to display values
                            const penaltyMap: { [key: string]: string } = {
                              Fine: "💰 Fine",
                              "Locked Up": "🔒 Incarceration",
                              "Community Service": "🤝 Community Service",
                              Probation: "📋 Probation",
                              "Suspended Sentence": "⚖️ Suspended Sentence",
                              "Discharge Under Section 35 of The Penal Code":
                                "⚖️ Discharge Under Section 35",
                              "Withdrawal Under Section 204 CPC":
                                "⚖️ Withdrawal Under Section 204 CPC",
                              "Withdrawal Under Section 87a CPC":
                                "⚖️ Withdrawal Under Section 87a CPC",
                              Other: "⚖️ Other",
                            };

                            return penaltyMap[penalty] || `⚖️ ${penalty}`;
                          };

                          // Format date consistently
                          const formatDate = (
                            dateString: string | null | undefined
                          ) => {
                            if (!dateString) return "No date recorded";

                            try {
                              const date = new Date(dateString);
                              return date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              });
                            } catch (e) {
                              return "Invalid date";
                            }
                          };

                          return (
                            <Card key={h.id || idx} className="bg-default-50">
                              <CardBody className="p-3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                  <div>
                                    <div className="font-medium">
                                      {linkedFile ? (
                                        <>
                                          <span className="text-primary font-semibold">
                                            📁 {linkedFile.case_number}
                                          </span>
                                          <span className="ml-2 text-default-500">
                                            {linkedFile.case_type} -{" "}
                                            {linkedFile.purpose}
                                          </span>
                                        </>
                                      ) : h.file_id ? (
                                        <span className="text-warning-600">
                                          ⚠️ Case #{h.file_id} (Record not
                                          found)
                                        </span>
                                      ) : (
                                        <span className="text-default-400">
                                          📝 Independent record (no case linked)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-default-600 mt-1">
                                      <span className="font-semibold text-slate-700">
                                        {formatPenalty(h.penalty)}
                                      </span>
                                    </div>
                                    {h.penalty_notes && (
                                      <div className="text-xs text-default-500 mt-1">
                                        <span className="font-medium">
                                          Additional Details:
                                        </span>{" "}
                                        <span className="italic">
                                          {h.penalty_notes}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      className="text-xs"
                                    >
                                      {formatDate(h.created_at)}
                                    </Chip>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                {/* Image Tools Section */}
                {/* <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Offender Photo
                  </h3>
                </div> */}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {/* Image Full View Modal */}
        <Modal
          isOpen={showImageModal}
          onOpenChange={setShowImageModal}
          size="3xl"
        >
          <ModalContent>
            <ModalHeader className="flex gap-2 items-center">
              Photo Viewer
            </ModalHeader>
            <ModalBody className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={selected?.photo_url}
                  alt={selected?.full_name + " photo"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 500,
                    transform: `scale(${imageZoom})`,
                    transition: "transform 0.2s",
                    borderRadius: 12,
                  }}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onPress={() => setImageZoom((z) => Math.max(0.2, z - 0.2))}
                  >
                    -
                  </Button>
                  <span className="px-2">
                    Zoom: {Math.round(imageZoom * 100)}%
                  </span>
                  <Button
                    size="sm"
                    onPress={() => setImageZoom((z) => Math.min(3, z + 0.2))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Image Editor Modal */}
        <Modal
          isOpen={showImageEditor}
          onOpenChange={setShowImageEditor}
          size="3xl"
        >
          <ModalContent>
            <ModalHeader className="flex gap-2 items-center">
              Edit Photo
            </ModalHeader>
            <ModalBody className="flex flex-col items-center gap-4">
              <canvas
                ref={imageEditorRef}
                width={320}
                height={320}
                style={{
                  borderRadius: 12,
                  border: "1px solid #ccc",
                  background: "#f9f9f9",
                }}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onPress={() => {
                    // Rotate
                    const canvas = imageEditorRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    const img = new window.Image();
                    img.src = canvas.toDataURL();
                    img.onload = () => {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      ctx.save();
                      ctx.translate(canvas.width / 2, canvas.height / 2);
                      ctx.rotate(Math.PI / 2);
                      ctx.drawImage(
                        img,
                        -canvas.height / 2,
                        -canvas.width / 2,
                        canvas.height,
                        canvas.width
                      );
                      ctx.restore();
                    };
                  }}
                >
                  Rotate
                </Button>
                <Button
                  size="sm"
                  onPress={() => {
                    // Flip horizontally
                    const canvas = imageEditorRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    const img = new window.Image();
                    img.src = canvas.toDataURL();
                    img.onload = () => {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      ctx.save();
                      ctx.translate(canvas.width, 0);
                      ctx.scale(-1, 1);
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      ctx.restore();
                    };
                  }}
                >
                  Flip
                </Button>
                <Button
                  size="sm"
                  onPress={() => {
                    // Reset
                    if (editImageUrl && imageEditorRef.current) {
                      const ctx = imageEditorRef.current.getContext("2d");
                      const img = new window.Image();
                      img.src = editImageUrl;
                      img.onload = () => {
                        ctx?.clearRect(0, 0, 320, 320);
                        ctx?.drawImage(img, 0, 0, 320, 320);
                      };
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onPress={() => {
                    // Save edited image (download for now)
                    if (imageEditorRef.current) {
                      const link = document.createElement("a");
                      link.href =
                        imageEditorRef.current.toDataURL("image/jpeg");
                      link.download =
                        (selected?.full_name || "edited") + "_edited.jpg";
                      link.click();
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
