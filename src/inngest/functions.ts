import { Sandbox } from "@e2b/code-interpreter"
import { gemini, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox", async () => {
      const sandbox = await Sandbox.create("buildbuddy-nextjs-test-1");
      return sandbox.sandboxId ;
    })

    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert next.js developer. You write readable and maintainable code. You write simple Next.js and React snippets. ",
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet : ${event.data.value}` ,
    );
    console.log(output);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    return { output, sandboxUrl };
  },
);