import { IconClock, IconTrash, IconClose } from "./Icons";
import { formatDate } from "../utils/history";

export default function History({
  entries,
  onSelect,
  onDelete,
  onClear,
  open,
  onClose,
}) {
  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-[88%] max-w-sm flex-col bg-paper shadow-lift",
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-2 text-ink">
            <IconClock width={18} height={18} />
            <h3 className="font-serif text-xl tracking-tight">history</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-whisper hover:text-ink"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {entries.length === 0 ? (
            <p className="px-2 py-10 text-center font-cormorant text-lg italic text-muted">
              nothing here yet.
              <br /> your past moods will live here.
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => (
                <li key={e.id}>
                  <div className="group flex items-center gap-2 rounded-xl2 border border-line bg-white p-3 transition-all hover:border-ink/20 hover:shadow-soft">
                    <button
                      onClick={() => onSelect(e)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-serif text-lg tracking-tight text-ink">
                        {e.topic}
                      </p>
                      <p className="text-xs text-muted">
                        {e.quotes.length} quotes · {formatDate(e.createdAt)}
                      </p>
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      title="Delete"
                      className="rounded-full p-2 text-muted opacity-0 transition-all hover:bg-whisper hover:text-ink group-hover:opacity-100"
                    >
                      <IconTrash width={16} height={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-line px-6 py-4">
            <button
              onClick={onClear}
              className="text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-ink"
            >
              clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
