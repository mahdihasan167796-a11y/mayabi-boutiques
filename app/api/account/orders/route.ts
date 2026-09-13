import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();

    // ইউজারের নিজের কুকি দিয়ে সেশন ভেরিফাই করা হচ্ছে — ক্লায়েন্ট যা পাঠায় তা সরাসরি বিশ্বাস না করে
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // GET রিকোয়েস্টে কুকি লেখার দরকার নেই
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "লগইন করুন" }, { status: 401 });
    }

    const phone = (user.user_metadata as any)?.phone || "";
    const email = user.email || "";

    // user_id মিলে এমন অর্ডার (নতুন অর্ডার) + একই ফোন/ইমেইল দিয়ে করা পুরনো গেস্ট অর্ডার — দুটোই দেখাবে
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    const filters = [`user_id.eq.${user.id}`];
    if (phone) filters.push(`phone.eq.${phone}`);
    if (email) filters.push(`email.eq.${email}`);

    const { data, error } = await query.or(filters.join(","));

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orders: data, profile: { name: user.user_metadata?.full_name, email, phone } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
