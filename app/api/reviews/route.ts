import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const product_id = String(formData.get("product_id") || "");
    const customer_name = String(formData.get("customer_name") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const rating = Number(formData.get("rating") || 5);
    const comment = String(formData.get("comment") || "").trim();
    const imageFile = formData.get("image") as File | null;

    if (!product_id || !customer_name || !comment) {
      return NextResponse.json({ ok: false, error: "নাম ও মন্তব্য আবশ্যক" }, { status: 400 });
    }

    let image_url: string | null = null;

    if (imageFile && imageFile.size > 0) {
      // ৫MB-এর বেশি ছবি রিভিউতে নেওয়া হচ্ছে না (স্টোরেজ অপব্যবহার ঠেকাতে)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ ok: false, error: "ছবির সাইজ ৫MB-এর বেশি হতে পারবে না" }, { status: 400 });
      }

      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const fileName = `reviews/${product_id}-${Date.now()}.${fileExt}`;
      const arrayBuffer = await imageFile.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(fileName, arrayBuffer, { contentType: imageFile.type });

      if (uploadError) {
        console.error("Review image upload error:", uploadError);
        // ছবি আপলোড ব্যর্থ হলেও রিভিউটা টেক্সট আকারে সেভ হবে, পুরো রিকোয়েস্ট বাতিল হবে না
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabaseAdmin.from("reviews").insert([
      {
        product_id,
        customer_name,
        location,
        rating,
        comment,
        image_url,
        show_on_home: false,
        show_on_product: true,
      },
    ]);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
