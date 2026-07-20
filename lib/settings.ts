import { supabaseAdmin } from "./supabase";

export interface SiteSettings {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  messengerUrl: string;
  phoneNumber: string;
}

const DEFAULTS: SiteSettings = {
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  messengerUrl: "",
  phoneNumber: "",
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
  };
}
