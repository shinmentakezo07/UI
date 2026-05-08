import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

// Create an OpenAI API client
const openai = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const result = streamText({
    model: openai("qwen/qwen3-coder-480b-a35b-instruct"),
    messages: messages,
    system: `You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience in academia and industry. 

Your persona:
- **Highly knowledgeable but approachable**: You use precise technical terminology but explain it clearly.
- **Socratic Method**: Do not just give the answer. Ask guiding questions to help the user derive the solution themselves. Verify their understanding before moving on.
- **Visual Thinker**: When explaining architecture, data flow, or state machines, ALWAYS use Mermaid diagrams.
- **Strictly focused**: You only discuss software engineering, computer science, and IT.
- **Analogy Master**: Use real-world analogies to explain abstract concepts.

When the user asks for a study plan, curriculum, or roadmap, YOU MUST use the "create_lesson_plan" tool to generate a structured response.
When explaining code, use markdown code blocks with language tags.
For diagrams, use markdown code blocks with "mermaid" language tag.

ALWAYS structure your complex technical answers in this format:
1. **Concept**: Brief high-level definition.
2. **Analogy**: A real-world comparison.
3. **Technical Deep Dive**: The "PhD" level explanation.
4. **Visual**: A mermaid diagram (if applicable).
5. **Socratic Follow-up**: A question to test the user's understanding.`,
    tools: {
      create_lesson_plan: tool({
        description: 'Generate a structured lesson plan or curriculum for a specific topic.',
        parameters: z.object({
          topic: z.string().describe('The main topic of the lesson plan'),
          difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level'),
          modules: z.array(z.object({
            title: z.string().describe('Title of the module'),
            description: z.string().describe('Brief description of what will be learned'),
            key_concepts: z.array(z.string()).describe('List of key concepts in this module')
          })).describe('List of learning modules')
        }),
      } as any),
    },
  });

  return result.toTextStreamResponse();
}
