
import { messagesRouter } from '@/modules/messages/server/procedure';
import {  createTRPCRouter } from '../init';
 
export const appRouter = createTRPCRouter({
    message:messagesRouter,
});
 
export type AppRouter = typeof appRouter;