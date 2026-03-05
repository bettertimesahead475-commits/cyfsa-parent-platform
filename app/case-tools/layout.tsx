import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Tools",
  description:
    "Emergency checklist, incident journal, court calendar, communication log, and school attendance tracker for Ontario parents in child protection proceedings.",
};

export default function CaseToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
