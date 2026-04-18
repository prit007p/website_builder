import { inngest } from "./client";
import { gemini,createAgent } from '@inngest/agent-kit';
import {Sandbox} from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step}) => {

    
    const sandboxId = await step.run("get-sandbox-id",async() => {
      const sandbox = await Sandbox.create("pritbaldaniya/website_builder_template-2");
      return sandbox.sandboxId;
    }); 

    const agent = createAgent({
      name: "agent-1",
      system:"you are professional webdeveloper who code clean and simple code in nextjs and react.",
      model: gemini({model:"gemini-2.5-flash",apiKey: process.env.API_KEY}),
    });

    const  output  = await agent.run(
     "build this component using tailwindcss" + event.data.text,
    );

    const sandboxurl = await step.run("get-sandbox-url",async() => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`;
    });

    console.log(output , sandboxurl);
    return {output , sandboxurl};
    },
);