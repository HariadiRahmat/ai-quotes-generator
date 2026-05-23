import "../styles/globals.css";
import {
  Inter,
  Playfair_Display,
  Cormorant_Garamond,
  Bricolage_Grotesque,
} from "next/font/google";

// UI display font — modern, characterful (used for branding + headings).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// UI body font — clean, neutral. Inter doubles as both UI text and the
// "Inter" option inside generated images.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fonts kept ONLY for the quote images (the aesthetic part).
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <main
      className={`${bricolage.variable} ${inter.variable} ${playfair.variable} ${cormorant.variable} font-sans`}
    >
      <Component {...pageProps} />
    </main>
  );
}
