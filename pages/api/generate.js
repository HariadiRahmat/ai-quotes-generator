import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt, parseQuotes } from "../../lib/prompt";

// Provider config. Both Groq and OpenAI expose an OpenAI-compatible API,
// so the same SDK works for both — only the base URL, key, and model differ.
// Set LLM_PROVIDER=groq (default) or LLM_PROVIDER=openai in .env.local.
const PROVIDERS = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    keyEnv: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    label: "Groq",
  },
  openai: {
    baseURL: undefined, // SDK default
    keyEnv: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
    label: "OpenAI",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providerName = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  const provider = PROVIDERS[providerName] || PROVIDERS.groq;

  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) {
    return res.status(500).json({
      error: `${provider.label} API key is not configured. Add ${provider.keyEnv} to your .env.local file.`,
    });
  }

  const { topic } = req.body || {};
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "Please provide a reference quote." });
  }

  try {
    const client = new OpenAI({
      apiKey,
      ...(provider.baseURL ? { baseURL: provider.baseURL } : {}),
    });

    const model = process.env.LLM_MODEL || provider.defaultModel;

    const completion = await client.chat.completions.create({
      model,
      temperature: 1.05,
      max_tokens: 1400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(topic) },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const quotes = parseQuotes(raw);

    if (quotes.length === 0) {
      return res
        .status(502)
        .json({ error: "The model returned no usable quotes. Try again." });
    }

    return res.status(200).json({ topic: topic.trim(), quotes });
  } catch (err) {
    const status = err?.status || 500;
    const message =
      err?.error?.message ||
      err?.message ||
      "Failed to generate quotes. Please try again.";
    return res.status(status).json({ error: message });
  }
}
