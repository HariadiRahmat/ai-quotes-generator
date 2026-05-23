import { useEffect, useRef, useState } from "react";
import { renderToCanvasEl, getFormat, DEFAULT_STYLE } from "../utils/canvas";
import { downloadSingle, copyText } from "../utils/download";
import { IconCopy, IconCheck, IconDownload } from "./Icons";

export default function QuoteCard({ quote, topic, index, format, style }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
              title="Copy text"
              className="flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/15"
            >
              {copied ? <IconCheck /> : <IconCopy />}
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

      <p className="mt-3 px-1 font-cormorant text-sm italic leading-snug text-muted line-clamp-2">
        {quote.replace(/\n/g, " · ")}
      </p>
    </div>
  );
}
