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
import { Field, Form, Formik, FormikHelpers } from "formik";
import {
  Camera,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

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
        photo: photoBytes,
        photoFilename,
      });

      console.log("Created offender:", created);

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
    // if (!editingOffender || !editingOffender.offender_id) return;

    try {
      let photoBytes = undefined;
      let photoFilename = undefined;

      if (editingOffender.photo_file) {
        photoBytes = await editingOffender.photo_file.arrayBuffer();
        photoBytes = Array.from(new Uint8Array(photoBytes));
        photoFilename = editingOffender.photo_file.name;
      }

      console.log("Updating offender:", editingOffender);

      const updated = await invoke<Offender>("update_offender", {
        offenderId: editingOffender.offenderId,
        full_name: editingOffender.full_name,
        national_id: editingOffender.national_id,
        date_of_birth: editingOffender.date_of_birth,
        gender: editingOffender.gender,
        notes: editingOffender.notes,
        fileId: editingOffender.file_id || null,
        photo: photoBytes,
        photo_filename: photoFilename,
      });
      fetchOffenders();

      console.log("Updated offender:", updated);

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
        <div className="flex justify-between items-start">
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
                  {offender.cases?.length || 0} cases
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
              Born: {new Date(offender.date_of_birth).toLocaleDateString()}
            </div>
          )}
          {offender.notes && (
            <div className="flex items-start gap-2 text-sm text-default-600">
              <FileText className="w-4 h-4 mt-0.5" />
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
    full_name: string;
    national_id: string;
    date_of_birth: string;
    gender: string;
    notes: string;
    photo_url?: string;
    photo_file?: File;
  }

  const FormModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const data = isEdit ? editingOffender : newOffender;
    const setData = isEdit ? setEditingOffender : setNewOffender;
    const isOpen = isEdit ? showEdit : showAdd;
    const setIsOpen = isEdit ? setShowEdit : setShowAdd;
    const handleSave = isEdit ? handleUpdate : handleAdd;

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
                photo_url: data?.photo_url || "",
                photo_file: data?.photo_file || undefined,
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
                  {/* Link to File Dropdown (single select) */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Link to File (Case)
                    </label>
                    <Select
                      label="Select a file to link"
                      placeholder="Select a file/case"
                      selectedKeys={
                        values.file_id ? [String(values.file_id)] : []
                      }
                      onSelectionChange={(keys) => {
                        const selectedId = Number(Array.from(keys)[0]);
                        setFieldValue("file_id", selectedId);
                      }}
                      variant="bordered"
                    >
                      {allCases.map((c) => (
                        <SelectItem key={c.file_id} textValue={c.case_number}>
                          <b>
                            {c.case_number} - {c.case_type}
                          </b>{" "}
                          for {c.purpose}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
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
                      {offenders.reduce(
                        (acc, o) => acc + (o.cases?.length || 0),
                        0
                      )}
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
                    <Avatar
                      src={selected.photo_url}
                      name={selected.full_name}
                      size="xl"
                      className="w-32 h-32 ring-4 ring-primary/20"
                      fallback={<User className="w-16 h-16" />}
                    />
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
                          {selected.cases?.length || 0} cases
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

                    <Divider />

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Case History
                      </h3>
                      {selected.file_id ? (
                        (() => {
                          const linkedFile = allCases.find(
                            (c) => c.file_id === selected.file_id
                          );
                          // Example
                          //                           {
                          //     "file_id": 1,
                          //     "case_number": "CS1",
                          //     "case_type": "Civil",
                          //     "purpose": "Judgement",
                          //     "uploaded_by": 1,
                          //     "current_location": "wefqwef",
                          //     "notes": "Lock Him Up....He did it",
                          //     "date_recieved": "2025-06-19 16:10:14",
                          //     "required_on": "2025-06-27T00:00:00.000Z",
                          //     "required_on_signature": null,
                          //     "date_returned": null,
                          //     "date_returned_signature": null,
                          //     "deleted": 0
                          // }
                          return linkedFile ? (
                            <Card className="bg-default-50">
                              <CardBody className="p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      {linkedFile.case_number}
                                    </p>
                                    <p className="text-sm text-default-500">
                                      {linkedFile.case_type} -{" "}
                                      {linkedFile.purpose}
                                    </p>
                                    <p className="text-sm text-default-600">
                                      {linkedFile.notes}
                                    </p>
                                  </div>
                                  <Chip size="sm" variant="flat">
                                    {linkedFile.year}
                                  </Chip>
                                </div>
                              </CardBody>
                            </Card>
                          ) : (
                            <div className="text-center py-6 text-default-400">
                              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>No case linked to this offender</p>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-center py-6 text-default-400">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No case linked to this offender</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
}
