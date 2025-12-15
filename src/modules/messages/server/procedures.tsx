import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits, CREDIT_COSTS } from "@/lib/usage";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                projectId: z.string().min(1, { message: "Project ID is required" }),
            })
        )
        .query(async ({ input }) => {
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId
                },
                include: {
                    fragment: true
                },
                orderBy: {
                    updatedAt: "asc"
                },
            });

            return messages;
        }),
    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
                projectId: z.string().min(1, { message: "Project ID is required" }),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Check and consume credits before sending message
            try {
                await consumeCredits(ctx.userId!, CREDIT_COSTS.SEND_MESSAGE);
            } catch (error) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: error instanceof Error ? error.message : "Insufficient credits",
                });
            }

            const createdMessage = await prisma.message.create({
                data: {
                    projectId: input.projectId,
                    content: input.value,
                    role: "USER",
                    type: "RESULT"
                }
            }); 

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: input.projectId,
                }
            });

            return createdMessage;
        }),
});