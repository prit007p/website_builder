"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Page = () => {

  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const trpc = useTRPC();
  const createProject = useMutation(trpc.project.create.mutationOptions({
    onSuccess:(data)=>{
      router.push(`/projects/${data.id}`);
    }
  }));

  console.log(createProject.data);

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="flex flex-col gap-[20px] w-3/4">
        <Input className="w-full" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button
          onClick={() => {
            createProject.mutate({ value: prompt });
            toast("Submitted")
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Page;
