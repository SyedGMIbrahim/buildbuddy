import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import z from "zod";

export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(
            z.object({
                id: z.string().min(1, { message: "ID is required" }),
            })
        )
        .query(async ({ input }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id
                }
            });

            if (!existingProject) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            return existingProject;
        }),
    getMany: baseProcedure
        .query(async () => {
            const projects = await prisma.project.findMany({
                orderBy: {
                    updatedAt: "desc"
                },
            });

            return projects;
        }),
    create: protectedProcedure
        .input(
            z.object({
                value : z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // First, ensure the user exists in our database
            await prisma.user.upsert({
                where: { id: ctx.userId! },
                update: {}, // No updates needed if exists
                create: { id: ctx.userId! } // Create if doesn't exist
            });
            
            const createdProject = await prisma.project.create({
                data: {
                    name: generateSlug(2, {
                        format: "kebab",
                    }),
                    userId: ctx.userId!,
                    messages: {
                        create: {
                            content: input.value,
                            role: "USER",
                            type: "RESULT"
                        }
                    }
                },
            });

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: createdProject.id,
                }
            });

            return createdProject;
        }),
});