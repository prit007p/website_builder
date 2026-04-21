'use client'

import { useMutation, useQuery,  } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Page =  () => {

  const [prompt, setPrompt] = useState("");
  const trpc = useTRPC();
  const getMessage = useQuery(trpc.message.getMany.queryOptions());
  const createMessage =  useMutation(trpc.message.create.mutationOptions({}));

  console.log(getMessage.data);
  
  return (
    <div>
      <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Button onClick={() => { 
          createMessage.mutate({ value: prompt }) 
        }}>
        click me
      </Button>
      
    </div>
  );
};

export default Page;