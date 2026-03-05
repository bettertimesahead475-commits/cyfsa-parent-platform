import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Lawyer",
  description:
    "Find verified Ontario family law lawyers for child protection proceedings. Connect via our intake package system — lawyers receive your case summary, pre-organized.",
};

export default function LawyersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
