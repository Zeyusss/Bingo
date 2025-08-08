import Header from "../shared/widgets";
import "./global.css";
import { Poppins, Roboto } from "next/font/google";
import AppProviders from "./providers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SideCartWrapper from "../shared/components/cart/SideCartWrapper";
import LoginPromptWrapper from "../shared/components/auth/LoginPromptWrapper";
export const metadata = {
  title: "Bingo",
  description: "Bingo",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${roboto.variable} ${poppins.variable}`}
        suppressHydrationWarning
        style={{
          backgroundImage: "url('/assets/wd-furniture-background.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto", 
        }}>
        <AppProviders>
          <Header />
          {children}
          <SideCartWrapper />
          <LoginPromptWrapper />
        </AppProviders>
        </body>
    </html>
  );
}
