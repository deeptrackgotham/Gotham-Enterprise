"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const fs_1 = __importDefault(require("fs"));
const realitydefender_1 = require("@realitydefender/realitydefender");
const db_1 = require("../lib/db");
const VerificationResult_1 = require("../lib/models/VerificationResult");
// Redis connection options
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
};
// Create the worker
const scanWorker = new bullmq_1.Worker("scanQueue", async (job) => {
    try {
        await (0, db_1.connectToDatabase)();
        const { userId, filePath, scanId } = job.data;
        if (!filePath)
            throw new Error("No filePath provided for scan job");
        // Run Reality Defender scan
        const rd = new realitydefender_1.RealityDefender({ apiKey: process.env.REALITY_DEFENDER_API_KEY });
        // Call detect with the filePath. The SDK may accept additional
        // options for media type; if you confirm the exact option name,
        // add it here. Omitting it avoids a type mismatch across SDK versions.
        const rdResult = await rd.detect({ filePath });
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
        await VerificationResult_1.VerificationResult.findOneAndUpdate({ scanId }, {
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
            await VerificationResult_1.VerificationResult.findOneAndUpdate({ scanId: job.data.scanId }, { status: "ERROR" });
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
