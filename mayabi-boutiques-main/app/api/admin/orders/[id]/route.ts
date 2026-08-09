import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট" }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ ok: false, error: "অবৈধ স্ট্যাটাস" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, order: data });
}