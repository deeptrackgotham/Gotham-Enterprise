import type { IncomingHttpHeaders } from "http";
import fs from "fs";
import os from "os";
import path from "path";
import fetch from "node-fetch";

const RD_MOCK = (process.env.RD_MOCK || "false").toLowerCase() === "true";

export interface RDModelResult {
  name: string;
  status: string;
  score: number;
}

export interface RDResult {
  requestId: string;
  status: string;
  score: number;
  models: RDModelResult[];
}

export async function verifyMedia(options: {
  url?: string;
  fileBuffer?: Buffer;
  headers?: IncomingHttpHeaders;
  fileType?: "image" | "video" | "audio";
}): Promise<RDResult> {
  if (RD_MOCK) {
    return {
      requestId: "mock-job",
      status: "AUTHENTIC",
      score: 0.42,
      models: [
        { name: "rd-context-img", status: "AUTHENTIC", score: 0.07 },
        { name: "rd-img-ensemble", status: "AUTHENTIC", score: 0.364 },
      ],
    };
  }

  let tmpPath: string | null = null;

  try {
    console.log("RD import attempt...");
    const RD = require("@realitydefender/realitydefender");
    console.log("RD loaded:", Object.keys(RD));

    const apiKey = process.env.REALITY_DEFENDER_API_KEY;
    if (!apiKey) throw new Error("REALITY_DEFENDER_API_KEY not set");

    // Instantiate client
    const client = new RD.RealityDefender({ apiKey });

    // Prepare local file
    let filePath: string;
    if (options.fileBuffer) {
      const ext = options.fileType === "video" ? ".mp4" : ".png";
      tmpPath = path.join(os.tmpdir(), `rd-upload-${Date.now()}${ext}`);
      fs.writeFileSync(tmpPath, options.fileBuffer);
      filePath = tmpPath;
    } else if (options.url) {
      const response = await fetch(options.url, { headers: options.headers });
      if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const ext = path.extname(options.url) || ".png";
      tmpPath = path.join(os.tmpdir(), `rd-upload-${Date.now()}${ext}`);
      fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
      filePath = tmpPath;
    } else {
      throw new Error("No media provided");
    }

    console.log("Calling RD.detect with:", { filePath, type: options.fileType || "image" });

    // Upload + analyze — detect() returns full result now
    const detectResp = await client.detect({
      filePath,
      type: options.fileType || "image",
    });

    const jobId = detectResp?.id || detectResp?.requestId;
    if (!jobId) throw new Error("Reality Defender did not return a job ID");

    console.log("RD job completed:", jobId);

    // Map and return result
    return {
      requestId: jobId,
      status: detectResp.status,
      score: detectResp.score ?? 0,
      models:
        detectResp.models?.map((m: any) => ({
          name: m.name,
          status: m.status,
          score: m.score,
        })) ?? [],
    };
  } catch (err) {
    console.error("Reality Defender verification failed:", err);
    throw new Error(`Reality Defender verification failed: ${(err as Error).message}`);
  } finally {
    // Cleanup temp file
    try {
      if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (cleanupErr) {
      console.warn("Failed to clean up RD temp file:", cleanupErr);
    }
  }
}

export default verifyMedia;
