"use client";
import React from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface AnalyticsData {
  dashboard: {
    signupsByRole: { _id: string; count: number }[];
    verificationStatus: { _id: string; count: number }[];
    activeUsersCount: any;
    bookingStatusDistribution: { _id: string; count: number }[];
    bookingVolume: number;
    revenueByRole: { _id: string; totalRevenue: number }[];
    topServiceTypes: { _id: string; count: number }[];
    totalRevenue: number;
    activeBusinesses: { _id: string | null; bookingsCount: number }[];
  };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [showNullBusinesses, setShowNullBusinesses] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Auth Error",
          description: "No authentication token found.",
        });
        return;
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/analytics/admin",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics data");

      const data = await response.json();
      if (data && data.dashboard) {
        setAnalytics(data);
        setLastUpdated(Date.now());
      } else {
        throw new Error("No valid analytics data received");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch analytics data.",
      });
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Push data to Google Sheets
  const pushDataToSheets = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Auth Error",
          description: "No authentication token found.",
        });
        return;
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/sheets/push-to-sheets/admin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to push data to Google Sheets");

      toast({
        title: "Success",
        description: "Analytics data updated.",
      });
      setIsReady(true);
    } catch (error) {
      console.error("Error pushing to sheets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update analytics data.",
      });
    }
  }, []);

  // Setup live refresh
  useEffect(() => {
    const initialize = async () => {
      await fetchAnalytics();
      await pushDataToSheets();
    };
    initialize();

    if (isLive) {
      intervalRef.current = setInterval(fetchAnalytics, 30000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAnalytics, pushDataToSheets, isLive]);

  // Format last updated time
  const getLastUpdatedText = () => {
    const secondsAgo = Math.floor((Date.now() - lastUpdated) / 1000);
    return `Updated ${secondsAgo + Math.floor(Math.random() * 5)} seconds ago`;
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!analytics) return;

    const headers = [
      "Metric,Value",
      "Total Signups," + analytics.dashboard.signupsByRole.reduce((sum, role) => sum + role.count, 0),
      "Total Bookings," + analytics.dashboard.bookingVolume,
      "Total Revenue,$" + analytics.dashboard.totalRevenue.toLocaleString(),
    ];

    const signups = analytics.dashboard.signupsByRole.map(
      (role) => `Signup_${role._id},${role.count}`
    );
    const verification = analytics.dashboard.verificationStatus.map(
      (status) => `Verification_${status._id},${status.count}`
    );
    const bookings = analytics.dashboard.bookingStatusDistribution.map(
      (status) => `Booking_${status._id},${status.count}`
    );
    const revenue = analytics.dashboard.revenueByRole.map(
      (role) => `Revenue_${role._id},$${role.totalRevenue.toLocaleString()}`
    );
    const services = analytics.dashboard.topServiceTypes.map(
      (service) => `Service_${service._id},${service.count}`
    );
    const businesses = analytics.dashboard.activeBusinesses.map(
      (business) => `Business_${business._id || "N/A"},${business.bookingsCount}`
    );

    const csv = [
      ...headers,
      "",
      "Signups by Role",
      ...signups,
      "",
      "Verification Status",
      ...verification,
      "",
      "Booking Status Distribution",
      ...bookings,
      "",
      "Revenue by Role",
      ...revenue,
      "",
      "Top Service Types",
      ...services,
      "",
      "Active Businesses",
      ...businesses,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data
  const signupChartData = {
    labels: analytics?.dashboard.signupsByRole.map((role) => role._id) || [],
    datasets: [
      {
        label: "Signups",
        data: analytics?.dashboard.signupsByRole.map((role) => role.count) || [],
        backgroundColor: "#1E3A8A",
        borderColor: "#1E40AF",
        borderWidth: 1,
      },
    ],
  };

  const bookingChartData = {
    labels: analytics?.dashboard.bookingStatusDistribution.map((status) => status._id) || [],
    datasets: [
      {
        data: analytics?.dashboard.bookingStatusDistribution.map((status) => status.count) || [],
        backgroundColor: ["#B91C1C", "#1E3A8A", "#10B981"],
        borderWidth: 0,
      },
    ],
  };

  // JSX return
  return (
    // Main container
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 font-inter">
      <Sidebar />
      <div className="flex-1 ml-60 p-8 bg-gray-100 dark:bg-gray-950">
        {/* Loading bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-red-600 z-50">
            <div className="h-full w-1/3 bg-blue-400 animate-slide"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Limpiar Analytics </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time insights into Limpiar platform operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.span
                key={lastUpdated}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {getLastUpdatedText()}
              </motion.span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${isLive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {isLive ? 'Live' : 'Paused'}
                </button>
              </div>
              <button
                onClick={exportToCSV}
                className="px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </motion.div>

          {/* Dashboard content */}
          {analytics && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {/* Overview Section */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm3.536 3.536a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06zM16.25 10a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5zM10 16.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.464 14.464a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06zM3.75 10a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5zm1.714-3.536a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06zM10 3.75a6.25 6.25 0 110 12.5 6.25 6.25 0 010-12.5z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Overview</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={`relative flex items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 ${isLive ? 'animate-pulse-once' : ''}`}>
                    <div className="group">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                      <div className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                        Sum of all role signups
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Signups</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analytics.dashboard.signupsByRole.reduce((sum, role) => sum + role.count, 0)}
                      </p>
                    </div>
                  </div>
                  <div className={`relative flex items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 ${isLive ? 'animate-pulse-once' : ''}`}>
                    <div className="group">
                      <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zm0 1h8v1H6V3zm-1 3h10v1H5V6zm0 2h10v7H5V8z"></path>
                      </svg>
                      <div className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                        Total platform bookings
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.dashboard.bookingVolume}</p>
                    </div>
                  </div>
                  <div className={`relative flex items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 ${isLive ? 'animate-pulse-once' : ''}`}>
                    <div className="group">
                      <svg className="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"></path>
                      </svg>
                      <div className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                        Total platform revenue
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">${analytics.dashboard.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Signups by Role */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Signups by Role</h2>
                </div>
                <div className="h-64">
                  <Bar
                    data={signupChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: "Count" } },
                        x: { title: { display: true, text: "Role" } },
                      },
                    }}
                  />
                </div>
              </motion.div>

              {/* Verification Status */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Verification Status</h2>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Status</th>
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dashboard.verificationStatus.map((status) => (
                      <tr key={status._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{status._id}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white transition-all">{status.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Booking Status Distribution */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Booking Status Distribution</h2>
                </div>
                <div className="h-64">
                  <Pie
                    data={bookingChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` } },
                      },
                    }}
                  />
                </div>
              </motion.div>

              {/* Revenue by Role */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Revenue by Role</h2>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Role</th>
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dashboard.revenueByRole.map((role) => (
                      <tr key={role._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{role._id}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white transition-all">${role.totalRevenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Top Service Types (Scrolling) */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 border-t-4 border-blue-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Top Service Types</h2>
                </div>
                <div className="scroll-container">
                  <AnimatePresence>
                    <motion.div
                      className="scroll-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[...analytics.dashboard.topServiceTypes, ...analytics.dashboard.topServiceTypes].map((service, index) => (
                        <motion.div
                          key={`${service._id}-${index}`}
                          className="flex justify-between py-2 px-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="truncate max-w-[80%]">{service._id}</span>
                          <span>{service.count}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Active Businesses */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 6a1 1 0 011 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1V7a1 1 0 011-1h2z"></path>
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Businesses</h2>
                  </div>
                  <button
                    onClick={() => setShowNullBusinesses(!showNullBusinesses)}
                    className="px-4 py-1 rounded-lg text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    {showNullBusinesses ? "Hide Null IDs" : "Show All"}
                  </button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Business ID</th>
                      <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Bookings Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dashboard.activeBusinesses
                      .filter((business) => showNullBusinesses || business._id)
                      .map((business, index) => (
                        <tr key={business._id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{business._id || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white transition-all">{business.bookingsCount}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Looker Studio Dashboard */}
              {isReady && (
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 6a1 1 0 011 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1V7a1 1 0 011-1h2z"></path>
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Detailed Analytics Dashboard</h2>
                  </div>
                  <iframe
                    width="100%"
                    height="600"
                    src="https://lookerstudio.google.com/embed/reporting/f8a76619-52d8-44d9-9a51-54d942738344/page/WXINF"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    className="rounded-lg"
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Fallback states */}
          {!analytics && !isLoading && (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-20">No analytics data available.</div>
          )}
          {isLoading && !analytics && (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-20">Loading analytics...</div>
          )}
        </div>
      </div>
    </div>
  );
}