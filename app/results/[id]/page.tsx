"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fetchResult } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const modelMap: Record<string, { label: string; description: string }> = {
  "rd-img-ensemble": { label: "Facial Analysis", description: "Combines the fakeness scores from all face-based models into a single, more accurate fakeness score." },
  "rd-oak-img": { label: "Faceswaps", description: "Detects faces manipulated using faceswap methods." },
  "rd-elm-img": { label: "Diffusion", description: "Detects fake images created using diffusion methods." },
  "rd-cedar-img": { label: "GANs", description: "Detects images manipulated or generated using Generative Adversarial Networks." },
  "rd-pine-img": { label: "Visual Noise Analysis", description: "Detects fake images by analyzing texture and noise patterns." },
  "rd-context-img": { label: "Context-Aware Results", description: "Evaluates the full visual context of the image to detect deepfake manipulation." },
};

interface RDModel {
  name: string;
  status: string;
  score: number;
}

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
  rdModels: RDModel[];
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

        let rdModels: RDModel[] = [];
        try {
          const parsed = data.description ? JSON.parse(data.description) : {};
          const rd = parsed?.rd;
          if (rd?.models?.length) {
            rdModels = rd.models.map((m: any) => ({
              name: m.name,
              status: m.status,
              score: m.score,
            }));
          }
        } catch (err) {
          console.warn("Failed to parse RD result:", err);
        }

        setResultData({
          fileName: data.fileName,
          scanId: data.scanId,
          status: data.status,
          confidenceScore: data.confidenceScore,
          createdAt: data.createdAt,
          fileType: data.fileType,
          modelsUsed: data.modelsUsed || [],
          imageUrl: data.imageUrl || "https://via.placeholder.com/280x180.png?text=Detected+Image",
          description: data.description || "DeepTrack detected this media using advanced AI models.",
          rdModels,
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !resultData) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Result not found"}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📊</span> Results
        </h1>

        {/* Top Section: Image + Overall Details */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-10 border border-gray-200 dark:border-gray-800">
          <div className="flex-shrink-0 w-full md:w-[280px]">
            <div className="w-full h-[260px] rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <Image src={resultData.imageUrl} alt={resultData.fileName} width={280} height={260} className="object-cover rounded-lg" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              uploaded media {resultData.fileName}
            </p>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-6">{resultData.fileName}</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
              <p><span className="font-semibold">Overall Result: </span>{resultData.status}</p>
              <p><span className="font-semibold">Confidence Score: </span>{resultData.confidenceScore}%</p>
              <p><span className="font-semibold">Scan ID: </span>{resultData.scanId}</p>
              <p><span className="font-semibold">Uploaded Date: </span>{new Date(resultData.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Models Used: </span>{resultData.modelsUsed.length}</p>
              <p><span className="font-semibold">Type: </span>{resultData.fileType}</p>
            </div>

{/* Analysis Results Grid */}
<div className="mt-6 flex flex-col gap-4">
  {resultData.rdModels.map((model, index) => {
    const mapEntry = modelMap[model.name];
    const label = mapEntry?.label || model.name;
    const description = mapEntry?.description || "";

    return (
      <div
        key={index}
        className={`rounded-xl w-5/6 p-3 shadow-md border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center ${
          model.status === "MANIPULATED"
            ? "border-l-4 border-l-red-500 pl-4"
            : model.status === "AUTHENTIC"
            ? "border-l-4 border-l-green-600 pl-4"
            : "border-slate-600 bg-slate-800/40"
        }`}
      >
        {/* Left Side: Label + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
          <h4 className="text-sm font-semibold dark:text-white">{label}</h4>
          <div>
          <span
            className={` flex items-center justify-center ${
              model.status === "MANIPULATED"
                ? "text-red-500/70"
                : model.status === "AUTHENTIC"
                ? "text-green-600/70"
                : "text-yellow-600/70"
            }`}
          >
            {model.status === "AUTHENTIC" && <CheckCircle className="w-4 h-4" />}
            {model.status === "SUSPICIOUS" && <AlertCircle className="w-4 h-4 " />}
            {model.status === "MANIPULATED" && <XCircle className="w-4 h-4 " />}
          </span>
          </div>
        </div>

{/* Right Side: Description + Progress */}
<div className="flex flex-col justify-between sm:ml-6 w-full sm:w-48">
  {/* Top: Description */}
    <p className="mt-1 text-[10px] text-gray-400">
      Confidence: {model.score ? `${(model.score * 100).toFixed(1)}%` : "N/A"}
    </p>

  {/* Bottom: Progress bar + confidence */}
  <div className="flex flex-col items-end">
    <div className="w-full bg-neutral-700 h-1.5 rounded-full">
      <div
        className={`h-1.5 rounded-full ${
          model.status === "MANIPULATED"
            ? "bg-red-500"
            : model.status === "AUTHENTIC"
            ? "bg-green-600"
            : "bg-sky-600 animate-pulse"
        }`}
        style={{ width: `${model.score ? model.score * 100 : 10}%` }}
      ></div>
    </div>
  </div>
          {/* Description */}
          <p className="text-[10px] text-gray-400 sm:text-left">{description}</p>
        </div>
      </div>
    );
  })}
</div>
          </div>
        </div>

      </main>
    </div>
  );
}
