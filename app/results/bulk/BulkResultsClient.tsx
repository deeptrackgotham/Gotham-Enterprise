"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import { fetchResult } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

// Strongly-typed ResultData interface
interface ResultData {
  fileName: string;
  scanId: string;
  status: "AUTHENTIC" | "SUSPICIOUS" | "FAKE" | string;
  confidenceScore: number;
  createdAt: string;
  fileType: string;
  modelsUsed: string[];
  imageUrl: string;
  description: string;
  features: string[];
}

// Component to render a single result card
const ResultCard: React.FC<{ result: ResultData }> = ({ result }) => (
  <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
    <div className="w-full h-[180px] rounded-lg overflow-hidden mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Image
        src={result.imageUrl || "https://via.placeholder.com/280x180.png?text=No+Image"}
        alt={result.fileName}
        width={280}
        height={180}
        className="object-cover rounded-lg"
      />
    </div>
    <h2 className="font-semibold mb-2">{result.fileName}</h2>
    <p className="text-sm mb-1">
      <span className="font-semibold">Status: </span>
      <span
        className={`font-semibold px-2 py-1 rounded-md ${
          result.status === "AUTHENTIC"
            ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40"
            : result.status === "SUSPICIOUS"
            ? "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40"
            : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40"
        }`}
      >
        {result.status}
      </span>
    </p>
    <p className="text-sm mb-1">
      <span className="font-semibold">Confidence: </span>
      {result.confidenceScore}%
    </p>
    <p className="text-sm mb-2">
      <span className="font-semibold">Scan ID: </span>
      {result.scanId}
    </p>
    <ul className="text-sm space-y-1">
      {result.features.map((feature, idx) => (
        <li key={idx} className="flex items-center gap-2">
          <Check className="text-blue-600 dark:text-blue-400 w-4 h-4 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export default function BulkResultsClient() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const { isSignedIn } = useUser();

  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !idsParam) return;

    const scanIds = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (!scanIds.length) {
      setError("No valid scan IDs provided.");
      setLoading(false);
      return;
    }

    const loadResults = async () => {
      try {
        const fetchedResults: ResultData[] = [];

        for (const id of scanIds) {
          try {
            const data = await fetchResult(id);
            fetchedResults.push({
              fileName: data.fileName || "Unknown",
              scanId: data.scanId,
              status: data.status,
              confidenceScore: data.confidenceScore ?? 0,
              createdAt: data.createdAt,
              fileType: data.fileType ?? "unknown",
              modelsUsed: data.modelsUsed ?? [],
              imageUrl: data.imageUrl || "https://via.placeholder.com/280x180.png?text=Detected+Image",
              description: data.description ?? "",
              features: data.features ?? [],
            });
          } catch (err) {
            // continue on per-item errors
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch result ${id}`, err);
          }
        }

        setResults(fetchedResults);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load bulk results:", err);
        setError("Failed to load bulk results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [isSignedIn, idsParam]);

  if (!idsParam) return <p className="text-center mt-8">No scan IDs provided</p>;
  if (loading) return <p className="text-center mt-8">Loading results...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Bulk Verification Results</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((res) => (
          <ResultCard key={res.scanId} result={res} />
        ))}
      </div>
    </div>
  );
}
