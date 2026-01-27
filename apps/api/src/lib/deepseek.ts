import { z } from "zod";
import crypto from "crypto";
import { config } from "../config.js";

const TaskSchema = z.object({
  id: z.string(),
  type: z.enum([
    "multiple_choice",
    "fill_in_the_blank",
    "short_translation",
    "mini_dialog"
  ]),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
  explanation_de: z.string(),
  hint: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export type DeepseekTask = z.infer<typeof TaskSchema>;

const buildPrompt = (level: string, goal: string, taskType: string, context: string) => {
  return `Du bist ein didaktischer Deutsch-Tutor. Erstelle genau eine Aufgabe im JSON-Format.\n\nAnforderungen:\n- Niveau: ${level}\n- Ziel: ${goal}\n- Aufgabentyp: ${taskType}\n- Kontext/Fehler: ${context || "keine"}\n- Gib nur JSON zurück, kein Markdown.\n\nBeispiel JSON-Format:\n{"id":"uuid","type":"multiple_choice","prompt":"...","options":["..."],"answer":"...","explanation_de":"...","hint":"...","tags":["artikel"]}`;
};

export const generateTask = async (params: {
  level: string;
  goal: string;
  taskType: string;
  context: string;
}): Promise<DeepseekTask> => {
  if (config.devMode) {
    return TaskSchema.parse({
      id: crypto.randomUUID(),
      type: params.taskType,
      prompt: `(${params.level}) ${params.goal}: Setze den richtigen Artikel ein: __ Hund`,
      options:
        params.taskType === "multiple_choice"
          ? ["der", "die", "das", "den"]
          : undefined,
      answer: "der",
      explanation_de:
        "Im Deutschen hat das Wort „Hund“ den Artikel „der“. Das ist ein maskulines Nomen.",
      hint: "Maskuline Nomen → der.",
      tags: ["artikel", "nomen"]
    });
  }

  const response = await fetch(`${config.deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.deepseekApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Du bist ein präziser Sprachlehrer."
        },
        {
          role: "user",
          content: buildPrompt(
            params.level,
            params.goal,
            params.taskType,
            params.context
          )
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek response missing content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("DeepSeek returned invalid JSON");
  }

  return TaskSchema.parse(parsed);
};
