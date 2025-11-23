"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationResult = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const verificationResultSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    scanId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["image", "video", "audio"], required: true },
    status: { type: String, enum: ["PROCESSING", "AUTHENTIC", "SUSPICIOUS", "DEEPFAKE"], required: true },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    modelsUsed: [{ type: String }],
    uploadedDate: { type: Date, default: Date.now },
    imageUrl: { type: String },
    description: { type: String },
    features: [{ type: String }],
}, { timestamps: true });
// Index for faster queries
verificationResultSchema.index({ userId: 1, createdAt: -1 });
exports.VerificationResult = mongoose_1.default.models?.VerificationResult || mongoose_1.default.model("VerificationResult", verificationResultSchema);
