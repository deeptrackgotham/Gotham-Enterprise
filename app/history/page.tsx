"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type ScanRecord = {
  id: number;
  name: string;
  date: string;
  status: "Authentic" | "Suspicious" | "Deepfake";
};

const scans: ScanRecord[] = [
  { id: 1, name: "press_confrence_1", date: "Sep 21, 14:30", status: "Authentic" },
  { id: 2, name: "press_confrence_2", date: "Sep 21, 14:30", status: "Authentic" },
  { id: 3, name: "press_confrence_3", date: "Sep 21, 14:30", status: "Suspicious" },
  { id: 4, name: "press_confrence_4", date: "Sep 21, 14:30", status: "Deepfake" },
  { id: 5, name: "press_confrence_5", date: "Sep 21, 14:30", status: "Deepfake" },
  { id: 6, name: "press_confrence_6", date: "Sep 21, 14:30", status: "Suspicious" },
  { id: 7, name: "press_confrence_7", date: "Sep 21, 14:30", status: "Suspicious" },
];

const statusColors: Record<ScanRecord["status"], string> = {
  Authentic: "text-green-600 dark:text-green-400",
  Suspicious: "text-yellow-600 dark:text-yellow-400",
  Deepfake: "text-red-600 dark:text-red-400",
};

const tabs = ["All scans", "Authentic", "Suspicious", "Deepfake"];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<string>("All scans");
  const router = useRouter();

  const filteredScans =
    activeTab === "All scans"
      ? scans
      : scans.filter((scan) => scan.status === activeTab);

  const handleViewResults = (scanId: number) => {
    router.push(`/results/${scanId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-block rotate-[-15deg] text-2xl">⟳</span> HISTORY
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-4">Name</th>
                <th className="px-4">Date</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="
                      bg-white dark:bg-black 
                      shadow-sm rounded-md overflow-hidden
                      border border-gray-200 dark:border-transparent   /* REMOVE BORDER IN DARK MODE */
                    "
                  >
                    <td className="px-4 py-3 font-medium">{scan.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{scan.date}</td>
                    <td className={`px-4 py-3 font-semibold ${statusColors[scan.status]}`}>
                      {scan.status}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
                            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={4}
                            className="
                              bg-white dark:bg-black 
                              rounded-md shadow-md 
                              border border-gray-200 dark:border-transparent   /* REMOVE BORDER IN DARK MODE */
                              py-1 min-w-[150px] text-sm
                            "
                          >
                            <DropdownMenu.Item
                              onClick={() => handleViewResults(scan.id)}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer text-black dark:text-white"
                            >
                              View Results
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer text-black dark:text-white"
                            >
                              Download Report
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm italic"
                  >
                    No scans found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
