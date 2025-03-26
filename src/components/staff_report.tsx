import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const attendanceData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Attendance (%)",
      data: [92, 85, 88, 95, 90, 87],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
  ],
};

const leaveData = {
  labels: ["Sick Leave", "Vacation", "Unpaid Leave", "Maternity/Paternity"],
  datasets: [
    {
      data: [10, 20, 5, 8],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const StaffReport = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Staff Attendance Chart */}
      <Card className="p-4 shadow-md">
        <CardHeader className="font-semibold text-lg">
          Staff Attendance Overview
        </CardHeader>
        <CardBody>
          <Bar data={attendanceData} options={chartOptions} />
        </CardBody>
      </Card>

      {/* Leave Distribution Chart */}
      <Card className="p-4 shadow-md">
        <CardHeader className="font-semibold text-lg">
          Leave Type Distribution
        </CardHeader>
        <CardBody>
          <Pie data={leaveData} options={chartOptions} />
        </CardBody>
      </Card>
    </div>
  );
};

export default StaffReport;
