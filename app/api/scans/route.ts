// app/api/scans/route.ts
import { connectToDatabase } from "@/lib/db";
import { VerificationResult } from "@/lib/models/VerificationResult";
import { User } from "@/lib/models/User";
import verifyMedia, { RDModelResult } from "@/lib/realityDefender";
import { verifyMediaBulk, BulkMedia } from "@/lib/verifyMediaBulk";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET: fetch all scans for the signed-in user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const scans = await VerificationResult.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(scans, { status: 200 });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: create new scan(s)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });

    // Handle bulk verification
    if (Array.isArray(body.files) && body.files.length > 0) {
      const bulkItems: BulkMedia[] = body.files.map(f => ({
        fileBuffer: f.base64 ? Buffer.from(f.base64.replace(/^data:.+;base64,/, ""), "base64") : undefined,
        url: f.url,
        fileType: f.fileType,
        fileName: f.fileName,
      }));

      const bulkResults = await verifyMediaBulk(bulkItems, 3);

      const savedResults = [];
      for (const { media, result } of bulkResults) {
        if (!result) continue;

        const overallScore = typeof result.score === "number" ? result.score : 0;
        const confidenceScore = Math.round(overallScore * 100);

        let mappedStatus: "AUTHENTIC" | "SUSPICIOUS" | "DEEPFAKE" = "SUSPICIOUS";
        if (result.status === "AUTHENTIC") mappedStatus = "AUTHENTIC";
        else if (result.status === "MANIPULATED") mappedStatus = overallScore >= 0.5 ? "DEEPFAKE" : "SUSPICIOUS";

        const modelsUsed = Array.isArray(result.models) ? result.models.map(m => m.name) : [];

        const vr = new VerificationResult({
          userId,
          scanId: media.fileName || `scan-${Date.now()}`,
          fileName: media.fileName || "unknown",
          fileType: media.fileType || "image",
          status: mappedStatus,
          confidenceScore,
          modelsUsed,
          imageUrl: media.url,
          description: JSON.stringify({ rd: result }),
          features: result.models?.map((m: RDModelResult) => `${m.name}:${m.status}:${Math.round(m.score * 100)}`) || [],
        });

        await vr.save();
        savedResults.push(vr);

        user.credits -= 1;
      }
      await user.save();

      return NextResponse.json(savedResults, { status: 201 });
    }

    // Single-file verification
    const mediaUrl = (body.fileUrl || body.imageUrl || body.url) as string | undefined;
    const base64 = body.base64 as string | undefined;

    if (!mediaUrl && !base64) throw new Error("No media provided");

    let rdResult = null;
    if (base64) {
      const buffer = Buffer.from(base64.replace(/^data:.+;base64,/, ""), "base64");
      rdResult = await verifyMedia({ fileBuffer: buffer, fileType: body.fileType });
    } else if (mediaUrl) {
      rdResult = await verifyMedia({ url: mediaUrl, fileType: body.fileType });
    }

    const overallScore = typeof rdResult.score === "number" ? rdResult.score : 0;
    const confidenceScore = Math.round(overallScore * 100);
    let mappedStatus: "AUTHENTIC" | "SUSPICIOUS" | "DEEPFAKE" = "SUSPICIOUS";
    if (rdResult.status === "AUTHENTIC") mappedStatus = "AUTHENTIC";
    else if (rdResult.status === "MANIPULATED") mappedStatus = overallScore >= 0.5 ? "DEEPFAKE" : "SUSPICIOUS";

    const modelsUsed = Array.isArray(rdResult.models) ? rdResult.models.map((m) => m.name) : [];

    const result = new VerificationResult({
      userId,
      scanId: body.scanId || `scan-${Date.now()}`,
      fileName: body.fileName || mediaUrl?.split("/").pop() || "unknown",
      fileType: body.fileType || "image",
      status: mappedStatus,
      confidenceScore,
      modelsUsed,
      imageUrl: mediaUrl || `data:${body.fileType};base64,${base64}`, 
      description: JSON.stringify({ rd: rdResult }),
      features: rdResult.models?.map((m: RDModelResult) => `${m.name}:${m.status}:${Math.round(m.score * 100)}`) || [],
    });

    await result.save();
    user.credits -= 1;
    await user.save();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating scan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
