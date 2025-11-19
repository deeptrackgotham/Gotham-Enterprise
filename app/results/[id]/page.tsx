"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { fetchResult } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

interface ResultData {
  fileName: string;
  scanId: string;
  status: string;
  confidenceScore: number;
  createdAt: string;
  fileType: string;
  modelsUsed: string[];
  imageUrl: string;
  description: string;
  features: string[];
}

export default function ResultsPage() {
  const { id } = useParams();
  const { isSignedIn } = useUser();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !id) return;

    const loadResult = async () => {
      try {
        setLoading(true);
        const data = await fetchResult(id as string);
        setResultData({
          fileName: data.fileName,
          scanId: data.scanId,
          status: data.status,
          confidenceScore: data.confidenceScore,
          createdAt: data.createdAt,
          fileType: data.fileType,
          modelsUsed: data.modelsUsed || [],
          imageUrl: data.imageUrl || "https://via.placeholder.com/280x180.png?text=Detected+Image",
          description: data.description || "deeptrack is an advanced deepfake detection solution designed for media outlets, financial institutions, and government agencies",
          features: data.features || [
            "Advanced AI models trained on millions of authentic and manipulated images",
            "Ensemble approach using multiple specialized detection algorithms",
            "Real-time detection of deepfakes, AI-generated content, and manipulations",
          ],
        });
      } catch (err) {
        console.error("Failed to load result:", err);
        setError("Failed to load result details");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [isSignedIn, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white items-center justify-center">
        <p>Loading result...</p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white items-center justify-center">
        <p className="text-red-500">{error || "Result not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Results
        </h1>

        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-10 border border-gray-200 dark:border-gray-800">
          {/* Image */}
          <div className="flex-shrink-0 w-full md:w-[280px]">
            <div className="w-full h-[260px] rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <Image
                src={resultData.imageUrl}
                alt={resultData.fileName}
                width={280}
                height={260}
                className="object-cover rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              uploaded media {resultData.fileName}.jpg
            </p>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-6">{resultData.fileName}</h2>

            <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
              <div className="col-span-2 flex items-center gap-2 mb-2">
                <span className="font-semibold">Overall Result:</span>
                <span
                  className={`font-semibold px-3 py-1 rounded-md ${
                    resultData.status === "AUTHENTIC"
                      ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40"
                      : resultData.status === "SUSPICIOUS"
                      ? "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40"
                      : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40"
                  }`}
                >
                  {resultData.status}
                </span>
              </div>
              <p>
                <span className="font-semibold">Confidence Score: </span>
                {resultData.confidenceScore}%
              </p>
              <p>
                <span className="font-semibold">Scan ID: </span>
                {resultData.scanId}
              </p>
              <p>
                <span className="font-semibold">Uploaded Date: </span>
                {new Date(resultData.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Models Used: </span>
                {resultData.modelsUsed.length} AI Models
              </p>
              <p>
                <span className="font-semibold">Type: </span>
                {resultData.fileType}
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {resultData.description}
            </p>

            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-400">
              {resultData.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check className="text-blue-600 dark:text-blue-400 w-4 h-4 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
