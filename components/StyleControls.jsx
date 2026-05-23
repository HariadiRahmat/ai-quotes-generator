import { FONTS, BG_PRESETS } from "../utils/canvas";

// Controls for background color, font family, and manual font size.
export default function StyleControls({ style, onChange }) {
  const set = (patch) => onChange({ ...style, ...patch });

  return (
    <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-5">
        {/* Background */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
            background
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {BG_PRESETS.map((p) => {
              const active = style.bg?.toLowerCase() === p.bg.toLowerCase();
              return (
                <button
                  key={p.key}
                  onClick={() => set({ bg: p.bg })}
                  title={p.label}
                  className={[
                    "h-8 w-8 rounded-full border transition-all duration-200",
                    active
                      ? "border-ink ring-2 ring-ink/20 scale-110"
                      : "border-line hover:scale-105",
                  ].join(" ")}
                  style={{ backgroundColor: p.bg }}
                />
              );
            })}
            {/* custom color picker */}
            <label
              className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-line transition-transform hover:scale-105"
              title="Custom color"
              style={{
                background:
                  "conic-gradient(from 0deg, #f87171, #fbbf24, #34d399, #60a5fa, #c084fc, #f87171)",
              }}
            >
              <input
                type="color"
                value={style.bg || "#ffffff"}
                onChange={(e) => set({ bg: e.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </div>

        {/* Font family */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
            font
          </p>
          <div className="inline-flex items-center rounded-full border border-line bg-paper p-1">
            {Object.values(FONTS).map((f) => {
              const active = style.font === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => set({ font: f.key })}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-sm transition-all duration-300",
                    active ? "bg-ink text-paper" : "text-muted hover:text-ink",
                  ].join(" ")}
                  style={{ fontFamily: f.stack }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              font size
            </p>
            <span className="text-xs text-muted">
              {Math.round((style.scale || 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={style.scale || 1}
            onChange={(e) => set({ scale: parseFloat(e.target.value) })}
            className="w-full accent-ink"
          />
        </div>
      </div>
    </div>
  );
}
