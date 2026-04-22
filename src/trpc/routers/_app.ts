
import { messagesRouter } from '@/modules/messages/server/procedure';
import {  createTRPCRouter } from '../init';
import { projectRouter } from '@/modules/projects/server/procedure';
 
export const appRouter = createTRPCRouter({
    message:messagesRouter,
    project:projectRouter,
});
 
export type AppRouter = typeof appRouter;