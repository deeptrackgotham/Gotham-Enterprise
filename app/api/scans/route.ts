import { connectToDatabase } from "@/lib/db";
import { VerificationResult } from "@/lib/models/VerificationResult";
import { User } from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// POST: Create a new scan/verification
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectToDatabase();

    // Check user credits
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Create verification result
    const result = new VerificationResult({
      userId,
      ...body,
    });

    await result.save();

    // Deduct credit
    user.credits -= 1;
    await user.save();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating scan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch all scans for user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const scans = await VerificationResult.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(scans, { status: 200 });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
