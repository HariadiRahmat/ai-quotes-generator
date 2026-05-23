# quiet — minimalist AI quote generator

Type a mood, get **10 emotionally honest, human-like quotes**, each auto-rendered into a clean **1080×1080 PNG** (white background, black editorial typography). Download one by one or all at once as a ZIP.

Built with **Next.js + Tailwind CSS + HTML Canvas + OpenAI + JSZip**.

---

## ✨ Features

- **Mood input** with preset chips (`loneliness`, `overthinking`, `healing`, `heartbreak`, `self growth`, `friendship`, `memories`, `late night thoughts`, …)
- **Random topic** button
- **Generate 10 quotes** at once via the OpenAI API
- **Regenerate** button for a fresh batch on the same mood
- **Auto image rendering** for every quote:
  - 1080×1080, exported at 2× (2160×2160) for crisp HD PNGs
  - plain white background, centered black typography
  - **auto line break, auto text wrap, auto font scaling** — text never leaves the canvas
- **Download** per image or **download all as a ZIP**
- **Copy** quote text to clipboard
- **History** of past generations saved in `localStorage`
- Fully **responsive**, mobile-friendly, with smooth animations and an elegant loading state
- **Environment variable** for the API key — nothing secret in the client

---

## 🧱 Project structure

```
quote-generator/
├── components/        # reusable UI components
│   ├── Button.jsx
│   ├── History.jsx
│   ├── Icons.jsx
│   ├── Loader.jsx
│   ├── QuoteCard.jsx
│   ├── QuoteGrid.jsx
│   └── TopicInput.jsx
├── lib/               # prompt + topic logic
│   ├── prompt.js
│   └── topics.js
├── pages/
│   ├── api/
│   │   └── generate.js   # OpenAI API route (server-side, key stays secret)
│   ├── _app.js
│   ├── _document.js
│   └── index.js          # main page
├── styles/
│   └── globals.css
├── utils/             # canvas rendering, downloads, history
│   ├── canvas.js
│   ├── download.js
│   └── history.js
├── .env.local.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## 🚀 Getting started

### 1. Prerequisites

- **Node.js 18.17+** (Node 20 or 22 recommended)
- An **OpenAI API key** → https://platform.openai.com/api-keys

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your OpenAI API key

Copy the example env file and add your key:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your key:

```env
OPENAI_API_KEY=sk-your-real-key-here
# optional — defaults to gpt-4o-mini
# OPENAI_MODEL=gpt-4o-mini
```

> The key is only ever read server-side inside `pages/api/generate.js`. It is **never** exposed to the browser.

### 4. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

---

## 🔑 How the OpenAI setup works

1. The browser sends your chosen `topic` to the local API route `POST /api/generate`.
2. The route reads `OPENAI_API_KEY` from the environment and calls the Chat Completions endpoint with a carefully tuned system prompt (see `lib/prompt.js`) that asks for lowercase, introspective, non-cliché, human-feeling quotes.
3. The response text is parsed into a clean array of up to 10 quotes and returned to the client.
4. Each quote is drawn to a canvas and turned into a PNG entirely **in the browser** — no image generation cost on the API.

To change the model, set `OPENAI_MODEL` in `.env.local` (e.g. `gpt-4o`).

---

## 🖼️ How the image rendering works

`utils/canvas.js` contains the typography engine:

- It tries the largest font (74px) first and steps down until the wrapped text fits both the width and height inside a generous margin.
- It respects intentional line breaks in a quote, otherwise it word-wraps automatically.
- Everything is centered both horizontally and vertically.
- Export happens at `pixelRatio = 2`, so a 1080×1080 layout is rendered to a 2160×2160 PNG for sharp results.

---

## ☁️ Deploy

This is a standard Next.js app and deploys cleanly to **Vercel**:

1. Push the project to a Git repository.
2. Import it into Vercel.
3. Add the environment variable `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in the Vercel project settings.
4. Deploy.

---

## 🛠️ Tech stack

| Purpose            | Tool                |
| ------------------ | ------------------- |
| Framework          | Next.js 14 (Pages)  |
| Styling            | Tailwind CSS        |
| Fonts              | Inter, Playfair Display, Cormorant Garamond (via `next/font`) |
| AI quotes          | OpenAI API          |
| Image export       | HTML Canvas API     |
| ZIP download       | JSZip               |
| History            | `localStorage`      |

---

## ⚠️ Notes

- You need a funded OpenAI account; free-tier keys may hit rate limits.
- All image generation is local and free — only the text generation calls the API.
- History is stored per browser in `localStorage` (last 30 generations).
