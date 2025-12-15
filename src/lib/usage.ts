import { prisma } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Credit costs for different operations
export const CREDIT_COSTS = {
  CREATE_PROJECT: 10,
  SEND_MESSAGE: 5,
} as const;

// Plan limits based on Clerk subscriptions
export const PLAN_LIMITS = {
  free: 50,
  pro: 100,
} as const;

/**
 * Get user's subscription plan from Clerk
 */
async function getUserPlan(userId: string): Promise<keyof typeof PLAN_LIMITS> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const publicMetadata = user.publicMetadata || {};
    const subscriptionPlan = publicMetadata.subscription_plan as string;

    // Check if user has "pro" subscription
    if (subscriptionPlan === "pro") {
      return "pro";
    }
    
    return "free";
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return "free"; // Default to free on error
  }
}

/**
 * Get or create current billing period usage for a user
 */
export async function getCurrentUsage(userId: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of current month

  let usage = await prisma.usage.findFirst({
    where: {
      userId,
      periodStart: {
        gte: periodStart,
      },
      periodEnd: {
        lte: periodEnd,
      },
    },
  });

  // Create new usage record if none exists for current period
  if (!usage) {
    const userPlan = await getUserPlan(userId);
    usage = await prisma.usage.create({
      data: {
        userId,
        creditsUsed: 0,
        creditsLimit: PLAN_LIMITS[userPlan],
        periodStart,
        periodEnd,
      },
    });
  } else {
    // Sync credit limit with current subscription plan
    const userPlan = await getUserPlan(userId);
    const expectedLimit = PLAN_LIMITS[userPlan];
    
    if (usage.creditsLimit !== expectedLimit) {
      usage = await prisma.usage.update({
        where: { id: usage.id },
        data: { creditsLimit: expectedLimit },
      });
    }
  }

  return usage;
}

/**
 * Check if user has enough credits for an operation
 */
export async function checkCredits(userId: string, cost: number): Promise<boolean> {
  const usage = await getCurrentUsage(userId);
  return usage.creditsUsed + cost <= usage.creditsLimit;
}

/**
 * Consume credits for an operation
 * @throws Error if user doesn't have enough credits
 */
export async function consumeCredits(userId: string, cost: number) {
  const usage = await getCurrentUsage(userId);

  if (usage.creditsUsed + cost > usage.creditsLimit) {
    throw new Error(`Insufficient credits. You need ${cost} credits but only have ${usage.creditsLimit - usage.creditsUsed} remaining.`);
  }

  return await prisma.usage.update({
    where: { id: usage.id },
    data: {
      creditsUsed: {
        increment: cost,
      },
    },
  });
}

/**
 * Update user's credit limit based on their Clerk subscription
 */
export async function updateUserCreditLimit(userId: string, plan: keyof typeof PLAN_LIMITS) {
  const usage = await getCurrentUsage(userId);
  
  return await prisma.usage.update({
    where: { id: usage.id },
    data: {
      creditsLimit: PLAN_LIMITS[plan],
    },
  });
}

/**
 * Get usage stats for current user (hook for client components)
 */
export async function getUserUsageStats() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const usage = await getCurrentUsage(userId);
  
  return {
    creditsUsed: usage.creditsUsed,
    creditsLimit: usage.creditsLimit,
    creditsRemaining: usage.creditsLimit - usage.creditsUsed,
    percentageUsed: Math.round((usage.creditsUsed / usage.creditsLimit) * 100),
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
  };
}
