import { Nunito, Fredoka } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ClassicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${nunito.variable} ${fredoka.variable} flex flex-col min-h-screen`}>
      <LoadingScreen />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
