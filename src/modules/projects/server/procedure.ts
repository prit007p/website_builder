import prisma from "@/lib/db";
import { generateSlug } from "random-word-slugs";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { inngest } from "@/inngest/client";

export const projectRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updateAt: "desc",
      },
    });
    return projects;
  }),

  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "message is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: { 
            input: input.value,
            projectId:newProject.id
        },
      });

      return newProject;
    }),
});
