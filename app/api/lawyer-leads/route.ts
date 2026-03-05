import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { parent_name, parent_email, city, case_summary, consent } = body;

    if (!parent_name || !parent_email || !city || !case_summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    // In production: save to Supabase, trigger email to matching lawyers
    // const supabase = await createServerSupabaseClient();
    // await supabase.from("lawyer_leads").insert({ ... });

    console.log("New lawyer lead:", { parent_name, parent_email, city, case_summary: case_summary.slice(0, 100) });

    return NextResponse.json({ success: true, message: "Lead submitted successfully" });
  } catch (err) {
    console.error("Lawyer leads API error:", err);
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
