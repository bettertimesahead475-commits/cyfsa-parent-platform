import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CYFSA Parent Defense — Ontario Family Rights Platform",
    template: "%s | CYFSA Parent Defense",
  },
  description:
    "A structured legal education and evidence analysis platform for Ontario parents navigating child protection proceedings under CYFSA. Know your rights, document everything, connect with a lawyer.",
  keywords: [
    "CYFSA",
    "Ontario child protection",
    "CAS rights",
    "family law Ontario",
    "child protection defense",
    "parent rights Ontario",
    "CAS lawyer Ontario",
  ],
  openGraph: {
    title: "CYFSA Parent Defense Platform",
    description: "Know your rights. Document everything. Connect with Ontario family lawyers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-navy-900 text-stone-200 antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#131928",
              color: "#f0e8d8",
              border: "1px solid rgba(201,168,76,0.3)",
              fontFamily: "var(--font-source-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
