import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardService from "../../services/dashboard.service";
import {
  Users,
  Building2,
  Award,
  FileCheck,
  TrendingUp,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Skeleton } from "primereact/skeleton";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

// Types
interface MonthlyUser {
  month: string;
  count: number;
}

interface DashboardData {
  totalCertificationRequests: number;
  totalCertifications: number;
  totalUsers: number;
  totalCompanies: number;
  totalActiveUsers: number;
  totalInActiveUsers: number;
  totalActiveCompany: number;
  totalInActiveCompany: number;
  totalCommitee: number;
  totalActiveCommitee: number;
  totalInActiveCommitee: number;
  totalMenu: number;
  totalSubmittedRequest: number;
  totalRejectedRequest: number;
  inProgressRequest: number;
  totalCompletedRequest: number;
  userLastSixMonth: MonthlyUser[];
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await DashboardService.getDashboardData();
      setDashboardData(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard data";
      setError(errorMessage);
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart configurations
  const getUserGrowthChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };

    return {
      labels: dashboardData.userLastSixMonth.map((item) => item.month),
      datasets: [
        {
          label: "Users",
          data: dashboardData.userLastSixMonth.map((item) => item.count),
          borderColor: "#6366F1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#6366F1",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getUserStatusChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };

    return {
      labels: ["Active Users", "Inactive Users"],
      datasets: [
        {
          data: [
            dashboardData.totalActiveUsers,
            dashboardData.totalInActiveUsers,
          ],
          backgroundColor: ["#10B981", "#6B7280"],
          borderColor: ["#fff", "#fff"],
          borderWidth: 2,
        },
      ],
    };
  };

  const getCompanyStatusChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };

    return {
      labels: ["Active Companies", "Inactive Companies"],
      datasets: [
        {
          data: [
            dashboardData.totalActiveCompany,
            dashboardData.totalInActiveCompany,
          ],
          backgroundColor: ["#10B981", "#6B7280"],
          borderColor: ["#fff", "#fff"],
          borderWidth: 2,
        },
      ],
    };
  };

  const getRequestStatusChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };

    return {
      labels: ["In Progress", "Completed", "Submitted", "Rejected"],
      datasets: [
        {
          label: "Number of Requests",
          data: [
            dashboardData.inProgressRequest,
            dashboardData.totalCompletedRequest,
            dashboardData.totalSubmittedRequest,
            dashboardData.totalRejectedRequest,
          ],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: ["#3B82F6", "#10B981", "#8B5CF6", "#EF4444"],
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1F2937",
        bodyColor: "#6B7280",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            label += context.parsed.y || context.parsed;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            return `Users: ${context.parsed.y}`;
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1F2937",
        bodyColor: "#6B7280",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-4 md:p-6">
    <div className="px-3 py-3 md:px-6 md:py-6 max-w-8xl w mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton width="200px" height="32px" />
      </div>

      {/* Stats Cards Skeleton - Matching your card format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="bg-white rounded-b-md rounded-t-md border border-indigo-100 p-3">
            <div className="flex items-center justify-between mb-3">
              <Skeleton width="80px" height="16px" />
              <Skeleton shape="circle" size="36px" />
            </div>
            <div className="mx-auto text-center">
              <Skeleton width="60px" height="28px" className="mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {[1, 2].map((item) => (
          <div key={item} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton shape="circle" size="28px" />
                <Skeleton width="100px" height="20px" />
              </div>
              <Skeleton width="80px" height="16px" />
            </div>
            <Skeleton height="280px" />
          </div>
        ))}
      </div>

      {/* Status Distribution Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((item) => (
          <div key={item} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton shape="circle" size="28px" />
              <Skeleton width="120px" height="20px" />
            </div>
            <Skeleton height="280px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
  if (loading) {
    return <LoadingSkeleton />;
  }
  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Failed to Load Data
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {error || "Unable to fetch dashboard data"}
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards: StatCard[] = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
    },
    {
      title: "Total Active Users",
      value: dashboardData.totalActiveUsers,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Total Inprogress Request",
      value: dashboardData.inProgressRequest,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
    },
    {
      title: "Total Companies",
      value: dashboardData.totalCompanies,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      title: "Total Certification Requests",
      value: dashboardData.totalCertificationRequests,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      title: "Certifications",
      value: dashboardData.totalCertifications,
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Total Commitee",
      value: dashboardData.totalCommitee,
      icon: Users,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Completed Certification Requests",
      value: dashboardData.totalCompletedRequest,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-3 py-3 md:px-6 md:py-6 max-w-8xl w mx-auto">
        {/* Header Section */}
     <div className="mb-6">
  <div className="border-l-4 border-indigo-500 pl-4">
    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
  </div>
</div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6 ">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-b-md rounded-t-md border border-indigo-100 p-3 hover:shadow-md transition-shadow duration-200 `}
            >
              <div className="flex items-center justify-between mb-3">
                {stat.title && (
                  <div>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.title}</p>
                  </div>
                )}
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mx-auto text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* User Growth Line Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">
                  User Growth
                </h3>
              </div>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            <div style={{ height: "280px" }}>
              <Line
                data={getUserGrowthChartData()}
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Request Status Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                Request Status Overview
              </h3>
            </div>
            <div style={{ height: "280px" }}>
              <Bar data={getRequestStatusChartData()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Status Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                User Distribution
              </h3>
            </div>
            <div style={{ height: "280px" }}>
              <Pie data={getUserStatusChartData()} options={pieChartOptions} />
            </div>
          </div>

          {/* Company Distribution Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                Company Distribution
              </h3>
            </div>
            <div style={{ height: "280px" }}>
              <Pie
                data={getCompanyStatusChartData()}
                options={pieChartOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
