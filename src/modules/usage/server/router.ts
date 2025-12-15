import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getUserUsageStats } from "@/lib/usage";

export const usageRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await getUserUsageStats();
  }),
});
