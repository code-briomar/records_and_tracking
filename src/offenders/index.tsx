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
  Camera,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  OctagonAlert,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newOffender, setNewOffender] = useState<Partial<Offender>>({});
  const [editingOffender, setEditingOffender] = useState<Offender | null>(null);
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
        photoFilename,
      });

      // Save all history records for this offender
      if (Array.isArray(newOffender.history) && created.offender_id) {
        for (const h of newOffender.history) {
          await invoke("add_offender_history", {
            offender_id: created.offender_id,
            file_id: h.file_id || null,
            case_id: h.case_id || null,
            offense_date: h.offense_date || null,
            penalty: h.penalty || null,
            penalty_notes: h.penalty_notes || null,
            notes: h.notes || null,
          });
        }
      }

      setOffenders((prev) => [...prev, created]);
      setNewOffender({});
      setShowAdd(false);
    } catch (error) {
      console.error("Failed to create offender:", error);
    }
  };

  // Fetch photo from backend (if not already loaded)
  const fetchPhoto = async (offender: Offender) => {
    if (!offender.photo_url && offender.offender_id) {
      try {
        const bytes = await invoke<number[]>("get_offender_photo", {
          offenderId: offender.offender_id,
        });
        const blob = new Blob([new Uint8Array(bytes)], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setOffenders((prev) =>
          prev.map((o) =>
            o.offender_id === offender.offender_id
              ? { ...o, photo_url: url }
              : o
          )
        );
      } catch (error) {
        console.error("Failed to fetch photo:", error);
      }
    }
  };

  const fetchOffenders = () => {
    invoke<Offender[]>("list_offenders")
      .then(setOffenders)
      .catch((error) => {
        console.error("Failed to load offenders:", error);
      });
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
            offender_id: editingOffender.offenderId,
          });
        } catch (error) {
          console.error(
            "An Error Occurred Trying To Set the current history : ",
            currentHistory
          );
        }
      }

      // 2. Update offender main record
      const updated = await invoke<Offender>("update_offender", {
        offenderId: editingOffender.offenderId,
        full_name: editingOffender.full_name,
        national_id: editingOffender.national_id,
        date_of_birth: editingOffender.date_of_birth,
        gender: editingOffender.gender,
        notes: editingOffender.notes,
        fileId: editingOffender.file_id || null,
        penalty: editingOffender.penalty || null,
        penaltyNotes: editingOffender.penalty_notes || null,
        photo: photoBytes,
        photo_filename: photoFilename,
      });

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
        newHistory.filter((h) => h.id).map((h) => [h.id, h])
      );

      console.log("New ID", newById);

      // a) Add new records (no id)
      for (const h of newHistory) {
        if (!h.id) {
          console.log("Add New Offender Records", h);
          await invoke("add_offender_history", {
            offenderId: editingOffender.offenderId,
            file_id: h.file_id || null,
            case_id: h.case_id || null,
            offense_date: h.offense_date || null,
            penalty: h.penalty || null,
            penalty_notes: h.penalty_notes || null,
            notes: h.notes || null,
          });
        }
      }
      // b) Update existing records
      for (const h of newHistory) {
        console.log(" History record to update:", h);

        if (h.id) {
          // &&oldById[h.id]
          const response = await invoke("update_offender_history", {
            id: h.id,
            offenderId: editingOffender.offenderId,
            fileId: h.file_id || null,
            case_id: h.case_id || null,
            offense_date: h.offense_date || null,
            penalty: h.penalty || null,
            penalty_notes: h.penalty_notes || null,
            notes: h.notes || null,
          });

          console.log("Updated history record:", response);
        } else {
          console.log("Issues here : ", h.id, h, newHistory);
        }
      }
      // c) Delete removed records
      for (const old of currentHistory) {
        if (!newById[old.id]) {
          await invoke("delete_offender_history", { id: old.id });
        }
      }

      fetchOffenders();
      setOffenders((prev) =>
        prev.map((o) =>
          o.offender_id === editingOffender.offender_id ? updated : o
        )
      );
      setEditingOffender(null);
      setShowEdit(false);
    } catch (error) {
      console.error("Failed to update offender:", error);
    }
  };

  // Delete offender
  const handleDelete = async (id: number) => {
    try {
      await invoke("delete_offender", { offenderId: id });
      setOffenders((prev) => prev.filter((o) => o.offender_id !== id));
    } catch (error) {
      console.error("Failed to delete offender:", error);
    }
  };

  // Photo upload handler
  const handlePhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (isEdit && editingOffender) {
        setEditingOffender((prev) =>
          prev
            ? {
                ...prev,
                photo_url: url,
                photo_file: e.target.files![0],
              }
            : null
        );
      } else {
        setNewOffender((prev) => ({
          ...prev,
          photo_url: url,
          photo_file: e.target.files![0],
        }));
      }
    }
  };

  const OffenderCard = ({ offender }: { offender: Offender }) => (
    <Card className="w-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between w-full items-center gap-4">
          <div className="flex gap-3 items-center">
            <Avatar
              src={offender.photo_url}
              name={offender.full_name}
              size="lg"
              className="ring-2 ring-primary/20"
              fallback={<User className="w-6 h-6" />}
            />
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {offender.full_name}
              </h3>
              <p className="text-sm text-default-500">
                ID: {offender.national_id || "N/A"}
              </p>
              <div className="flex gap-2 mt-1">
                {offender.gender && (
                  <Chip size="sm" variant="flat" color="primary">
                    {offender.gender}
                  </Chip>
                )}
                <Chip size="sm" variant="flat" color="secondary">
                  {offenderHistory.length} cases
                </Chip>
              </div>
            </div>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
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
                  fetchPhoto(offender);
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
                Edit
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
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-2">
          {offender.date_of_birth && (
            <div className="flex items-center gap-2 text-sm text-default-600">
              <CreditCard className="w-4 h-4" />
              <span>
                Born: {new Date(offender.date_of_birth).toLocaleDateString()}
              </span>
            </div>
          )}

          {offender.penalty && (
            <div className="flex items-start gap-2 text-sm text-default-600 font-semibold">
              <OctagonAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Penalty: {offender.penalty}
                {/* {offender.penalty_notes && ` (${offender.penalty_notes})`} */}
              </span>
            </div>
          )}

          {offender.notes && (
            <div className="flex items-start gap-2 text-sm text-default-600">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{offender.notes}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-default-400">
            <span>
              Added:{" "}
              {offender.date_created
                ? new Date(offender.date_created).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Add Formik value type
  interface OffenderFormValues {
    offenderId?: number;
    full_name: string;
    national_id: string;
    date_of_birth: string;
    gender: string;
    notes: string;
    file_id?: string | number;
    photo_url?: string;
    photo_file?: File;
    penalty?: string;
    penalty_notes?: string;
  }

  const FormModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const data = isEdit ? editingOffender : newOffender;
    const setData = isEdit ? setEditingOffender : setNewOffender;
    const isOpen = isEdit ? showEdit : showAdd;
    const setIsOpen = isEdit ? setShowEdit : setShowAdd;
    const handleSave = isEdit ? handleUpdate : handleAdd;

    // For edit: use the full offenderHistory (with id) as initial history
    const initialHistory =
      isEdit && Array.isArray(offenderHistory) && offenderHistory.length > 0
        ? offenderHistory.map((h) => ({
            id: h.id,
            file_id: h.file_id,
            penalty: h.penalty,
            penalty_notes: h.penalty_notes,
          }))
        : [
            {
              id: data?.history?.[0]?.id || undefined,
              file_id: data?.file_id || undefined,
              penalty: data?.penalty || "",
              penalty_notes: data?.penalty_notes || "",
            },
          ];

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
          <ModalBody className="space-y-4 pb-6">
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
              enableReinitialize
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
                    photo_file: values.photo_file || prev?.photo_file,
                  }));
                } else {
                  setNewOffender((prev) => ({
                    ...prev,
                    ...values,
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
                      {({ field }: { field: any }) => (
                        <Input
                          type="date"
                          label="Date of Birth"
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          variant="bordered"
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
                  <Field name="notes">
                    {({ field }: { field: any }) => (
                      <Textarea
                        label="Notes"
                        placeholder="Add any additional notes..."
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        minRows={3}
                        variant="bordered"
                      />
                    )}
                  </Field>
                  {/* Link to File (Case) and Penalty as dynamic FieldArray */}
                  <FieldArray name="history">
                    {({ push, remove }) => (
                      <div className="space-y-2 mt-4">
                        {values.history && values.history.length > 0 ? (
                          values.history.map((h: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4"
                            >
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Select
                                  label="Link To Case"
                                  placeholder="Select a file/case"
                                  selectedKeys={
                                    h.file_id ? [String(h.file_id)] : []
                                  }
                                  onSelectionChange={(keys) =>
                                    setFieldValue(
                                      `history.${idx}.file_id`,
                                      keys.size > 0 &&
                                        !isNaN(Number(Array.from(keys)[0]))
                                        ? Number(Array.from(keys)[0])
                                        : null
                                    )
                                  }
                                  variant="bordered"
                                >
                                  {allCases.map((c) => (
                                    <SelectItem
                                      key={c.file_id}
                                      textValue={c.case_number}
                                    >
                                      <b>
                                        {c.case_number} - {c.case_type}
                                      </b>{" "}
                                      for {c.purpose}
                                    </SelectItem>
                                  ))}
                                </Select>
                                <Select
                                  label="Penalty"
                                  placeholder="Select penalty type"
                                  selectedKeys={h.penalty ? [h.penalty] : []}
                                  onSelectionChange={(keys) =>
                                    setFieldValue(
                                      `history.${idx}.penalty`,
                                      Array.from(keys)[0]
                                    )
                                  }
                                  variant="bordered"
                                >
                                  <SelectItem key="Fine">Fine</SelectItem>
                                  <SelectItem key="Locked Up">
                                    Locked Up
                                  </SelectItem>
                                  <SelectItem key="Community Service">
                                    Community Service
                                  </SelectItem>
                                  <SelectItem key="Probation">
                                    Probation
                                  </SelectItem>
                                  <SelectItem key="Other">Other</SelectItem>
                                </Select>
                                <Textarea
                                  label="Penalty Notes"
                                  placeholder="Add any additional info about the penalty..."
                                  value={h.penalty_notes || ""}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `history.${idx}.penalty_notes`,
                                      e.target.value
                                    )
                                  }
                                  minRows={2}
                                  variant="bordered"
                                />
                              </div>
                              <div className="flex gap-2 items-end">
                                {idx === 0 ? (
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color="primary"
                                    variant="light"
                                    onPress={() =>
                                      push({
                                        file_id: null,
                                        penalty: "",
                                        penalty_notes: "",
                                      })
                                    }
                                    aria-label="Add Case/Penalty"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onPress={() => remove(idx)}
                                    aria-label="Remove Case/Penalty"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <Button
                            size="sm"
                            color="primary"
                            variant="bordered"
                            onPress={() =>
                              push({
                                file_id: null,
                                penalty: "",
                                penalty_notes: "",
                              })
                            }
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Case/Penalty
                          </Button>
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
      invoke<any[]>("list_offender_history", {
        offenderId: selected.offender_id,
      })
        .then((data) => {
          console.log("Log -> Fetched offender history:", data);
          setOffenderHistory(data || []);
        })
        .catch((error) => {
          console.log("Failed to load offender history:", error);
          setOffenderHistory([]);
        });
    } else {
      setOffenderHistory([]);
    }
  }, [selected]);

  // Filtered history for search
  const filteredHistory = offenderHistory.filter((h) => {
    const q = historySearch.toLowerCase();
    return (
      (h.penalty || "").toLowerCase().includes(q) ||
      (h.penalty_notes || "").toLowerCase().includes(q) ||
      (h.notes || "").toLowerCase().includes(q) ||
      (h.offense_date || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Offender Records
              </h1>
              <p className="text-default-500">
                Manage and track offender information
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Offenders</p>
                    <p className="text-2xl font-bold">{offenders.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Cases</p>
                    <p className="text-2xl font-bold">
                      {/* The file_id arrays in offenders */}
                      {offenders.filter((o) => o.file_id).length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-200" />
                </div>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Male</p>
                    <p className="text-2xl font-bold">
                      {offenders.filter((o) => o.gender === "Male").length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-purple-200" />
                </div>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100">Female</p>
                    <p className="text-2xl font-bold">
                      {offenders.filter((o) => o.gender === "Female").length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-pink-200" />
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
                  placeholder="Search by name or ID..."
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
                  <SelectItem key="" value="">
                    All Genders
                  </SelectItem>
                  <SelectItem key="Male" value="Male">
                    Male
                  </SelectItem>
                  <SelectItem key="Female" value="Female">
                    Female
                  </SelectItem>
                  <SelectItem key="Other" value="Other">
                    Other
                  </SelectItem>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  startContent={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
                <Button
                  color="primary"
                  onPress={() => setShowAdd(true)}
                  startContent={<Plus className="w-4 h-4" />}
                  className="bg-gradient-to-r from-primary to-primary-600"
                >
                  Add Offender
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

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
              <ModalBody className="p-6">
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
                                link.href = selected.photo_url;
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
                          {/* Calculate cases by counting the number of files */}
                          {
                            allCases.filter(
                              (c) => c.file_id === selected.file_id
                            ).length
                          }{" "}
                          case
                          {allCases.filter(
                            (c) => c.file_id === selected.file_id
                          ).length > 1
                            ? "s"
                            : ""}
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
                          Penalty:{" "}
                        </span>
                        <span className="font-medium">
                          {selected.penalty}
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
                    const filteredHistory = offenderHistory.filter((h) => {
                      const q = historySearch.toLowerCase();
                      return (
                        (h.penalty || "").toLowerCase().includes(q) ||
                        (h.penalty_notes || "").toLowerCase().includes(q) ||
                        (h.notes || "").toLowerCase().includes(q) ||
                        (h.offense_date || "").toLowerCase().includes(q)
                      );
                    });

                    console.log("Filtered History: ", filteredHistory);
                    console.log(" Offender History: ", offenderHistory);
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
                          return (
                            <Card key={h.id || idx} className="bg-default-50">
                              <CardBody className="p-3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                  <div>
                                    <div className="font-medium">
                                      {linkedFile ? (
                                        <>
                                          <span className="text-primary font-semibold">
                                            {linkedFile.case_number}
                                          </span>
                                          <span className="ml-2 text-default-500">
                                            {linkedFile.case_type} -{" "}
                                            {linkedFile.purpose}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-default-400">
                                          No linked case
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-default-600 mt-1">
                                      Penalty:{" "}
                                      <span className="font-semibold">
                                        {h.penalty || "-"}
                                      </span>
                                      {h.penalty_notes && (
                                        <span className="ml-2 text-default-500">
                                          ({h.penalty_notes})
                                        </span>
                                      )}
                                    </div>
                                    {h.notes && (
                                      <div className="text-xs text-default-500 mt-1">
                                        Notes: {h.notes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                                    <Chip className="text-xs text-blue-400">
                                      {h.created_at
                                        ? new Date(h.created_at)
                                            .toJSON()
                                            .slice(0, 10)
                                            .split("-")
                                            .reverse()
                                            .join("-")
                                        : "No date"}
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
