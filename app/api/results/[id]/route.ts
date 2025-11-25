import { connectToDatabase } from "@/lib/db";
import { VerificationResult } from "@/lib/models/VerificationResult";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface RouteParams {
  id: string;
}

// GET: Fetch specific result by scanId
export async function GET(
  req: NextRequest,
  context: { params: RouteParams }
) {
  const { params } = context;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const result = await VerificationResult.findOne({
      scanId: params.id,
      userId,
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a result
export async function DELETE(
  req: NextRequest,
  context: { params: RouteParams }
) {
  const { params } = context;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const result = await VerificationResult.findOneAndDelete({
      scanId: params.id,
      userId,
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Result deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
