import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_SESSION_COOKIE, sha256Hex } from "@/lib/admin-auth";

// "/admin/login" ছাড়া আর কোনো নতুন পাবলিক অ্যাডমিন পেজ যোগ হলে এখানে যোগ করুন
const PUBLIC_ADMIN_PAGES = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = PUBLIC_ADMIN_PAGES.includes(pathname);
  const isLoginApi = pathname === "/api/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginPage;
  const isProtectedApi = pathname.startsWith("/api/admin") && !isLoginApi;

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  // ১. আগের মাস্টার-পাসওয়ার্ড সেশন চেক — এটা সবসময় fallback হিসেবে কাজ করবে,
  //    স্টাফ-লগইন সিস্টেমে কোনো সমস্যা হলেও মালিক কখনো লক-আউট হবেন না।
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const expectedMaster = adminPassword ? await sha256Hex(adminPassword) : "";
  const isMasterAuthed = Boolean(sessionCookie && expectedMaster && sessionCookie === expectedMaster);

  if (isMasterAuthed) {
    return NextResponse.next();
  }

  // ২. Supabase স্টাফ-লগইন সেশন চেক
  // ⚠️ গুরুত্বপূর্ণ: এখন যেহেতু কাস্টমাররাও একই Supabase Auth দিয়ে নিজে সাইন-আপ করতে পারেন,
  // শুধু "সেশন আছে কিনা" চেক করলে হবে না — profiles টেবিলে (স্টাফ-এন্ট্রি) আছে কিনা সেটাও
  // যাচাই করা হচ্ছে, নাহলে যেকোনো কাস্টমার লগইন করেই অ্যাডমিন প্যানেলে ঢুকে যেতে পারতেন।
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (profile) {
        return response;
      }
    }
  }

  // ৩. কোনোটাই না মিললে (বা কাস্টমার হলে) লগইনে পাঠানো
  if (isProtectedApi) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
