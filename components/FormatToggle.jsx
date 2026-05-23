import { FORMATS } from "../utils/canvas";

// Segmented control to pick the output aspect ratio.
export default function FormatToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-soft">
      {Object.values(FORMATS).map((f) => {
        const active = value === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            title={`${f.label} ${f.ratio}`}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs tracking-tight transition-all duration-300",
              active
                ? "bg-ink text-paper"
                : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {f.label}
            <span className="ml-1 opacity-50">{f.ratio}</span>
          </button>
        );
      })}
    </div>
  );
}
