// Prompt builder for turning a quote into an Instagram caption + hashtags.

export const CAPTION_SYSTEM_PROMPT = `You write short, natural Instagram captions for quote posts. The caption should feel human and understated, never salesy or over-hyped.

Rules:
- write in the SAME LANGUAGE as the quote (Indonesian quote -> Indonesian caption)
- keep the caption short: 1-2 lines, lowercase, calm tone
- do NOT just repeat the quote verbatim — add a small human touch, a reflection, or an invitation to relate
- then provide 5-8 relevant hashtags on a new block
- hashtags should be lowercase, relevant to the mood/theme, mixing popular and niche
- no emojis unless they feel truly natural (at most one)
- output format EXACTLY:
<caption>
the caption text here
</caption>
<hashtags>
#tag1 #tag2 #tag3 #tag4 #tag5
</hashtags>`;

export function buildCaptionPrompt(quote) {
  const q = (quote || "").trim();
  return `Quote:
${q}

Write the Instagram caption and hashtags following the exact output format.`;
}

// Parse the model output into { caption, hashtags }.
export function parseCaption(raw) {
  if (!raw) return { caption: "", hashtags: "" };
  const capMatch = raw.match(/<caption>([\s\S]*?)<\/caption>/i);
  const tagMatch = raw.match(/<hashtags>([\s\S]*?)<\/hashtags>/i);

  let caption = capMatch ? capMatch[1].trim() : "";
  let hashtags = tagMatch ? tagMatch[1].trim() : "";

  // Fallback: if tags weren't wrapped, try to pull a line starting with #.
  if (!hashtags) {
    const line = raw.split("\n").find((l) => l.trim().startsWith("#"));
    if (line) hashtags = line.trim();
  }
  // Fallback caption: if no tags found, use whole text minus hashtag line.
  if (!caption) {
    caption = raw
      .replace(/<\/?caption>/gi, "")
      .replace(/<\/?hashtags>/gi, "")
      .replace(/^#.*$/gm, "")
      .trim();
  }
  return { caption, hashtags };
}
