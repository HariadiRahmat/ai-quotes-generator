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
        <title>quiet — minimalist quote generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-5 pb-24 sm:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-7">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl tracking-tight text-ink">
              quiet
            </span>
            <span className="hidden font-cormorant text-base italic text-muted sm:inline">
              — words that feel like 2am
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
        <section className="mx-auto max-w-2xl pt-10 pb-12 text-center sm:pt-16">
          <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-ink sm:text-6xl">
            satu quote,
            <br />
            <span className="italic text-muted">sepuluh versi.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md font-cormorant text-xl leading-relaxed text-muted">
            tempel satu quote referensi. dapatkan sepuluh versi berbeda,
            langsung jadi gambar yang siap dibagikan.
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
            <p className="font-cormorant text-lg italic text-ink">{error}</p>
          </div>
        )}

        {/* Output */}
        <section className="mt-14">
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
                <p className="font-cormorant text-xl italic text-muted/70">
                  your quotes will appear here.
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
        <p className="font-cormorant text-base italic text-muted">
          made for slow, quiet moments.
        </p>
      </footer>
    </>
  );
}
