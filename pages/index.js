import { useEffect, useState } from "react";
import Head from "next/head";
import TopicInput from "../components/TopicInput";
import QuoteGrid from "../components/QuoteGrid";
import Loader from "../components/Loader";
import History from "../components/History";
import Button from "../components/Button";
import { IconClock } from "../components/Icons";
import {
  loadHistory,
  saveHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
} from "../utils/history";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const generate = async (rawTopic) => {
    const t = (rawTopic || topic).trim();
    if (!t) return;
    setLoading(true);
    setError("");
    setActiveTopic(t);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setQuotes(data.quotes);
      setHistory(saveHistoryEntry({ topic: t, quotes: data.quotes }));
    } catch (err) {
      setError(err.message);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry) => {
    setTopic(entry.topic);
    setActiveTopic(entry.topic);
    setQuotes(entry.quotes);
    setHistoryOpen(false);
    setError("");
  };

  return (
    <>
      <Head>
        <title>Quotes for you</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Quotes for you — satu referensi, sepuluh versi, langsung jadi gambar."
        />
      </Head>

      {/* Soft ambient background glow for depth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-5 pb-24 sm:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-paper font-display text-lg font-bold">
              Q
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Quotes&nbsp;for&nbsp;you
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setHistoryOpen(true)}
            title="History"
          >
            <IconClock width={16} height={16} />
            <span className="hidden sm:inline">history</span>
          </Button>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-3xl pt-14 pb-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            satu referensi · sepuluh versi
          </span>
          <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-ink sm:text-7xl">
            Quotes for you
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Tempel satu quote referensi, dan dapatkan sepuluh versi berbeda —
            langsung jadi gambar minimalis yang siap kamu bagikan.
          </p>
          <p className="mt-5 text-sm font-medium tracking-wide text-muted/70">
            By @ditulishari
          </p>
        </section>

        {/* Input */}
        <section className="mx-auto max-w-2xl">
          <TopicInput
            value={topic}
            onChange={setTopic}
            onGenerate={generate}
            loading={loading}
          />
        </section>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-8 max-w-2xl animate-fadeIn rounded-xl2 border border-line bg-white px-5 py-4 text-center">
            <p className="text-base text-ink">{error}</p>
          </div>
        )}

        {/* Output */}
        <section className="mt-16">
          {loading ? (
            <Loader />
          ) : quotes.length > 0 ? (
            <QuoteGrid
              topic={activeTopic}
              quotes={quotes}
              loading={loading}
              onRegenerate={() => generate(activeTopic)}
            />
          ) : (
            !error && (
              <div className="py-16 text-center">
                <p className="text-base text-muted/70">
                  Hasil quotes kamu akan muncul di sini.
                </p>
              </div>
            )
          )}
        </section>
      </div>

      <History
        entries={history}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onDelete={(id) => setHistory(deleteHistoryEntry(id))}
        onClear={() => setHistory(clearHistory())}
      />

      <footer className="relative z-10 border-t border-line py-8 text-center">
        <p className="text-sm text-muted">
          Quotes for you · by @ditulishari
        </p>
      </footer>
    </>
  );
}
