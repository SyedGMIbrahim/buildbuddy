import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { updateUserCreditLimit } from "@/lib/usage";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let evt: any;

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

  const eventType = evt.type;
  const userId = evt.data.id || evt.data.user_id;

  console.log(`Webhook received: ${eventType}`, JSON.stringify(evt.data, null, 2));

  try {
    if (
      eventType === "user.updated" ||
      eventType === "user.created" ||
      eventType === "subscription.created" ||
      eventType === "subscription.updated" ||
      eventType === "organizationMembership.updated"
    ) {
      const publicMetadata = evt.data.public_metadata || {};
      const privateMetadata = evt.data.private_metadata || {};
      
      let subscriptionPlan = 
        publicMetadata.subscription_plan || 
        privateMetadata.subscription_plan ||
        evt.data.subscription_plan ||
        evt.data.plan;

      if (!subscriptionPlan && evt.data.subscriptions && evt.data.subscriptions.length > 0) {
        const activeSubscription = evt.data.subscriptions.find((sub: any) => sub.status === "active");
        if (activeSubscription) {
          subscriptionPlan = activeSubscription.plan?.name || activeSubscription.plan_id;
        }
      }

      console.log(`User ${userId} detected subscription plan: ${subscriptionPlan}`);

      if (subscriptionPlan === "pro" || subscriptionPlan?.toLowerCase().includes("pro")) {
        await updateUserCreditLimit(userId, "pro");
        console.log(`✅ Updated user ${userId} to pro plan (100 credits)`);
      } else if (subscriptionPlan === "free_user" || subscriptionPlan === "free" || !subscriptionPlan) {
        await updateUserCreditLimit(userId, "free");
        console.log(`✅ Updated user ${userId} to free plan (50 credits)`);
      }
    }
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
