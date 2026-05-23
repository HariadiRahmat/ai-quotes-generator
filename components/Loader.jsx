// Modern, elegant loading state: a breathing indicator + staggered skeleton grid.
export default function Loader({ label = "menulis dengan tenang" }) {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-center gap-3 py-10">
        <div className="flex items-end gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink animate-breathe" />
          <span
            className="h-2 w-2 rounded-full bg-ink animate-breathe"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-ink animate-breathe"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <span className="text-base text-muted">{label}…</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton aspect-square rounded-xl2 opacity-0 animate-fadeIn"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
