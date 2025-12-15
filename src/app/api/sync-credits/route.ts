import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUsage } from "@/lib/usage";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    const publicMetadata = user.publicMetadata || {};
    const privateMetadata = user.privateMetadata || {};
    
    console.log("User metadata:", {
      userId,
      publicMetadata,
      privateMetadata,
    });

    const usage = await getCurrentUsage(userId);

    return NextResponse.json({
      success: true,
      usage: {
        creditsUsed: usage.creditsUsed,
        creditsLimit: usage.creditsLimit,
        creditsRemaining: usage.creditsLimit - usage.creditsUsed,
      },
      metadata: {
        public: publicMetadata,
        private: privateMetadata,
      },
    });
  } catch (error) {
    console.error("Error syncing credits:", error);
    return NextResponse.json(
      { error: "Failed to sync credits" },
      { status: 500 }
    );
  }
}
