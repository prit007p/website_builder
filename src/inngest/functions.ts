import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/app/prompt";
import prisma from "@/lib/db";

export const codeagent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create(
        "pritbaldaniya/website_builder_template-2",
      );
      return sandbox.sandboxId;
    });

    const agent = createAgent({
      name: "agent-1",
      description:"expert coding agent",
      system:PROMPT,
      model: gemini({ model: "gemini-2.5-flash", apiKey: process.env.API_KEY }),
      tools: [
        createTool({
          name: "terminal",
          description: "use  the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffer = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffer.stdout += data;
                  },
                  onStderr: (data) => {
                    buffer.stderr += data;
                  },
                });
                return result.stdout;
              } catch (err) {
                console.log(
                  `command found error: ${err} \n  stderr : ${buffer.stderr} \n stdout : ${buffer.stdout} `,
                );
                return `command found error: ${err} \n  stderr : ${buffer.stderr} \n stdout : ${buffer.stdout} `;
              }
            });
          },
        }),
        createTool({
          name: "createOrupdatefiles",
          description: "create or update file in sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrupdatefiles",
              async () => {
                try {
                  const updateFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updateFiles[file.path] = file.content;
                  }
                  return updateFiles;
                } catch (err) {
                  return "Error:" + err;
                }
              },
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files form a sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            try {
               return await step?.run("read-files", async () => {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              });
            } catch (err) {
              return "error:" + err;
            }
          },
        }),
      ],
     lifecycle:{
      onResponse: async({result,network})=>{
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);
          if(lastAssistantMessageText && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
      }
     }
    });

    const network = createNetwork({
      name:"coding-agent-network",
      agents:[agent],
      maxIter:15,
      router:async({network})=>{
        const summary = network.state.data.summary;
        if(summary){
          return;
        }
        return agent;
      }
    })



    const inputValue = event.data?.input;

    if (!inputValue) {
      throw new Error("event.data.input is required");
    }

    const result = await network.run(inputValue);

    const isError = !result.state.data.summary  || Object.keys(result.state.data.files|| {}).length===0;

    const sandboxurl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result",async()=>{

      if(isError){
        return await prisma.message.create({
          data:{
            content:"something went wrong try again!",
            role:'ASSISTANT',
            type:"ERROR",
            projectId:event.data.projectId
          }
        });
      }

      return await prisma.message.create({
        data:{
          content : result.state.data.summary,
          role:'ASSISTANT',
          type:'RESULT',
          projectId:event.data.projectId,
          fragment:{
            create:{
              sandboxUrl:sandboxId,
              title:"Fragment",
              files:result.state.data.files
            }
          }
        },
      });
    });

    return { 
      url: sandboxurl,
      summary : result.state.data.summary,
      files:result.state.data.files
    };
  },
);
