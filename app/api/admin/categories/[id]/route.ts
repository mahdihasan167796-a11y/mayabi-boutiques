import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// PATCH — ক্যাটাগরির নাম/ছবি/ফিচারড-স্ট্যাটাস/অর্ডার আপডেট করে
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin.from("categories").update(body).eq("id", id).select().single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, category: data });
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট" }, { status: 400 });
  }
}

// DELETE — ক্যাটাগরি মুছে ফেলে (এই ক্যাটাগরির প্রোডাক্টগুলো মুছে যায় না, শুধু ক্যাটাগরি এন্ট্রি মুছে যায়)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}
