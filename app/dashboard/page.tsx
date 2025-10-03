"use client";

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

const weeklyData = [
  { day: "Mon", Authentic: 15, Suspicious: 3, Deepfake: 2 },
  { day: "Tue", Authentic: 12, Suspicious: 5, Deepfake: 4 },
  { day: "Wed", Authentic: 18, Suspicious: 2, Deepfake: 3 },
  { day: "Thu", Authentic: 20, Suspicious: 4, Deepfake: 3 },
  { day: "Fri", Authentic: 27, Suspicious: 6, Deepfake: 3 },
  { day: "Sat", Authentic: 6, Suspicious: 2, Deepfake: 1 },
  { day: "Sun", Authentic: 4, Suspicious: 1, Deepfake: 0 },
];

const recentScans = [
  {
    name: "press_conference_2024.mp4",
    status: "Authentic",
    color: "bg-green-600/70 dark:bg-green-500/70",
    confidence: "98%",
    time: "Sep 21, 14:30",
  },
  {
    name: "interview_clip.mp4",
    status: "Suspicious",
    color: "bg-yellow-600/70 dark:bg-yellow-500/70",
    confidence: "67%",
    time: "Sep 21, 11:15",
  },
  {
    name: "social_media_video.mp4",
    status: "Deepfake",
    color: "bg-red-600/70 dark:bg-red-500/70",
    confidence: "94%",
    time: "Sep 20, 16:45",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen dark:bg-background px-6 py-8">
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
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Manage Your Media Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track usage, review recent scans, and monitor authenticity insights.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Balance */}
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">425</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                of 500 credits
              </p>
              <Progress value={85} className="h-2 mb-4" />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>Daily Usage: 23</span>
                <span>Est. Days Left: 18</span>
              </div>
              <Button className="w-full">Purchase Credits</Button>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background/60 px-3 py-2 hover:shadow-sm transition"
                >
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scan.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    <Eye className="h-4 w-4 text-slate-500 cursor-pointer flex-shrink-0" />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Scans
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Usage */}
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                Weekly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid #cbd5e1",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar dataKey="Authentic" stackId="a" fill="var(--color-authentic)" />
                  <Bar dataKey="Suspicious" stackId="a" fill="var(--color-suspicious)" />
                  <Bar dataKey="Deepfake" stackId="a" fill="var(--color-deepfake)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4 text-sm">
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
