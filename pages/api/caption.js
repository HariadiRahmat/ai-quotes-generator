import OpenAI from "openai";
import {
  CAPTION_SYSTEM_PROMPT,
  buildCaptionPrompt,
  parseCaption,
} from "../../lib/caption";

const PROVIDERS = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    keyEnv: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    label: "Groq",
  },
  openai: {
    baseURL: undefined,
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
      error: `${provider.label} API key is not configured.`,
    });
  }

  const { quote } = req.body || {};
  if (!quote || typeof quote !== "string" || !quote.trim()) {
    return res.status(400).json({ error: "Please provide a quote." });
  }

  try {
    const client = new OpenAI({
      apiKey,
      ...(provider.baseURL ? { baseURL: provider.baseURL } : {}),
    });
    const model = process.env.LLM_MODEL || provider.defaultModel;

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.9,
      max_tokens: 300,
      messages: [
        { role: "system", content: CAPTION_SYSTEM_PROMPT },
        { role: "user", content: buildCaptionPrompt(quote) },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const { caption, hashtags } = parseCaption(raw);

    if (!caption && !hashtags) {
      return res.status(502).json({ error: "No caption generated. Try again." });
    }
    return res.status(200).json({ caption, hashtags });
  } catch (err) {
    const status = err?.status || 500;
    const message =
      err?.error?.message || err?.message || "Failed to generate caption.";
    return res.status(status).json({ error: message });
  }
}
