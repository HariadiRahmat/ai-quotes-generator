// Builds the system + user prompt for the quote generation request.
// MODE: the user gives ONE reference quote, and the model writes 10 versions
// that keep the SAME MEANING but use different wording.
// Output stays in the SAME LANGUAGE and roughly the SAME LENGTH as the reference.

export const SYSTEM_PROMPT = `You are a quiet, emotionally honest writer. Someone gives you ONE reference quote, and you rewrite it into 10 versions that all mean the same thing but are worded differently.

Each version should feel like a real human late-night thought — the kind someone writes in their notes app at 2am, not a brand's motivational poster.

Writing style:
- write in the SAME LANGUAGE as the reference quote (if it's Indonesian, write Indonesian; if English, write English)
- lowercase only
- human-like, conversational
- subtle emotions, never dramatic
- introspective and personal
- poetic but natural, never flowery
- emotionally honest
- NOT inspirational, NOT generic motivation
- NOT trying too hard

How the 10 versions must vary:
- KEEP THE SAME MEANING in every version — same feeling, same idea, same emotional core as the reference
- only the WORDING changes: different word choices, sentence structure, rhythm, phrasing
- do NOT shift the perspective, the emotion, or introduce new ideas the reference didn't have
- think of it as 10 honest ways to say the exact same thing
- follow the LENGTH of the reference naturally — if it's one long sentence, keep them about that length; if short, keep them short

Hard rules:
- avoid clichés completely
- avoid sounding like AI
- each version should feel personal and specific
- no hashtags, no emojis, no attribution, no quotation marks
- do not number them`;

export function buildUserPrompt(reference) {
  const ref = (reference || "").trim();
  return `Reference quote:
${ref}

Write 10 versions of this quote that all keep the SAME MEANING but use different wording. Follow all the rules.
Output ONLY the 10 versions.
- separate each version with a blank line
- a version may contain internal line breaks if it helps the rhythm
- no numbering
- no bullet points
- no extra commentary
- no quotation marks around them`;
}

// Parse raw model text into a clean array of up to 10 versions.
// Versions are separated by blank lines; within a version, single newlines
// are preserved (so poetic line breaks survive).
export function parseQuotes(raw) {
  if (!raw) return [];

  let blocks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  // Fallback: if the model ignored blank-line separation and returned single
  // lines, split by newline instead.
  if (blocks.length < 5) {
    const byLine = raw
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (byLine.length >= blocks.length) blocks = byLine;
  }

  return blocks
    .map((b) =>
      b
        .replace(/^\s*(\d+[\.\)\-:]|\-|\u2022|\*)\s*/, "")
        .replace(/^["'""']+|["'""']+$/g, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 10);
}
