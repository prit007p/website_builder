import { getQueryClient } from '@/trpc/server';
import { dehydrate, HydrationBoundary, usePrefetchQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { trpc } from '@/trpc/server';
import Cleint from './client';

const Page = async () => {
  const queryClinet = getQueryClient();
  void queryClinet.prefetchQuery(trpc.hello.queryOptions({ text : "hello"}));

  return (
    <HydrationBoundary state={dehydrate(queryClinet)}>
      <Suspense>
        <Cleint />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;