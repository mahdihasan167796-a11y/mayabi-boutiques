import { supabaseAdmin } from "./supabase";

export interface SiteSettings {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  messengerUrl: string;
  phoneNumber: string;
  whatsappNumber?: string;
  freeShippingThreshold?: number;
  heroVideoUrl?: string;
  sslcommerzEnabled?: boolean;
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
  announcementText?: string;
  exclusiveTitle?: string;
  exclusiveSubtitle?: string;
  exclusiveButtonText?: string;
  exclusiveButtonLink?: string;
  exclusiveImage1?: string;
  exclusiveImage2?: string;
  exclusiveImage3?: string;
  contactEmail?: string;
  contactAddress?: string;
}

const DEFAULTS: SiteSettings = {
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  messengerUrl: "",
  phoneNumber: "",
  whatsappNumber: "",
  freeShippingThreshold: 0,
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
  announcementText: "আভিজাত্য রাঙাক আপনার উৎসব! আমাদের লাক্সারি কালেকশন থেকে সেরাটি বেছে নিন আজই।",
  exclusiveTitle: "মায়াবী এক্সক্লুসিভ শাড়ি",
  exclusiveSubtitle: "প্রেজেন্ট করছে",
  exclusiveButtonText: "কালেকশন দেখুন",
  exclusiveButtonLink: "/category/saree",
  contactEmail: "support@mayabiboutiques.com",
  contactAddress: "পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।",
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
    whatsappNumber: data.whatsapp_number ?? "",
    freeShippingThreshold: data.free_shipping_threshold ?? 0,
    heroVideoUrl: data.hero_video_url ?? "",
    sslcommerzEnabled: data.sslcommerz_enabled ?? false,
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
    announcementText: data.announcement_text ?? DEFAULTS.announcementText,
    exclusiveTitle: data.exclusive_title ?? DEFAULTS.exclusiveTitle,
    exclusiveSubtitle: data.exclusive_subtitle ?? DEFAULTS.exclusiveSubtitle,
    exclusiveButtonText: data.exclusive_button_text ?? DEFAULTS.exclusiveButtonText,
    exclusiveButtonLink: data.exclusive_button_link ?? DEFAULTS.exclusiveButtonLink,
    exclusiveImage1: data.exclusive_image_1 ?? "",
    exclusiveImage2: data.exclusive_image_2 ?? "",
    exclusiveImage3: data.exclusive_image_3 ?? "",
    contactEmail: data.contact_email ?? DEFAULTS.contactEmail,
    contactAddress: data.contact_address ?? DEFAULTS.contactAddress,
  };
}
