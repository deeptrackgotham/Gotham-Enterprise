"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, FileText, TrendingUp, Wallet } from "lucide-react";
import { fetchScans } from "@/lib/api";

const defaultWeeklyData = [
  { day: "Mon", Authentic: 15, Suspicious: 3, Deepfake: 2 },
  { day: "Tue", Authentic: 12, Suspicious: 5, Deepfake: 4 },
  { day: "Wed", Authentic: 18, Suspicious: 2, Deepfake: 3 },
  { day: "Thu", Authentic: 20, Suspicious: 4, Deepfake: 3 },
  { day: "Fri", Authentic: 27, Suspicious: 6, Deepfake: 3 },
  { day: "Sat", Authentic: 6, Suspicious: 2, Deepfake: 1 },
  { day: "Sun", Authentic: 4, Suspicious: 1, Deepfake: 0 },
];

export default function Dashboard() {
  const { isSignedIn, user } = useUser();
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const scans = await fetchScans();
        const formatted = scans.slice(0, 3).map((scan: any) => ({
          name: scan.fileName,
          status: scan.status.charAt(0).toUpperCase() + scan.status.slice(1).toLowerCase(),
          color:
            scan.status === "AUTHENTIC"
              ? "bg-green-600/70 dark:bg-green-500/70"
              : scan.status === "SUSPICIOUS"
              ? "bg-yellow-600/70 dark:bg-yellow-500/70"
              : "bg-red-600/70 dark:bg-red-500/70",
          confidence: `${scan.confidenceScore}%`,
          time: new Date(scan.createdAt).toLocaleDateString(),
        }));
        setRecentScans(formatted);
        setUserCredits(500 - (scans.length * 1));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSignedIn]);
  return (
    <div className="min-h-screen bg-white dark:bg-black px-6 py-8">
      {/* Theme-aware CSS vars for chart colors */}
      <style jsx global>{`
        :root {
          --color-authentic: #1eb054e2; /* green-600 */
          --color-suspicious: #ca8b04ba; /* yellow-600 */
          --color-deepfake: #d33e3eff; /* red-600 */
        }
        .dark {
          --color-authentic: #22c55ec4; /* green-500 */
          --color-suspicious: #eab208b6; /* yellow-500 */
          --color-deepfake: #ef4444e0; /* red-500 */
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Manage Your Media Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track usage, review recent scans, and monitor authenticity insights.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Balance */}
          <Card className="shadow-lg bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">{userCredits}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                of 500 credits
              </p>
              <Progress value={(userCredits / 500) * 100} className="h-2 mb-4" />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                <span>Daily Usage: {500 - userCredits}</span>
                <span>Est. Days Left: {Math.ceil(userCredits / ((500 - userCredits) || 1))}</span>
              </div>
              <Button className="w-full">Purchase Credits</Button>
            </CardContent>
          </Card>

          {/* Recent Scans */}
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
                    {/* Left side */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-black dark:text-white">{scan.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {scan.time}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full text-white whitespace-nowrap ${scan.color}`}
                      >
                        {scan.status} ({scan.confidence})
                      </span>
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400 cursor-pointer flex-shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">No scans yet</p>
              )}
              <Button variant="outline" className="w-full">
                View All Scans
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Usage */}
          <Card className="shadow-lg bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                Weekly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={defaultWeeklyData}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000000",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="Authentic" stackId="a" fill="var(--color-authentic)" />
                  <Bar dataKey="Suspicious" stackId="a" fill="var(--color-suspicious)" />
                  <Bar dataKey="Deepfake" stackId="a" fill="var(--color-deepfake)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4 text-sm text-black dark:text-white">
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "var(--color-authentic)" }}
                  ></span>
                  Authentic
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "var(--color-suspicious)" }}
                  ></span>
                  Suspicious
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "var(--color-deepfake)" }}
                  ></span>
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