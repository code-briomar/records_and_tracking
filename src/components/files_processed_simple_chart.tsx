"use client"; // Needed for Next.js App Router

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["Mon", "Tue", "Wed", "Thur", "Fri"],
  datasets: [
    {
      data: [10, 20, 30, 40, 10], // Example financial data
      backgroundColor: "#233255", // Tailwind Green-500
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: 0,
      borderRadius: 10, // 🔥 Adds rounded corners
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { raw: any }) => `${context.raw} files`, // Format tooltip values
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      grid: { display: false },
      beginAtZero: true,
    },
  },
};

export const FilesProcessedChart = () => {
  return (
    <div className="p-4 bg-background/60 dark:bg-default-100/50 w-3/4 h-1/2 cursor-pointer rounded-lg">
      <div className="flex space-x-1 items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700" id="primary-color">
          Files Processed
        </h2>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};
