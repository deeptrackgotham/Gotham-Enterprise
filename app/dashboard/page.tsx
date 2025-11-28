"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, FileText, TrendingUp, Wallet } from "lucide-react";
import { fetchScans } from "@/lib/api";

const EMPTY_WEEK = [
  { day: "Mon", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Tue", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Wed", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Thu", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Fri", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Sat", Authentic: 0, Suspicious: 0, Deepfake: 0 },
  { day: "Sun", Authentic: 0, Suspicious: 0, Deepfake: 0 },
];

async function fetchUserCredits() {
  try {
    const res = await fetch("/api/users/sync", { method: "GET", credentials: "include" });
    if (!res.ok) return 0;
    const user = await res.json();
    return user?.credits || 0;
  } catch {
    return 0;
  }
}

export default function Dashboard() {
  const { isSignedIn } = useUser();

  type FilterType = "7" | "30" | "month" | "all";

  type RecentScan = {
    name: string;
    status: string;
    color: string;
    confidence: string;
    time: string;
  };
  type ApiScan = {
    createdAt: string;
    fileName?: string;
    status?: string;
    confidenceScore?: number;
    [key: string]: unknown;
  };

  const [allScans, setAllScans] = useState<ApiScan[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const [usageData, setUsageData] = useState(EMPTY_WEEK);
  const [filter, setFilter] = useState<FilterType>("7");

  const titleMap: Record<FilterType, string> = {
    "7": "Weekly Usage",
    "30": "30-Day Usage",
    month: "Monthly Usage",
    all: "General Usage",
  };

  // Filter function (wrapped in useCallback)
  const applyDateFilter = useCallback(
    (date: Date) => {
      const now = new Date();

      if (filter === "7") return (now.getTime() - date.getTime()) / 86400000 <= 7;
      if (filter === "30") return (now.getTime() - date.getTime()) / 86400000 <= 30;
      if (filter === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      return true; // "all"
    },
    [filter]
  );

  // Build usage dynamically for chart
  const buildUsage = useCallback(
    (scans: ApiScan[]) => {
      const now = new Date();
      let labels: string[] = [];

      // 1️⃣ Generate labels dynamically based on filter
      if (filter === "7") {
        // Past 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          labels.push(d.toLocaleDateString("en-US", { weekday: "short" })); // "Mon", "Tue", etc.
        }
      } else if (filter === "30") {
        // Past 30 days
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          labels.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" })); // "27 Nov"
        }
      } else if (filter === "month") {
        // Current month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), i);
          labels.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" })); // "1 Nov"
        }
      } else {
        // "all" - unique dates from scans
        const uniqueDates = Array.from(
          new Set(scans.map((s) => new Date(s.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })))
        );
        labels = uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      }

      // 2️⃣ Initialize usage array
      const usage = labels.map((label) => ({
        day: label,
        Authentic: 0,
        Suspicious: 0,
        Deepfake: 0,
      }));

      // 3️⃣ Count scans per label
      scans.forEach((scan) => {
        const date = new Date(scan.createdAt);
        if (!applyDateFilter(date)) return;

        let label = "";
        if (filter === "7") {
          label = date.toLocaleDateString("en-US", { weekday: "short" });
        } else {
          label = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        }

        const item = usage.find((d) => d.day === label);
        if (!item) return;

        const st = String(scan.status || "");
        if (st === "AUTHENTIC") item.Authentic++;
        else if (st === "SUSPICIOUS") item.Suspicious++;
        else item.Deepfake++;
      });

      return usage;
    },
    [filter, applyDateFilter]
  );

  // Load scans & credits once
  useEffect(() => {
    if (!isSignedIn) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const scans = await fetchScans();
        const credits = await fetchUserCredits();

        setAllScans(scans);
        setUsageData(buildUsage(scans));

        const formatted = scans.slice(0, 3).map((scan: ApiScan) => {
          const status = scan.status ?? "UNKNOWN"; // default value
          return {
            name: scan.fileName,
            status: status.charAt(0) + status.slice(1).toLowerCase(),
            color:
              status === "AUTHENTIC"
                ? "bg-green-600/70 dark:bg-green-500/70"
                : status === "SUSPICIOUS"
                  ? "bg-yellow-600/70 dark:bg-yellow-500/70"
                  : "bg-red-600/70 dark:bg-red-500/70",
            confidence: `${scan.confidenceScore}%`,
            time: new Date(scan.createdAt).toLocaleDateString(),
          };
        });

        setRecentScans(formatted);
        setUserCredits(credits);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSignedIn, buildUsage]);

  // Rebuild chart locally when filter changes
  useEffect(() => {
    setUsageData(buildUsage(allScans));
  }, [filter, allScans, buildUsage]);

  return (
    <div className="min-h-screen bg-white dark:bg-black px-6 py-8">
      <style jsx global>{`
        :root {
          --color-authentic: #1eb054e2;
          --color-suspicious: #ca8b04ba;
          --color-deepfake: #d33e3eff;
        }
        .dark {
          --color-authentic: #22c55ec4;
          --color-suspicious: #eab208b6;
          --color-deepfake: #ef4444e0;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Manage Your Media Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track usage, review recent scans, and monitor authenticity insights.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREDIT CARD */}
          <Card className="shadow-lg bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userCredits}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                credits available
              </p>
              <Progress value={Math.min((userCredits / 500) * 100, 100)} className="h-2 mb-4" />
              <Button className="w-full" onClick={() => (window.location.href = "/pricing-billing")}>
                Purchase More Credits
              </Button>
            </CardContent>
          </Card>

          {/* RECENT SCANS */}
          <Card className="shadow-lg bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
              ) : recentScans.length > 0 ? (
                recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-black px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-black dark:text-white">{scan.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{scan.time}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full text-white whitespace-nowrap ${scan.color}`}>
                        {scan.status} ({scan.confidence})
                      </span>
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400 cursor-pointer" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">No scans yet</p>
              )}
              <Button variant="outline" className="w-full">View All Scans</Button>
            </CardContent>
          </Card>

          {/* USAGE CHART */}
          <Card className="shadow-lg bg-white dark:bg-black w-full">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                {titleMap[filter] ?? "Usage"}
              </CardTitle>

              <div className="flex flex-wrap gap-2">
                {([
                  { key: "7" as FilterType, label: "Past 7 days" },
                  { key: "30" as FilterType, label: "Past 30 days" },
                  { key: "month" as FilterType, label: "This month" },
                  { key: "all" as FilterType, label: "All time" },
                ] as { key: FilterType; label: string }[]).map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={filter === opt.key ? "default" : "outline"}
                    className="text-xs px-3 py-1"
                    onClick={() => setFilter(opt.key)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={usageData}>
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    tickFormatter={(tick, index) => {
                      if (filter === "30") {
                        // show every 3rd day label
                        return index % 7 === 0 ? tick : "";
                      }
                      if (filter === "month") {
                        // show every 2nd or 3rd day depending on month length
                        const interval = usageData.length > 15 ? 7 : 5;
                        return index % interval === 0 ? tick : "";
                      }
                      if (filter === "all") {
                        // show every 3rd day label
                        return index % 3 === 0 ? tick : "";
                      }

                      return tick; // weekly or all-time
                    }}
                    interval={0} // force all ticks to render (we hide some with tickFormatter)
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="Authentic" stackId="a" fill="var(--color-authentic)" />
                  <Bar dataKey="Suspicious" stackId="a" fill="var(--color-suspicious)" />
                  <Bar dataKey="Deepfake" stackId="a" fill="var(--color-deepfake)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4 text-sm text-black dark:text-white">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm" style={{ background: "var(--color-authentic)" }}></span>
                  Authentic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm" style={{ background: "var(--color-suspicious)" }}></span>
                  Suspicious
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm" style={{ background: "var(--color-deepfake)" }}></span>
                  Deepfake
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
