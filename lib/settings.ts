import { supabaseAdmin } from "./supabase";

export interface SiteSettings {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  messengerUrl: string;
  phoneNumber: string;
  isOfferActive?: boolean;
  noOfferMessage?: string;
  combo1Title?: string;
  combo1Price?: string;
  combo1OldPrice?: string;
  combo1Features?: string;
  combo2Title?: string;
  combo2Price?: string;
  combo2OldPrice?: string;
  combo2Features?: string;
}

const DEFAULTS: SiteSettings = {
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  messengerUrl: "",
  phoneNumber: "",
  isOfferActive: true,
  noOfferMessage: "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!",
  combo1Title: "মেহেফিল কম্বো (কাপল সেট)",
  combo1Price: "৪,৫০০",
  combo1OldPrice: "৬,০০০",
  combo1Features: "১টি প্রিমিয়াম জর্জেট/লিনেন থ্রি-পিস\n১টি এক্সক্লুসিভ সেমি-লং সুতি পাঞ্জাবি\nমায়াবী সিগনেচার লাক্সারি বক্স প্যাকিং\nফ্রি হোম ডেলিভারি সুবিধা",
  combo2Title: "ব্রাইডাল/উৎসব মেগা সেট",
  combo2Price: "৬,৮০০",
  combo2OldPrice: "৯,৫০০",
  combo2Features: "১টি এক্সক্লুসিভ কাতান/জামদানি শাড়ি\n১টি প্রিমিয়াম সিকোয়েন্স থ্রি-পিস সেট\nরাজকীয় কাস্টমাইজড গিফট বক্সিং\n২৪ ঘণ্টার সুপার-ফাস্ট ডেলিভারি",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();

  if (error || !data) return DEFAULTS;

  return {
    facebookUrl: data.facebook_url ?? "",
    instagramUrl: data.instagram_url ?? "",
    tiktokUrl: data.tiktok_url ?? "",
    messengerUrl: data.messenger_url ?? "",
    phoneNumber: data.phone_number ?? "",
    isOfferActive: data.is_offer_active ?? true,
    noOfferMessage: data.no_offer_message ?? DEFAULTS.noOfferMessage,
    combo1Title: data.combo1_title ?? DEFAULTS.combo1Title,
    combo1Price: data.combo1_price ?? DEFAULTS.combo1Price,
    combo1OldPrice: data.combo1_old_price ?? DEFAULTS.combo1OldPrice,
    combo1Features: data.combo1_features ?? DEFAULTS.combo1Features,
    combo2Title: data.combo2_title ?? DEFAULTS.combo2Title,
    combo2Price: data.combo2_price ?? DEFAULTS.combo2Price,
    combo2OldPrice: data.combo2_old_price ?? DEFAULTS.combo2OldPrice,
    combo2Features: data.combo2_features ?? DEFAULTS.combo2Features,
  };
}