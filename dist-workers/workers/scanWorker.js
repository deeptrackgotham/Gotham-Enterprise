"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const path_1 = __importDefault(require("path"));
// Load environment variables from .env.local when running the worker so
// runtime code (e.g. `lib/db`) can access `process.env.MONGODB_URI`.
// Use a safe require so the worker doesn't crash if `dotenv` isn't installed.
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _dotenv = require("dotenv");
    _dotenv.config({ path: path_1.default.resolve(process.cwd(), ".env.local") });
}
catch (e) {
    // dotenv not available; assume environment variables are set externally
}
const fs_1 = __importDefault(require("fs"));
const realitydefender_1 = require("@realitydefender/realitydefender");
// Require app modules after dotenv is loaded so they see environment variables.
// Use require() instead of top-level imports to avoid lib/db throwing
// during module initialization when MONGODB_URI isn't yet set.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { connectToDatabase } = require("../lib/db");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { VerificationResult } = require("../lib/models/VerificationResult");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { User } = require("../lib/models/User");
// Redis connection options
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
};
// Create the worker
const scanWorker = new bullmq_1.Worker("scanQueue", async (job) => {
    try {
        await connectToDatabase();
        const { userId, filePath, scanId } = job.data;
        if (!filePath)
            throw new Error("No filePath provided for scan job");
        // Run Reality Defender scan
        const rd = new realitydefender_1.RealityDefender({ apiKey: process.env.REALITY_DEFENDER_API_KEY });
        // Call detect with the filePath. The SDK may accept additional
        // options for media type; if you confirm the exact option name,
        // add it here. Omitting it avoids a type mismatch across SDK versions.
        console.log("Calling RD...");
        const rdResult = await rd.detect({ filePath });
        console.log("RAW RD RESULT:", rdResult);
        // Map RD result
        const overallScore = typeof rdResult.score === "number" ? rdResult.score : 0;
        const confidenceScore = Math.round(overallScore * 100);
        let mappedStatus = "SUSPICIOUS";
        if (rdResult.status === "AUTHENTIC")
            mappedStatus = "AUTHENTIC";
        else if (rdResult.status === "MANIPULATED")
            mappedStatus = overallScore >= 0.5 ? "DEEPFAKE" : "SUSPICIOUS";
        const modelsUsed = Array.isArray(rdResult.models) ? rdResult.models.map((m) => m.name) : [];
        const features = rdResult.models?.map((m) => `${m.name}:${m.status}:${Math.round((m.score || 0) * 100)}`) || [];
        // Update the DB record
        await VerificationResult.findOneAndUpdate({ scanId }, {
            status: mappedStatus,
            confidenceScore,
            modelsUsed,
            description: JSON.stringify({ rd: rdResult }),
            features,
        });
        // Clean up temp file
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
        console.log(`Scan job ${scanId} completed successfully`);
    }
    catch (err) {
        console.error("Scan worker error:", err);
        // Optionally mark scan as error in DB
        if (job.data.scanId) {
            await VerificationResult.findOneAndUpdate({ scanId: job.data.scanId }, { status: "ERROR" });
        }
    }
}, {
    concurrency: 2,
    connection,
});
scanWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id ?? "unknown"} failed:`, err);
});
scanWorker.on("completed", (job) => {
    console.log(`Job ${job.id} finished`);
});
console.log("Scan worker started and listening for jobs...");
