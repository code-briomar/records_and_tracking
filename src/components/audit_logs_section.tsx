import {
    Button,
    Chip,
    ChipProps,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
    User,
} from "@heroui/react";

import {Archive, Eye, Trash2} from "lucide-react";
import React, { useState} from "react";
import ViewNotificationModal from "./view_notification_modal.tsx";
import ArchiveNotificationModal from "./archive_notification_modal.tsx";
import DeleteNotificationModal from "./delete_notification_modal.tsx";
import {notifications} from "./notifications_data.tsx";
import {staff} from "./staff_data.ts";
export const columns = [
    { name: "Message", uid: "message" },
    { name: "Assigned To", uid: "type" },
    { name: "Status", uid: "read" },
    { name: "Date", uid: "date" },
    { name: "Actions", uid: "actions" },
];

const statusColorMap: Record<string | number, ChipProps["color"]> = {
    true: "success",
    false: "danger",
};

type Notification = (typeof notifications)[0];

export default function AuditLogsSection() {

    const [notification_id, setNotificationID] = useState<number>(0);
    // View Notification Modal
    const { isOpen:isOpenView, onOpen:onOpenView, onOpenChange:onOpenViewChange } = useDisclosure();

    // Archive Notification Modal
    const {isOpen:isOpenArchive,onOpen:onOpenArchive,onOpenChange:onOpenArchiveChange} = useDisclosure();

    // Delete Notification Modal
    const {isOpen:isOpenDelete,onOpen:onOpenDelete,onOpenChange:onOpenDeleteChange} = useDisclosure();

    const renderCell = React.useCallback(
        (notification: Notification, columnKey: React.Key) => {
            const cellValue = notification[columnKey as keyof Notification];


            switch (columnKey) {
                case "message":
                    return (
                        <User
                            avatarProps={{ radius: "lg", src: "" }}
                            description={notification.notification_type}
                            name={cellValue}
                        >
                            {notification.message}
                        </User>
                    );
                case "type":
                    const user = staff.filter(user => user.user_id === notification.user_id)[0];
                    console.log(user);
                    return (
                        <div className="flex flex-col">
                            <p className="text-bold text-sm capitalize">{cellValue}</p>
                            <p className="text-bold text-sm capitalize text-default-400">
                                {
                                   user?.name ? user?.name : "Staff"
                                }
                            </p>
                        </div>
                    );
                case "read":
                    return (
                        <Chip
                            className="capitalize"
                            color={statusColorMap[notification.read_status.toString()]}
                            size="sm"
                            variant="flat"
                        >
                            {cellValue ? "Read" : "Unread"}
                        </Chip>
                    );

                case "date":
                    return (
                        <div className="flex flex-col">
                            <p className="text-bold text-sm capitalize">{cellValue}</p>
                            <p className="text-bold text-sm capitalize text-default-400">
                                {notification.date_created}
                            </p>
                        </div>
                    );

                case "actions":
                    const handleViewNotification = () =>{
                        setNotificationID(notification.notification_id);
                        onOpenView();
                    }

                    const handleArchiveNotification = () =>{
                        setNotificationID(notification.notification_id);
                        onOpenArchive();
                    }

                    const handleDeleteNotification = () =>{
                        setNotificationID(notification.notification_id);
                        onOpenDelete();
                    }
                    return (
                        <div className="relative flex items-center gap-2">
                            <Tooltip content="Details">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-default-400 cursor-pointer active:opacity-50"
                                    onPress={handleViewNotification}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Archive">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-default-400 cursor-pointer active:opacity-50"
                                    onPress={handleArchiveNotification}
                                >
                                    <Archive className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip color="danger" content="Delete Notification">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-danger cursor-pointer active:opacity-50"
                                    onPress={handleDeleteNotification}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    );
                default:
                    return cellValue;
            }
        },
        []
    );

    return (
        <>
            <Table aria-label="Example table with custom cells">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={notifications}>
                    {(item) => (
                        <TableRow key={item.notification_id}>
                            {(columnKey) => (
                                <TableCell>{renderCell(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Modals */}
            <ViewNotificationModal
                notification_id={notification_id}
                isOpen={isOpenView}
                onOpenChange={onOpenViewChange}
            />
            <ArchiveNotificationModal
                notification_id={notification_id}
                isOpen={isOpenArchive}
                onOpenChange={onOpenArchiveChange}
            />
            <DeleteNotificationModal
                notification_id={notification_id}
                isOpen={isOpenDelete}
                onOpenChange={onOpenDeleteChange}
            />


        </>
    );
}
