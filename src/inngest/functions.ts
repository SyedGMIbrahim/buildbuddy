import { gemini, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert next.js developer. You write readable and maintainable code. You write simple Next.js and React snippets. ",
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet : ${event.data.value}` ,
    );
    console.log(output);

    return { output };
  },
);