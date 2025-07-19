import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import {
  Bell,
  Clock,
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/auth_context";
import { markNotificationAsRead } from "../services/notifications";
import { notifications as Notifications } from "./notifications_data";
import { staff } from "./staff_data";

const RightPanel = () => {
  const { authData } = useAuth();
  const [notifications, setNotifications] = useState<any[]>(Notifications);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const markNotification = async (notification_id: number) => {
    try {
      const response: any = await markNotificationAsRead(notification_id);
      if (response.error) {
        throw new Error(response.error);
      }

      // Remove the notification from the list
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.notification_id !== notification_id)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const unreadNotifications = notifications.filter((n) => !n.read_status);
  const displayedNotifications = showAllNotifications
    ? notifications
    : unreadNotifications;

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      staffFilter === "all" ||
      s.role.toLowerCase().includes(staffFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return "🚨";
      case "case":
        return "📋";
      case "deadline":
        return "⏰";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "danger";
      case "case":
        return "primary";
      case "deadline":
        return "warning";
      case "system":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "busy":
        return "warning";
      case "away":
        return "secondary";
      case "offline":
        return "default";
      default:
        return "default";
    }
  };

  const staffRoles = [...new Set(staff.map((s) => s.role))];

  return (
    <div className="p-3 space-y-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Activity Panel
        </h1>
      </div>

      {/* Notifications Section */}
      {authData?.user?.role === "Super Admin" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notifications
              </h2>
              {unreadNotifications.length > 0 && (
                <Chip
                  size="sm"
                  variant="bordered"
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  {unreadNotifications.length} Unread
                </Chip>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="light"
                onPress={() => setShowAllNotifications(!showAllNotifications)}
                className="text-xs"
              >
                {showAllNotifications ? "Unread" : "All"}
              </Button>
              {unreadNotifications.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={markAllAsRead}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[300px] space-y-2">
            {displayedNotifications.length === 0 ? (
              <Card className="p-3 border-dashed border-2 dark:border-gray-700">
                <CardBody className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      No notifications right now
                    </p>
                    <p className="text-xs text-gray-400">
                      You're all caught up!
                    </p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              displayedNotifications.map((n) => (
                <Card
                  key={n.notification_id}
                  className={`p-2 border shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                    n.read_status ? "opacity-60" : ""
                  }`}
                >
                  <CardBody className="relative">
                    <div className="flex justify-end absolute right-1 top-1 z-10">
                      <button
                        onClick={() => markNotification(n.notification_id)}
                        className="w-6 h-6 rounded-full hover:bg-foreground/10 transition flex items-center justify-center"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3 h-3 text-foreground/60 hover:text-foreground" />
                      </button>
                    </div>

                    <div className="flex items-start gap-3 pr-6">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">
                          {getNotificationIcon(n.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={getNotificationColor(n.type)}
                            className="text-xs"
                          >
                            {n.type || "General"}
                          </Chip>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(n.date_created).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Staff Directory Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Staff Directory
            </h2>
            <Chip size="sm" variant="bordered" className="text-xs">
              {filteredStaff.length}
            </Chip>
          </div>
          <Button
            size="sm"
            variant="light"
            onPress={() =>
              setStaffFilter(staffFilter === "all" ? "judge" : "all")
            }
            className="text-xs"
            startContent={<Filter className="w-3 h-3" />}
          >
            {staffFilter === "all" ? "All" : "Filtered"}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={staffFilter === "all" ? "solid" : "flat"}
              color={staffFilter === "all" ? "primary" : "default"}
              onPress={() => setStaffFilter("all")}
              className="text-xs"
            >
              All ({staff.length})
            </Button>
            {staffRoles.slice(0, 3).map((role) => (
              <Button
                key={role}
                size="sm"
                variant={staffFilter === role ? "solid" : "flat"}
                color={staffFilter === role ? "primary" : "default"}
                onPress={() => setStaffFilter(role)}
                className="text-xs"
              >
                {role} ({staff.filter((s) => s.role === role).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Staff List */}
        <div className="overflow-y-auto max-h-[400px]">
          {filteredStaff.length === 0 ? (
            <Card className="p-3 border-dashed border-2 dark:border-gray-700">
              <CardBody className="text-center">
                <div className="flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-500">No staff found</p>
                  <p className="text-xs text-gray-400">
                    Try adjusting your search or filter
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Accordion className="space-y-1">
              {filteredStaff.map((s) => (
                <AccordionItem
                  key={s.staff_id}
                  aria-label={`${s.name} - ${s.role}`}
                  startContent={
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        name={s.name}
                        className="text-xs"
                        color={getStaffStatusColor(s.status)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-gray-500">{s.role}</span>
                      </div>
                    </div>
                  }
                  subtitle={
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        size="sm"
                        variant="dot"
                        color={getStaffStatusColor(s.status)}
                      >
                        {s.status || "Active"}
                      </Chip>
                    </div>
                  }
                  className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2 p-2"
                >
                  <div className="space-y-3 p-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {s.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {s.phone_number}
                      </span>
                    </div>

                    {s.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {s.department}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Phone className="w-3 h-3" />}
                        className="text-xs"
                        onPress={() =>
                          window.open(`tel:${s.phone_number}`, "_self")
                        }
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        startContent={<Mail className="w-3 h-3" />}
                        className="text-xs"
                        onPress={() =>
                          window.open(`mailto:${s.email}`, "_blank")
                        }
                      >
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        startContent={<MessageCircle className="w-3 h-3" />}
                        className="text-xs"
                        onPress={() =>
                          window.open(
                            `https://wa.me/${s.phone_number.replace(
                              /\D/g,
                              ""
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
