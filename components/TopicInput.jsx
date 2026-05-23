import { useState } from "react";
import Button from "./Button";
import { IconArrow } from "./Icons";

const EXAMPLES = [
  "akhir akhir ini aku sering senyum dan ketawa kayak biasa, padahal tiap malam masih overthinking soal hidup yang belum jelas arahnya",
  "i got tired of explaining feelings people already knew",
  "maybe some people are only meant to exist in memories",
];

export default function TopicInput({ value, onChange, onGenerate, loading }) {
  const [focused, setFocused] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!loading && value.trim()) onGenerate(value.trim());
  };

  return (
    <div className="w-full">
      <form onSubmit={submit}>
        <div
          className={[
            "rounded-2xl bg-white p-3 transition-all duration-300",
            "border",
            focused ? "border-ink/40 shadow-lift" : "border-line shadow-soft",
          ].join(" ")}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(e);
            }}
            rows={3}
            placeholder="Tempel satu quote referensi di sini — nanti dibuat 10 versi berbeda…"
            className="w-full resize-none bg-transparent px-3 py-2 text-base leading-relaxed text-ink placeholder:text-muted/60 outline-none"
          />
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <span className="text-xs text-muted/60">
              ⌘/Ctrl + Enter untuk generate
            </span>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !value.trim()}
              title="Buat 10 versi"
            >
              Buat 10 versi
              <IconArrow width={16} height={16} />
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-5">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.15em] text-muted/70">
          Contoh referensi
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              className="rounded-xl border border-line bg-white px-4 py-3 text-left text-sm leading-snug text-muted transition-all duration-300 hover:border-ink/25 hover:text-ink hover:shadow-soft"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
