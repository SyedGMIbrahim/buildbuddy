import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { auth } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { userId: userId ?? null };
});

const t = initTRPC.context<{ userId: string | null }>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});