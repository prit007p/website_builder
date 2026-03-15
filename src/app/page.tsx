'use client'

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

const Page =  () => {

  const trpc = useTRPC();
  const invoke =  useMutation(trpc.invoke.mutationOptions({}));
  
  return (
    <div>
      <Button onClick={()=>{ invoke.mutate({text:"hello world"})}}>
        click me
      </Button>
    </div>
  );
};

export default Page;