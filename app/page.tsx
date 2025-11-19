"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UploadCloud, Link2, Image as ImageIcon, Video, AudioWaveform, Shield, Globe, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createScan } from "@/lib/api";

export default function EnterpriseUpload() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine file type
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "image";

      // Create a mock scan result (in production, you'd send to your verification service)
      const mockResult = await createScan({
        fileName: file.name,
        fileType: fileType as "image" | "video" | "audio",
        status: ["AUTHENTIC", "SUSPICIOUS", "DEEPFAKE"][Math.floor(Math.random() * 3)] as any,
        confidenceScore: Math.random() * 100,
        modelsUsed: ["ModelA", "ModelB"],
        imageUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "https://via.placeholder.com/280x180.png?text=Uploaded+File",
        description: "Media verification scan completed",
        features: [
          "Advanced AI models trained on millions of authentic and manipulated images",
          "Ensemble approach using multiple specialized detection algorithms",
          "Real-time detection of deepfakes, AI-generated content, and manipulations",
        ],
      });

      router.push(`/results/${mockResult.scanId}`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const mockResult = await createScan({
        fileName: new URL(urlInput).pathname.split("/").pop() || "media-file",
        fileType: "image",
        status: ["AUTHENTIC", "SUSPICIOUS", "DEEPFAKE"][Math.floor(Math.random() * 3)] as any,
        confidenceScore: Math.random() * 100,
        modelsUsed: ["ModelA", "ModelB"],
        imageUrl: urlInput,
        description: "Media verification scan completed",
        features: [
          "Advanced AI models trained on millions of authentic and manipulated images",
          "Ensemble approach using multiple specialized detection algorithms",
          "Real-time detection of deepfakes, AI-generated content, and manipulations",
        ],
      });

      router.push(`/results/${mockResult.scanId}`);
    } catch (err: any) {
      console.error("URL scan error:", err);
      setError(err.message || "Failed to scan URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-background dark:to-background" >
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center px-6 py-14">
        <h1 className="text-4xl md:text-5xl font-bold dark:text-white tracking-tight text-slate-900">
          Secure Media Integrity <br />
          <span className="text-sky-500 dark:text-sky-400">Enterprise-Grade Protection</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          Advanced deepfake detection and C2PA provenance verification for newsrooms,
          ensuring authentic media in an age of synthetic content.
        </p>
      </section>

      {/* Upload Area */}
<main className="flex-1">
      <div className="mx-auto max-w-2xl px-6">
        <Card className="shadow-lg border border-dashed border-sky-500 dark:border-sky-400 dark:bg-card/50 bg-white">
          <CardContent className="p-8 space-y-10">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* File Upload */}
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 border-slate-500 hover:border-sky-500 rounded-xl p-10 dark:hover:border-sky-400 transition bg-white dark:bg-card">
              <input
                type="file"
                id="file-input"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />

              <div className="flex flex-col items-center justify-center ">
                <UploadCloud className="h-10 w-10 text-sky-500 dark:text-sky-400 mb-3" />
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  Upload Media for Verification
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-2 ">
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" /> Video Files
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" /> Image Files
                  </span>
                  <span className="flex items-center gap-1">
                    <AudioWaveform className="h-4 w-4" /> Audio Files
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-400 text-center mb-3">
                  (Max 10MB each) • Multiple files supported
                </p>

                <Button
                  size="lg"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={loading}
                  className="bg-slate-900 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl px-6"
                >
                  {loading ? "Processing..." : "Browse Files"}
                </Button>
              </div>


{/* URL Scan */}
<div className="flex flex-col items-center w-full">
  <div className="relative w-full flex items-center my-6">
    <Separator className="flex-1 bg-slate-300 dark:bg-slate-500" />
    <span className="px-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
      <Link2 className="h-4 w-4 text-sky-500 dark:sky-400" />
      Or add from URL
    </span>
    <Separator className="flex-1 bg-slate-300 dark:bg-slate-500" />
  </div>

  <div className="flex w-full gap-2">
    <input
      type="text"
      placeholder="Paste media URL here..."
      value={urlInput}
      onChange={(e) => setUrlInput(e.target.value)}
      disabled={loading}
      className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-background/50 dark:text-white disabled:opacity-50"
    />
    <Button
      size="default"
      onClick={handleUrlSubmit}
      disabled={loading}
      className="bg-slate-900 hover:bg-sky-500 text-white dark:bg-sky-500 dark:hover:bg-sky-600 rounded-md px-4"
    >
      {loading ? "Processing..." : "Add File"}
    </Button>
  </div>
</div>
     <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
              1 scan = 1 credit. Enterprise plans start at 500 credits/month.
            </p>


          </div>
          </CardContent>
                      {/* Footer note */}
            <p className="text-xs text-slate-500 dark:text-slate-200 text-center">
              Max file size: 300MB. Accepted formats: JPG, PNG, MP3, WAV, MP4, WebM, MOV, AVI, WMV, MKV, FLV
            </p>

        </Card>
      </div>
    </main>
<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 mt-10 px-6">
  {/* AI-Powered Detection */}
  <Card className="bg-card/60 border dark:border-gray-800 shadow-lg rounded-lg flex flex-col items-center justify-center text-center p-6">
    <CardHeader className="flex items-center justify-center">
      <div className="flex items-center justify-center p-2 rounded-full bg-green-500/10">
        <Shield className="h-8 w-8 text-green-400/70" />
      </div>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-gray-500 dark:text-gray-200 text-base font-semibold mb-2">
        AI-Powered Detection
      </CardTitle>
      <p className="text-sm text-gray-400">
        Overview of all claims submitted to the system.
      </p>
    </CardContent>
  </Card>

  {/* C2PA Provenance */}
  <Card className="bg-card/60 border dark:border-gray-800 shadow-lg rounded-lg flex flex-col items-center justify-center text-center p-6">
    <CardHeader className="flex items-center justify-center">
      <div className="flex items-center justify-center p-2 rounded-full bg-slate-400/10">
        <Globe className="h-8 w-8 text-slate-400/70" />
      </div>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-gray-500 dark:text-gray-200 text-base font-semibold mb-2">
        C2PA Provenance
      </CardTitle>
      <p className="text-sm text-gray-400">
        Complete media lineage tracking and authenticity verification
      </p>
    </CardContent>
  </Card>

  {/* Enterprise Ready */}
  <Card className="bg-card/60 border dark:border-gray-800 shadow-lg rounded-lg flex flex-col items-center justify-center text-center p-6">
    <CardHeader className="flex items-center justify-center">
      <div className="flex items-center justify-center p-2 rounded-full bg-yellow-500/10">
        <UsersRound className="h-8 w-8 text-yellow-500/70" />
      </div>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-gray-500 dark:text-gray-200 text-base font-semibold mb-2">
        Enterprise Ready
      </CardTitle>
      <p className="text-sm text-gray-400">
        Multi-tenant architecture with advanced user management
      </p>
    </CardContent>
  </Card>
</div>
        </div>
  );
}
