// Canvas rendering engine: quote -> PNG in multiple aspect ratios + styles.
// Handles: auto line break, auto text wrap, auto font scaling (with manual
// scale multiplier), custom background/text colors, font family choice.
// Always centered, never overflows the canvas — at any size.

export const FORMATS = {
  square: { key: "square", label: "Square", ratio: "1:1", width: 1080, height: 1080 },
  portrait: { key: "portrait", label: "Portrait", ratio: "4:5", width: 1080, height: 1350 },
  story: { key: "story", label: "Story", ratio: "9:16", width: 1080, height: 1920 },
};
export const DEFAULT_FORMAT = "portrait";

// Font families the user can choose. value = CSS font stack used by canvas.
export const FONTS = {
  playfair: {
    key: "playfair",
    label: "Playfair",
    stack: `"Playfair Display", Georgia, serif`,
  },
  cormorant: {
    key: "cormorant",
    label: "Cormorant",
    stack: `"Cormorant Garamond", Georgia, serif`,
  },
  inter: {
    key: "inter",
    label: "Inter",
    stack: `"Inter", system-ui, sans-serif`,
  },
};
export const DEFAULT_FONT = "playfair";

// Background color presets. Each pairs a bg with an auto-suggested text color,
// but text color is also recomputed for contrast if the user picks a custom bg.
export const BG_PRESETS = [
  { key: "white", label: "White", bg: "#ffffff" },
  { key: "cream", label: "Cream", bg: "#f5f0e8" },
  { key: "sand", label: "Sand", bg: "#e8e0d4" },
  { key: "mist", label: "Mist", bg: "#eef1f2" },
  { key: "ink", label: "Ink", bg: "#0a0a0a" },
  { key: "forest", label: "Forest", bg: "#1f2a24" },
];

export const DEFAULT_STYLE = {
  font: DEFAULT_FONT,
  bg: "#ffffff",
  scale: 1, // manual font multiplier on top of auto-fit (0.6 - 1.4)
};

// Signature / watermark printed small at the bottom of every image.
// Empty string = no watermark on the image (the signature lives on the web
// page under the hero instead).
export const WATERMARK = "";

export function getFormat(key) {
  return FORMATS[key] || FORMATS[DEFAULT_FORMAT];
}
export function getFontStack(key) {
  return (FONTS[key] || FONTS[DEFAULT_FONT]).stack;
}

// Decide a readable text color (near-black or near-white) for a given bg.
export function textColorFor(bgHex) {
  const c = (bgHex || "#ffffff").replace("#", "");
  const full =
    c.length === 3
      ? c.split("").map((ch) => ch + ch).join("")
      : c.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // relative luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#fafafa";
}

const MARGIN_X_RATIO = 0.14;
const MAX_FONT_RATIO = 0.069;
const MIN_FONT_RATIO = 0.028;
const LINE_HEIGHT_RATIO = 1.42;

function hasExplicitBreaks(text) {
  return /\n/.test(text.trim());
}

function wrapLine(ctx, line, maxWidth) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = current + " " + words[i];
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function layoutLines(ctx, text, fontSize, maxWidth, fontStack) {
  ctx.font = `400 ${fontSize}px ${fontStack}`;
  const source = text.trim();
  let logicalLines;
  if (hasExplicitBreaks(source)) {
    logicalLines = source.split("\n").map((l) => l.trim());
  } else {
    logicalLines = [source];
  }
  let out = [];
  for (const ll of logicalLines) {
    if (ll === "") out.push("");
    else out = out.concat(wrapLine(ctx, ll, maxWidth));
  }
  return out;
}

// Largest font that fits within both width and height. The manual `scale`
// shrinks the search ceiling so the user can request smaller text, and lets
// text grow up to the auto-fit max. We always re-verify fit so nothing ever
// overflows regardless of the scale value.
function fitText(ctx, text, maxWidth, maxHeight, maxFont, minFont, fontStack, scale) {
  const ceiling = Math.max(minFont, Math.min(maxFont, maxFont * scale));
  let chosen = minFont;
  let chosenLines = [];
  for (let size = Math.round(ceiling); size >= minFont; size -= 1) {
    const lines = layoutLines(ctx, text, size, maxWidth, fontStack);
    const lineHeight = size * LINE_HEIGHT_RATIO;
    const totalHeight = lines.length * lineHeight;
    ctx.font = `400 ${size}px ${fontStack}`;
    const widest = lines.reduce(
      (m, l) => Math.max(m, ctx.measureText(l).width),
      0
    );
    if (totalHeight <= maxHeight && widest <= maxWidth) {
      chosen = size;
      chosenLines = lines;
      break;
    }
  }
  if (chosenLines.length === 0) {
    chosenLines = layoutLines(ctx, text, minFont, maxWidth, fontStack);
    chosen = minFont;
  }
  return { fontSize: chosen, lines: chosenLines };
}

// style = { font, bg, scale }
export function drawQuote(ctx, text, format, style, scale = 1) {
  const fmt = getFormat(format);
  const W = fmt.width;
  const H = fmt.height;
  const st = { ...DEFAULT_STYLE, ...(style || {}) };
  const fontStack = getFontStack(st.font);
  const bg = st.bg || "#ffffff";
  const fg = textColorFor(bg);

  ctx.save();
  ctx.scale(scale, scale);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const marginX = W * MARGIN_X_RATIO;
  const marginY = Math.max(marginX, H * (MARGIN_X_RATIO * 0.9));
  // Reserve a little vertical room at the bottom for the watermark so long
  // quotes never overlap it.
  const watermarkSize = W * 0.026;
  const watermarkReserve = WATERMARK ? watermarkSize * 3 : 0;
  const maxWidth = W - marginX * 2;
  const maxHeight = H - marginY * 2 - watermarkReserve;
  const maxFont = W * MAX_FONT_RATIO;
  const minFont = W * MIN_FONT_RATIO;

  const { fontSize, lines } = fitText(
    ctx,
    text,
    maxWidth,
    maxHeight,
    maxFont,
    minFont,
    fontStack,
    st.scale || 1
  );
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;

  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${fontSize}px ${fontStack}`;

  const totalHeight = lines.length * lineHeight;
  // Center the quote within the available area (above the reserved watermark
  // band), so the composition stays balanced.
  const availableCenter = (H - watermarkReserve) / 2;
  const startY = availableCenter - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight);
  });

  // Watermark / signature at the bottom, subtle.
  if (WATERMARK) {
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `400 ${watermarkSize}px ${getFontStack("inter")}`;
    ctx.fillText(WATERMARK, W / 2, H - marginY * 0.55);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export async function quoteToBlob(text, format = DEFAULT_FORMAT, style = DEFAULT_STYLE, pixelRatio = 2) {
  await ensureFontsLoaded();
  const fmt = getFormat(format);
  const canvas = document.createElement("canvas");
  canvas.width = fmt.width * pixelRatio;
  canvas.height = fmt.height * pixelRatio;
  const ctx = canvas.getContext("2d");
  drawQuote(ctx, text, format, style, pixelRatio);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png", 1)
  );
}

export async function renderToCanvasEl(canvasEl, text, format = DEFAULT_FORMAT, style = DEFAULT_STYLE, pixelRatio = 2) {
  await ensureFontsLoaded();
  const fmt = getFormat(format);
  canvasEl.width = fmt.width * pixelRatio;
  canvasEl.height = fmt.height * pixelRatio;
  const ctx = canvasEl.getContext("2d");
  drawQuote(ctx, text, format, style, pixelRatio);
}

let fontsReady = false;
export async function ensureFontsLoaded() {
  if (fontsReady) return;
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('400 74px "Playfair Display"'),
        document.fonts.load('400 74px "Cormorant Garamond"'),
        document.fonts.load('400 74px "Inter"'),
        document.fonts.ready,
      ]);
    } catch (e) {}
  }
  fontsReady = true;
}

export function fileNameFor(topic, index, format) {
  const slug = (topic || "quote")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const n = String(index + 1).padStart(2, "0");
  const fmt = getFormat(format);
  return `${slug || "quote"}-${fmt.ratio.replace(":", "x")}-${n}.png`;
}
