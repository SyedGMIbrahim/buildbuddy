import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();

    if (!plan || (plan !== "pro" && plan !== "free")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const client = await clerkClient();
    
    await client.users.updateUser(userId, {
      publicMetadata: {
        subscription_plan: plan,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated subscription to ${plan}`,
      plan,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
