import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
 
export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        text:z.string(),
      }),
    )
    .mutation(async ({input}) =>{

      console.log(input);

      await inngest.send({
        name: "test/hello.world",
        data: {input: input.text},
      });
    }),
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `${opts.input.text}`,
      };
    }),
});
 
export type AppRouter = typeof appRouter;