import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { AssistantWidget } from "@/features/ai-assistant/components/assistant-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShopSphere AI — Find your next favourite",
    template: "%s | ShopSphere AI",
  },
  description:
    "A thoughtful shopping experience with transparent, signal-based recommendations.",
  applicationName: "ShopSphere AI",
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppProviders>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <AssistantWidget />
        </AppProviders>
      </body>
    </html>
  );
}
