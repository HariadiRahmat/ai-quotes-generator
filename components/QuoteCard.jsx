import { useEffect, useRef, useState } from "react";
import { renderToCanvasEl, getFormat, DEFAULT_STYLE } from "../utils/canvas";
import { downloadSingle, copyText } from "../utils/download";
import {
  IconCopy,
  IconCheck,
  IconDownload,
  IconCaption,
  IconSpark,
} from "./Icons";

export default function QuoteCard({ quote, topic, index, format, style }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Caption state
  const [capOpen, setCapOpen] = useState(false);
  const [capLoading, setCapLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [capError, setCapError] = useState("");
  const [capCopied, setCapCopied] = useState(false);

  const fmt = getFormat(format);
  const st = style || DEFAULT_STYLE;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (canvasRef.current) {
        await renderToCanvasEl(canvasRef.current, quote, format, st, 2);
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quote, format, st.font, st.bg, st.scale]);

  const handleCopy = async () => {
    const ok = await copyText(quote);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadSingle(quote, topic, index, format, st);
    } finally {
      setDownloading(false);
    }
  };

  const generateCaption = async () => {
    setCapOpen(true);
    if (caption || hashtags) return; // already generated
    setCapLoading(true);
    setCapError("");
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat caption.");
      setCaption(data.caption || "");
      setHashtags(data.hashtags || "");
    } catch (err) {
      setCapError(err.message);
    } finally {
      setCapLoading(false);
    }
  };

  const copyCaption = async () => {
    const full = [caption, hashtags].filter(Boolean).join("\n\n");
    const ok = await copyText(full);
    if (ok) {
      setCapCopied(true);
      setTimeout(() => setCapCopied(false), 1600);
    }
  };

  return (
    <div
      className="group opacity-0 animate-fadeUp"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl2 border border-line bg-white shadow-soft transition-all duration-500 group-hover:shadow-lift group-hover:-translate-y-1">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ aspectRatio: `${fmt.width} / ${fmt.height}` }}
          aria-label={quote}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="pointer-events-auto flex gap-2 rounded-full bg-ink/90 px-2 py-2 backdrop-blur-sm">
            <button
              onClick={handleCopy}
              title="Copy teks quote"
              className="flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/15"
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
            <button
              onClick={generateCaption}
              title="Buat caption"
              className="flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/15"
            >
              <IconCaption />
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Download PNG"
              className="flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/15 disabled:opacity-50"
            >
              <IconDownload />
            </button>
          </div>
        </div>
      </div>

      {/* Caption panel */}
      {capOpen && (
        <div className="mt-3 animate-fadeIn rounded-xl border border-line bg-white p-3">
          {capLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted">
              <IconSpark width={16} height={16} className="animate-spin" />
              menulis caption…
            </div>
          ) : capError ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-ink">{capError}</p>
              <button
                onClick={() => {
                  setCaption("");
                  setHashtags("");
                  generateCaption();
                }}
                className="shrink-0 text-xs text-muted underline hover:text-ink"
              >
                coba lagi
              </button>
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {caption}
              </p>
              {hashtags && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {hashtags}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={copyCaption}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-black"
                >
                  {capCopied ? (
                    <>
                      <IconCheck width={14} height={14} /> tersalin
                    </>
                  ) : (
                    <>
                      <IconCopy width={14} height={14} /> copy caption
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCaption("");
                    setHashtags("");
                    generateCaption();
                  }}
                  className="text-xs text-muted underline hover:text-ink"
                >
                  buat ulang
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 px-1 font-cormorant text-sm italic leading-snug text-muted line-clamp-2">
        {quote.replace(/\n/g, " · ")}
      </p>
    </div>
  );
}
