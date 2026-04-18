'use client'

import { useMutation,  } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Page =  () => {

  const [prompt, setPrompt] = useState("");
  const trpc = useTRPC();
  const invoke =  useMutation(trpc.invoke.mutationOptions({}));
  
  return (
    <div>
      <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Button onClick={() => { invoke.mutate({ text: prompt }) }}>
        click me
      </Button>
    </div>
  );
};

export default Page;