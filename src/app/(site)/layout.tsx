import { Fraunces, DM_Sans, Caveat } from "next/font/google";
import "./v2.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v2-scope ${fraunces.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      {children}
    </div>
  );
}
