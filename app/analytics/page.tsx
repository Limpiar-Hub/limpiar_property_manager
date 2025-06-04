"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast";

export default function Analytics() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const pushDataToSheets = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Auth Error",
          description: "No authentication token found.",
        });
        return;
      }

      try {
        const res = await fetch(
          "https://limpiar-backend.onrender.com/api/sheets/push-to-sheets/admin",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to push data to Google Sheets");

        toast({
          title: "Success",
          description: "Analytics data updated.",
        });

        // Only render iframe after successful update
        setIsReady(true);
      } catch (error) {
        console.error("Error pushing to sheets:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update analytics data.",
        });
      }
    };

    pushDataToSheets();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-60 p-8 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Limpiar Analytics</h2>

        {!isReady ? (
          <div className="text-gray-500 text-center mt-20">Loading analytics...</div>
        ) : (
          <div className="border rounded-lg shadow-lg overflow-hidden">
            <iframe
              className="w-full h-[80vh]"
              src="https://lookerstudio.google.com/embed/reporting/03972241-7b04-4b68-bc18-38571af09366/page/JziMF"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
