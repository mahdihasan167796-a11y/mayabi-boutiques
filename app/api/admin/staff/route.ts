import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — সব স্টাফ প্রোফাইল লিস্ট করে (service role ব্যবহার করে, তাই RLS-এর
// "শুধু নিজেরটা" সীমাবদ্ধতা এড়িয়ে অ্যাডমিন সবার লিস্ট দেখতে পারবেন)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, staffs: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

// POST — নতুন স্টাফের জন্য আসল Supabase Auth অ্যাকাউন্ট তৈরি করে (ইমেইল+পাসওয়ার্ড দিয়ে
// সাথে সাথেই লগইন করতে পারবে — আলাদা ইনভাইট-ইমেইলের উপর নির্ভর করতে হয় না) + profiles-এ রোল সেভ করে
export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ ok: false, error: "ইমেইল, পাসওয়ার্ড ও রোল আবশ্যক" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ ok: false, error: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে" }, { status: 400 });
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ইমেইল ভেরিফিকেশন ছাড়াই সাথে সাথে লগইন করতে পারবে
    });

    if (createError || !userData?.user) {
      const message = createError?.message?.toLowerCase().includes("already")
        ? "এই ইমেইলে আগে থেকেই একটা অ্যাকাউন্ট আছে।"
        : createError?.message || "স্টাফ অ্যাকাউন্ট তৈরি করা যায়নি।";
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert([{ id: userData.user.id, email, role }]);

    if (profileError) {
      // প্রোফাইল সেভ ব্যর্থ হলে auth ইউজারটাও রোলব্যাক করে ফেলা ভালো, নাহলে half-created স্টাফ থেকে যাবে
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id).catch(() => {});
      return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
