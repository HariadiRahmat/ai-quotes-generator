import "../styles/globals.css";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-sans`}
    >
      <Component {...pageProps} />
    </main>
  );
}
