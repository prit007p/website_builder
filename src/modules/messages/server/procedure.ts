import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return await prisma.message.findMany({
      orderBy: {
        updateAt: "asc",
      },
    });
  }),

  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "message is required" }),
        projectId: z.string().min(1, { message: "message is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "RESULT",
          projectId: input.projectId,
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          input: input.value,
          projectId: input.projectId,
        },
      });

      return newMessage;
    }),
});
