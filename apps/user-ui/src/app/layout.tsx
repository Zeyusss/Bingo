import Header from "../shared/widgets";
import "./global.css";
import AppProviders from "./providers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SideCartWrapper from "../shared/components/cart/SideCartWrapper";
import LoginPromptWrapper from "../shared/components/auth/LoginPromptWrapper";
import PersonalizationModal from "../shared/components/modals/PersonalizationModal";
export const metadata = {
  title: "Bingo",
  description: "Bingo",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className=""
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
          <PersonalizationModal />
        </AppProviders>
        </body>
    </html>
  );
}
