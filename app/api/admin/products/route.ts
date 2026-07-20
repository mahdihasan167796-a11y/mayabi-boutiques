import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

// Next.js static rendering বন্ধ করার জন্য
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "product-images";
const DEFAULT_SIZES = ["৩৮", "৪০", "৪২", "৪৪"];

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, products: data });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const categorySlug = String(formData.get("categorySlug") || "").trim();
  const price = Number(formData.get("price"));
  const oldPriceRaw = formData.get("oldPrice");
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : price + 1000;
  const imageFile = formData.get("image") as File | null;

  if (!name || !categorySlug || !price || !imageFile) {
    return NextResponse.json(
      { ok: false, error: "নাম, ক্যাটাগরি, দাম এবং ছবি — সবগুলো আবশ্যক।" },
      { status: 400 }
    );
  }

  // ১. ছবি Supabase Storage-এ আপলোড করা
  const fileExt = imageFile.name.split(".").pop() || "jpg";
  const filePath = `${categorySlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const arrayBuffer = await imageFile.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, { contentType: imageFile.type, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      {
        ok: false,
        error: `ছবি আপলোড ব্যর্থ হয়েছে: ${uploadError.message}. Supabase Storage-এ "${BUCKET}" নামে একটি পাবলিক বাকেট আছে কিনা যাচাই করুন (README দেখুন)।`,
      },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
  const imageUrl = publicUrlData.publicUrl;

  // ২. প্রোডাক্ট রো ইনসার্ট করা
  const slug = slugify(name);
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        slug,
        name,
        category_slug: categorySlug,
        price,
        old_price: oldPrice,
        images: [imageUrl],
        variants: [{ name: "ডিফল্ট কালার", image: imageUrl }],
        sizes: DEFAULT_SIZES,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, product: data });
}