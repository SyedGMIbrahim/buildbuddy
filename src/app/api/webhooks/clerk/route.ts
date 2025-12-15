import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { updateUserCreditLimit } from "@/lib/usage";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id: userId } = evt.data;

  console.log(`Webhook received: ${eventType} for user ${userId}`);

  try {
    // Handle subscription created or updated
    if (
      eventType === "user.updated" ||
      eventType === "organizationMembership.updated"
    ) {
      // Check if user has subscription metadata
      const publicMetadata = evt.data.public_metadata || {};
      const subscriptionPlan = publicMetadata.subscription_plan;

      if (subscriptionPlan === "pro") {
        await updateUserCreditLimit(userId, "pro");
        console.log(`Updated user ${userId} to pro plan (100 credits)`);
      } else if (subscriptionPlan === "free_user") {
        await updateUserCreditLimit(userId, "free");
        console.log(`Updated user ${userId} to free plan (50 credits)`);
      }
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
