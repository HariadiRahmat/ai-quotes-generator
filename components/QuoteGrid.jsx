import { useState } from "react";
import QuoteCard from "./QuoteCard";
import Button from "./Button";
import FormatToggle from "./FormatToggle";
import StyleControls from "./StyleControls";
import { IconRefresh, IconZip } from "./Icons";
import { downloadAllZip } from "../utils/download";
import { DEFAULT_FORMAT, DEFAULT_STYLE } from "../utils/canvas";

export default function QuoteGrid({ topic, quotes, onRegenerate, loading }) {
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [showControls, setShowControls] = useState(false);

  const handleZip = async () => {
    setZipping(true);
    setProgress({ done: 0, total: quotes.length });
    try {
      await downloadAllZip(quotes, topic, format, style, (done, total) =>
        setProgress({ done, total })
      );
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted/70">
            referensi
          </p>
          <h2 className="mt-1 max-w-md truncate font-display text-2xl font-bold tracking-tight text-ink">
            {topic}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormatToggle value={format} onChange={setFormat} />
          <Button
            variant={showControls ? "primary" : "secondary"}
            onClick={() => setShowControls((s) => !s)}
            title="Customize style"
          >
            customize
          </Button>
          <Button
            variant="secondary"
            onClick={onRegenerate}
            disabled={loading}
            title="Regenerate"
          >
            <IconRefresh width={16} height={16} />
            regenerate
          </Button>
          <Button
            variant="primary"
            onClick={handleZip}
            disabled={zipping}
            title="Download all as ZIP"
          >
            <IconZip width={16} height={16} />
            {zipping
              ? `zipping ${progress.done}/${progress.total}`
              : "download all"}
          </Button>
        </div>
      </div>

      {/* Style panel (collapsible) */}
      {showControls && (
        <div className="mb-7 animate-fadeIn">
          <StyleControls style={style} onChange={setStyle} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {quotes.map((q, i) => (
          <QuoteCard
            key={`${topic}-${i}-${q.slice(0, 12)}`}
            quote={q}
            topic={topic}
            index={i}
            format={format}
            style={style}
          />
        ))}
      </div>
    </div>
  );
}
