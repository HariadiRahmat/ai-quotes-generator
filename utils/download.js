import JSZip from "jszip";
import { quoteToBlob, fileNameFor, DEFAULT_FORMAT, DEFAULT_STYLE } from "./canvas";

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadSingle(text, topic, index, format = DEFAULT_FORMAT, style = DEFAULT_STYLE) {
  const blob = await quoteToBlob(text, format, style);
  downloadBlob(blob, fileNameFor(topic, index, format));
}

export async function downloadAllZip(quotes, topic, format = DEFAULT_FORMAT, style = DEFAULT_STYLE, onProgress) {
  const zip = new JSZip();
  const folder = zip.folder("quotes");
  for (let i = 0; i < quotes.length; i++) {
    const blob = await quoteToBlob(quotes[i], format, style);
    folder.file(fileNameFor(topic, i, format), blob);
    if (onProgress) onProgress(i + 1, quotes.length);
  }
  const content = await zip.generateAsync({ type: "blob" });
  const slug = (topic || "quotes").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  downloadBlob(content, `${slug || "quotes"}-pack.zip`);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (err) {
      return false;
    }
  }
}
