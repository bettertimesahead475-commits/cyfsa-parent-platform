import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument, extractTextFromFile } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 files per analysis" }, { status: 400 });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();

        const documentType = (() => {
          const name = file.name.toLowerCase();
          if (name.includes("cas") || name.includes("report")) return "cas_report" as const;
          if (name.includes("court") || name.includes("filing") || name.includes("motion")) return "court_filing" as const;
          if (name.includes("transcript")) return "transcript" as const;
          if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return "evidence" as const;
          return "other" as const;
        })();

        const text = await extractTextFromFile(file);
        return await analyzeDocument(text, file.name, documentType);
      })
    );

    return NextResponse.json({ results, count: results.length });
  } catch (err: unknown) {
    console.error("Analysis API error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
