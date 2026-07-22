import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { status, note } = body;

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, order: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", resolvedParams.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}