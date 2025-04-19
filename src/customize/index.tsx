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

import { Archive, Eye, Trash2 } from "lucide-react";
import React from "react";
import {notifications} from "../components/notifications_data.tsx";
import CustomModal from "../components/modal.tsx";
export const columns = [
    { name: "Message", uid: "message" },
    { name: "Type", uid: "type" },
    { name: "Read?", uid: "read" },
    { name: "Date", uid: "date" },
    { name: "Actions", uid: "actions" },
];

const statusColorMap: Record<string | number, ChipProps["color"]> = {
    true: "success",
    false: "danger",
};

type Notification = (typeof notifications)[0];

export default function Customize() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const renderCell = React.useCallback(
        (notification: Notification, columnKey: React.Key) => {
            const cellValue = notification[columnKey as keyof Notification];

            switch (columnKey) {
                case "message":
                    return (
                        <User
                            avatarProps={{ radius: "lg", src: "" }}
                            description={notification.message}
                            name={cellValue}
                        >
                            {notification.message}
                        </User>
                    );
                case "type":
                    return (
                        <div className="flex flex-col">
                            <p className="text-bold text-sm capitalize">{cellValue}</p>
                            <p className="text-bold text-sm capitalize text-default-400">
                                {notification.notification_id}
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
                    return (
                        <div className="relative flex items-center gap-2">
                            <Tooltip content="Details">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-default-400 cursor-pointer active:opacity-50"
                                    onPress={onOpen}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Archive">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-default-400 cursor-pointer active:opacity-50"
                                    onPress={onOpen}
                                >
                                    <Archive className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip color="danger" content="Delete Notification">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-xs text-danger cursor-pointer active:opacity-50"
                                    onPress={onOpen}
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

            {/* Custom Modal Placement */}
            <CustomModal
                onOpen={onOpen}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            />
        </>
    );
}
