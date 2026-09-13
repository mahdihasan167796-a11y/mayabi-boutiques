import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// DELETE — স্টাফের অ্যাক্সেস সম্পূর্ণ বাতিল করে (প্রোফাইল রো + আসল লগইন অ্যাকাউন্ট, দুটোই মুছে যায়)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await supabaseAdmin.from("profiles").delete().eq("id", id);
    await supabaseAdmin.auth.admin.deleteUser(id).catch((e) => {
      console.error("Auth user delete failed (profile row still removed):", e);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}
