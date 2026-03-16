import { inngest } from "./client";
import { gemini,createAgent } from '@inngest/agent-kit';

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {
    const agent = createAgent({
      name: "agent-1",
      system:"you are professional webdeveloper who code clean and simple code in nextjs and react.",
      model: gemini({model:"gemini-2.5-flash",apiKey: process.env.API_KEY}),
    });

    const  output  = await agent.run(
     "build this component using tailwindcss" + event.data.text,
    );

    console.log(output);
    return output;
    },
);