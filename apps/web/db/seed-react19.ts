import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { and, eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function upsertCourse() {
  console.log("Seeding React 19 course (react-19)...");

  // Upsert course
  let course = await db.query.courses.findFirst({
    where: eq(schema.courses.slug, "react-19"),
    with: { lessons: true },
  });

  if (!course) {
    const [created] = await db
      .insert(schema.courses)
      .values({
        title: "React 19 & Server Components",
        description:
          "Complete React 19 course: modern rendering, Server Components, data fetching patterns, performance, and production-grade architecture.",
        slug: "react-19",
        level: "Intermediate",
        published: true,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create react-19 course");
    }

    course = created as any;
    console.log("✓ Created course react-19", created.id);
  } else {
    await db
      .update(schema.courses)
      .set({
        title: "React 19 & Server Components",
        description:
          "Complete React 19 course: modern rendering, Server Components, data fetching patterns, performance, and production-grade architecture.",
        level: "Intermediate",
        published: true,
      })
      .where(eq(schema.courses.id, course.id));
    console.log("✓ Updated course react-19", course.id);
  }

  if (!course) {
    throw new Error("Course upsert failed: course is undefined");
  }

  // Replace lessons (simple approach)
  await db.delete(schema.lessons).where(eq(schema.lessons.courseId, course.id));

  const lessons: Array<{
    title: string;
    slug: string;
    order: number;
    content: string;
    codeSnippet: string;
    exercises: string;
    quiz: string;
  }> = [
    {
      title: "React 19 Overview + What's New",
      slug: "react-19-overview",
      order: 1 as number,
      content: `# React 19 Overview\n\nReact 19 focuses on **better async UX**, **more consistent patterns for data** and **improved ergonomics** when building modern apps (especially with frameworks like Next.js).\n\n## Key themes\n- Async UI (streaming / suspending)\n- Server-first architecture with Server Components\n- Cleaner actions and transitions\n- Better performance practices\n\n## What you will build\n- A server-first React app with Server Components\n- A client interactive layer for forms + mutations\n- A robust data fetching and caching strategy\n\n\n\n## Quick mental model\nReact now supports a world where: \n- **Server renders most UI** (fast + secure)\n- **Client components** handle interactions\n- **Suspense** coordinates loading\n\n\n\n### Your first task\nIdentify which parts of your app must run on the client and which can stay on the server.\n`,
      codeSnippet: `// React 19 mindset: server-first UI + client for interactions\n\n// CLIENT COMPONENT EXAMPLE\n\n\"use client\";\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n  );\n}\n`,
      exercises: JSON.stringify([
        {
          question:
            "List 3 UI elements in your app that should be Client Components, and 3 that should be Server Components.",
          hint: "Client: input/forms, toggles, modals. Server: lists, static headers, content, DB reads.",
        },
      ]),
      quiz: JSON.stringify([
        {
          question: "What is the main goal of Server Components?",
          options: [
            "Make all code run in the browser",
            "Move rendering closer to data and reduce client JS",
            "Replace CSS",
            "Remove React hooks",
          ],
          answer: "Move rendering closer to data and reduce client JS",
        },
      ]),
    },
    {
      title: "Client vs Server Components (Practical Rules)",
      slug: "client-vs-server-components",
      order: 2 as number,
      content: `# Client vs Server Components\n\n## Server Components (default)\nUse when you: \n- Fetch from DB\n- Use secrets / server-only SDKs\n- Want faster initial load and less JS\n\n## Client Components\nUse when you: \n- Use state/effects\n- Use browser APIs\n- Handle user interaction\n\n## Rule of thumb\nDefault to Server Components until you need client-only features.\n\n## Component Flow\nServer Components can pass props to Client Components, which handle user events. Server Components can fetch data directly from the database.\n`,
      codeSnippet: `// Server Component: can fetch data\nexport default async function Page() {\n  const data = await fetch('https://example.com/api').then(r => r.json());\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}\n`,
      exercises: JSON.stringify([
        {
          question:
            "Convert a component that fetches data using useEffect into a Server Component that fetches on the server.",
          hint: "Remove useEffect/useState, make component async, fetch directly.",
        },
      ]),
      quiz: JSON.stringify([
        {
          question: "Which feature forces you into a Client Component?",
          options: ["useState", "fetch()", "reading from database", "server env vars"],
          answer: "useState",
        },
      ]),
    },
    {
      title: "Suspense + Streaming UI",
      slug: "suspense-streaming",
      order: 3 as number,
      content: `# Suspense + Streaming\n\nSuspense lets React **pause rendering** until data is ready, and stream the UI in chunks.\n\n## Why it matters\n- Better perceived performance\n- Compose loading states\n\n## Example Usage\nWrap components in Suspense boundaries with fallback UI while data loads.\n`,
      codeSnippet: `import { Suspense } from 'react';\n\nasync function Slow() {\n  await new Promise(r => setTimeout(r, 1000));\n  return <div>Loaded after 1s</div>;\n}\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<div>Loading…</div>}>\n      {/* @ts-expect-error Server Component */}\n      <Slow />\n    </Suspense>\n  );\n}\n`,
      exercises: JSON.stringify([
        {
          question:
            "Add 2 Suspense boundaries in a page so the header renders instantly but the feed loads later.",
          hint: "Wrap slow parts in nested Suspense.",
        },
      ]),
      quiz: JSON.stringify([
        {
          question: "Suspense fallback renders when…",
          options: [
            "A component suspends (is waiting for something)",
            "There is a CSS error",
            "The browser is offline",
            "The user clicks a button",
          ],
          answer: "A component suspends (is waiting for something)",
        },
      ]),
    },
    {
      title: "React Actions + Forms (Modern Mutations)",
      slug: "react-actions-forms",
      order: 4 as number,
      content: `# React Actions + Forms\n\nModern React + frameworks use **actions** for server mutations.\n\n## Pattern\n- Keep validation on server\n- Return result\n- Update UI optimistically if needed\n\nIn Next.js, you can use **Server Actions** (\"use server\").\n`,
      codeSnippet: `// app/actions.ts\n\"use server\";\n\nexport async function createTodo(title: string) {\n  // validate + persist\n  if (!title.trim()) throw new Error('Title required');\n  return { ok: true };\n}\n`,
      exercises: JSON.stringify([
        {
          question:
            "Create a server action that validates an email and stores it (mock insert), then returns success/failure.",
          hint: "Use zod or manual checks, throw on error.",
        },
      ]),
      quiz: JSON.stringify([
        {
          question: "Where should secrets (DB credentials) live?",
          options: ["Client", "Server", "LocalStorage", "URL query"],
          answer: "Server",
        },
      ]),
    },
    {
      title: "Performance: Memoization, Rendering, and Debugging",
      slug: "react-performance",
      order: 5 as number,
      content: `# React Performance\n\n## What to optimize\n- Avoid unnecessary re-renders\n- Memoize expensive calculations\n- Split Client Components\n- Prefer server rendering for heavy UI\n\n## Tools\n- React DevTools Profiler\n- Why-did-you-render\n\n\n\n### Key idea\nOptimize based on measurements, not assumptions.\n`,
      codeSnippet: `import { memo, useMemo } from 'react';\n\nconst List = memo(function List({ items }: { items: string[] }) {\n  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;\n});\n\nexport default function Page({ items }: { items: string[] }) {\n  const sorted = useMemo(() => [...items].sort(), [items]);\n  return <List items={sorted} />;\n}\n`,
      exercises: JSON.stringify([
        {
          question:
            "Identify 2 possible re-render sources in a component tree and propose how to reduce them.",
          hint: "Use memo/useMemo, avoid recreating props, split components.",
        },
      ]),
      quiz: JSON.stringify([
        {
          question: "Best way to start performance optimization?",
          options: ["Guess", "Measure with profiler", "Add memo everywhere", "Rewrite in another framework"],
          answer: "Measure with profiler",
        },
      ]),
    },
  ];

  for (const l of lessons) {
    await db.insert(schema.lessons).values({
      courseId: course.id,
      title: l.title,
      slug: l.slug,
      order: l.order,
      content: l.content,
      codeSnippet: l.codeSnippet,
      exercises: l.exercises,
      quiz: l.quiz,
    });
  }

  console.log(`✓ Inserted ${lessons.length} lessons for react-19`);
}

upsertCourse()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
