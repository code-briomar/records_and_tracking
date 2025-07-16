import {
  addToast,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
} from "@heroui/react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Gavel,
  Target,
  Users,
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

  console.log(selected, setSelected, refreshKey, currentTime);

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
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Cases
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalCases}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Today's Cases
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.todayCases}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overdue
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.overdueCases}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completionRate}%
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderWelcomeBanner = () => (
    <Card className="mb-6 bg-gray-900 dark:bg-gray-800 text-white border border-gray-800 dark:border-gray-700">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {authData?.user?.name}!
            </h1>
            {/* <p className="text-gray-300">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-400 text-sm mt-1">
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
            <Chip
              size="sm"
              variant="flat"
              className="bg-gray-700 text-gray-200 dark:bg-gray-600 dark:text-gray-300"
            >
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
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Gavel className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Today's Cases</h3>
            <p className="text-sm text-gray-500">
              {todayFiles.length} cases scheduled for today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="primary">{todayFiles.length}</Badge>
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
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {/* Today's Cases - Takes 2 columns */}
                    <div className="lg:col-span-2">{renderTodaysCases()}</div>

                    {/* Right Column */}
                    {/* <div className="space-y-6"> */}
                    {/* Quick Actions */}
                    {/* {renderQuickActions()} */}
                    {/* </div> */}
                  </div>
                  {/* Analytics Section */}
                  {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                  </div> */}
                </div>
              ) : (
                // Staff Dashboard
                <div className="space-y-6">
                  {renderWelcomeBanner()}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardBody className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-10 h-10 text-gray-600 dark:text-gray-400" />
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
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-gray-600 dark:text-gray-400" />
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
