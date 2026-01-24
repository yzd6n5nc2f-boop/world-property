import type { Metadata } from "next";
import "@/app/globals.css";
import { AiConcierge } from "@/components/ai/ai-concierge";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "World Property — Buy property anywhere with legal clarity",
  description: "A buyer-first, map-led platform for cross-border property purchases with legal workflow guidance and currency clarity."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <div className="container py-8">{children}</div>
          </main>
          <SiteFooter />
        </div>
        <AiConcierge />
      </body>
    </html>
  );
}
