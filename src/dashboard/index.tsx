import {
  addToast,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Gavel,
  Target,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import React from "react";
import { fileSectionData } from "../components/files_data";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";

import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context";

export default function Dashboard() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.user?.role, "Dashboard"];

  const [selected, setSelected] = React.useState("overview");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Listen for offender creation events to refresh dashboard
  React.useEffect(() => {
    const handleOffenderEvent = (event: CustomEvent) => {
      console.log(
        `Dashboard: ${event.type} event received, refreshing data...`,
        event.detail
      );

      // Trigger a refresh by updating the refresh key
      setRefreshKey((prev) => prev + 1);

      // Show toast notification
      const eventTypeMap = {
        "offender-created": {
          message: "New offender added",
          color: "success" as const,
        },
        "offender-updated": {
          message: "Offender updated",
          color: "primary" as const,
        },
        "offender-deleted": {
          message: "Offender deleted",
          color: "warning" as const,
        },
      };

      const eventInfo = eventTypeMap[event.type as keyof typeof eventTypeMap];
      if (eventInfo) {
        addToast({
          title: "Dashboard Updated",
          description: eventInfo.message,
          color: eventInfo.color,
        });
      }
    };

    // Add event listeners for all offender events
    window.addEventListener(
      "offender-created",
      handleOffenderEvent as EventListener
    );
    window.addEventListener(
      "offender-updated",
      handleOffenderEvent as EventListener
    );
    window.addEventListener(
      "offender-deleted",
      handleOffenderEvent as EventListener
    );

    // Cleanup on unmount
    return () => {
      window.removeEventListener(
        "offender-created",
        handleOffenderEvent as EventListener
      );
      window.removeEventListener(
        "offender-updated",
        handleOffenderEvent as EventListener
      );
      window.removeEventListener(
        "offender-deleted",
        handleOffenderEvent as EventListener
      );
    };
  }, []);

  // const this_week_date_range = {
  //   start: new Date(
  //     new Date().setDate(new Date().getDate() - 7)
  //   ).toLocaleDateString("en-US", {
  //     month: "2-digit",
  //     day: "2-digit",
  //     year: "numeric",
  //   }),
  //   end: new Date().toLocaleDateString("en-US", {
  //     month: "2-digit",
  //     day: "2-digit",
  //     year: "numeric",
  //   }),
  // };

  const today = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const todayFiles = fileSectionData.filter((file) => {
    const requiredOnDate = new Date(file.required_on).toLocaleDateString(
      "en-US",
      {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }
    );
    return requiredOnDate === today;
  });

  const upcomingFiles = fileSectionData.filter((file) => {
    const requiredOnDate = new Date(file.required_on);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return requiredOnDate >= today && requiredOnDate <= nextWeek;
  });

  const overdueFiles = fileSectionData.filter((file) => {
    const requiredOnDate = new Date(file.required_on);
    const today = new Date();
    return requiredOnDate < today && !file.date_returned;
  });

  const completedFiles = fileSectionData.filter((file) => file.date_returned);

  const getDashboardStats = () => {
    return {
      totalCases: fileSectionData.length,
      todayCases: todayFiles.length,
      upcomingCases: upcomingFiles.length,
      overdueCases: overdueFiles.length,
      completedCases: completedFiles.length,
      completionRate: Math.round(
        (completedFiles.length / fileSectionData.length) * 100
      ),
    };
  };

  const stats = getDashboardStats();

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (file: any) => {
    if (file.date_returned)
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (new Date(file.required_on) < new Date())
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const navigate = useNavigate();

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total Cases
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalCases}
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Today's Cases
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.todayCases}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Overdue
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {stats.overdueCases}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats.completionRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderWelcomeBanner = () => (
    <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {authData?.user?.name}!
            </h1>
            {/* <p className="text-indigo-100">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-indigo-200 text-sm mt-1">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p> */}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={
                  document.documentElement.classList.contains("dark")
                    ? "/logo/icon-dark.png"
                    : "/logo/icon-light.png"
                }
                alt="Kilungu Law Courts Logo"
                className="w-12 h-12"
              />
              <span className="text-sm">Kilungu Law Courts</span>
            </div>
            <Chip size="sm" variant="flat" className="bg-white/20 text-white">
              {authData?.user?.role}
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderTodaysCases = () => (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Gavel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Today's Cases</h3>
            <p className="text-sm text-gray-500">
              {todayFiles.length} cases scheduled for today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge content={todayFiles.length} color="primary" />
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={() => navigate("/diary")}
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {todayFiles.length > 0 ? (
          <div className="space-y-4">
            {todayFiles.slice(0, 3).map((file, index) => (
              <Card key={index} className="bg-gray-50 dark:bg-gray-800/50">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {file.case_number || "Case #" + file.file_id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {file.purpose}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={getPriorityColor(file.priority)}
                        variant="flat"
                      >
                        {file.priority || "Normal"}
                      </Chip>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => navigate("/cts")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {file.current_location}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(file.required_on).toLocaleDateString()}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
            {todayFiles.length > 3 && (
              <div className="text-center">
                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => navigate("/diary")}
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  View {todayFiles.length - 3} more cases
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No cases today
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enjoy your free day! Check back tomorrow for new cases.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="flat"
            color="primary"
            onPress={() => navigate("/cts")}
            startContent={<FileText className="w-4 h-4" />}
            className="h-12"
          >
            New Case
          </Button>
          <Button
            variant="flat"
            color="secondary"
            onPress={() => navigate("/diary")}
            startContent={<Calendar className="w-4 h-4" />}
            className="h-12"
          >
            Court Diary
          </Button>
          <Button
            variant="flat"
            color="success"
            onPress={() => navigate("/offenders")}
            startContent={<Users className="w-4 h-4" />}
            className="h-12"
          >
            Offenders
          </Button>
          <Button
            variant="flat"
            color="warning"
            onPress={() => navigate("/tools")}
            startContent={<Download className="w-4 h-4" />}
            className="h-12"
          >
            Export Data
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest system activities</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {fileSectionData.slice(0, 4).map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <Avatar
                size="sm"
                name={file.uploaded_by?.toString() || "U"}
                className="bg-blue-500 text-white"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Case {file.case_number || file.file_id} was updated
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(file.date_recieved).toLocaleDateString()}
                </p>
              </div>
              <Timer className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  // const navigate = useNavigate();

  return (
    <>
      <Card
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('light-bg.png')] dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection breadcrumbs={breadcrumbs} />

            {/* Main Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
              {authData?.user?.role === "Super Admin" ||
              authData?.user?.role === "Court Admin" ? (
                <div className="space-y-6">
                  {/* Welcome Banner */}
                  {renderWelcomeBanner()}

                  {/* Stats Cards */}
                  {renderStatsCards()}

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Cases - Takes 2 columns */}
                    <div className="lg:col-span-2">{renderTodaysCases()}</div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Quick Actions */}
                      {renderQuickActions()}

                      {/* Recent Activity */}
                      {renderRecentActivity()}
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              Case Analytics
                            </h3>
                            <p className="text-sm text-gray-500">
                              Performance metrics
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Completion Rate
                              </span>
                              <span className="text-sm text-gray-500">
                                {stats.completionRate}%
                              </span>
                            </div>
                            <Progress
                              value={stats.completionRate}
                              color="success"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Cases This Week
                              </span>
                              <span className="text-sm text-gray-500">
                                {upcomingFiles.length}
                              </span>
                            </div>
                            <Progress
                              value={(upcomingFiles.length / 20) * 100}
                              color="primary"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              Attention Required
                            </h3>
                            <p className="text-sm text-gray-500">
                              Items needing immediate action
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium">
                                Overdue Cases
                              </span>
                            </div>
                            <Badge
                              content={stats.overdueCases}
                              color="danger"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">
                                Due Today
                              </span>
                            </div>
                            <Badge content={stats.todayCases} color="warning" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              ) : (
                // Staff Dashboard
                <div className="space-y-6">
                  {renderWelcomeBanner()}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardBody className="text-center py-12">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          Welcome to Kilungu Law Courts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Your gateway to the court records and tracking system
                        </p>
                        <Button
                          color="primary"
                          size="lg"
                          onPress={() => navigate("/diary")}
                          endContent={<ArrowRight className="w-5 h-5" />}
                        >
                          View Court Diary
                        </Button>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          Staff Directory
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Access contact information and staff details
                        </p>
                        <Button
                          color="success"
                          size="lg"
                          onPress={() => navigate("/staff")}
                          endContent={<ArrowRight className="w-5 h-5" />}
                        >
                          View Staff
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </div>
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
