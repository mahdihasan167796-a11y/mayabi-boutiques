import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase";
import { FacebookIcon, InstagramIcon, TiktokIcon, MessengerIcon } from "@/components/social-icons";
import { NewsletterForm } from "@/components/newsletter-form";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const { data: igItems } = await supabaseAdmin.from("instagram_showcase").select("*").order("sort_order", { ascending: true }).limit(6);

  const socialLinks = [
    { url: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { url: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
    { url: settings.messengerUrl, label: "Messenger", Icon: MessengerIcon },
  ].filter((s) => s.url);

  return (
    <footer id="footer" className="bg-[#080808] border-t border-white/10 py-14 text-xs text-gray-400 font-medium relative z-10 scroll-mt-32">
      {igItems && igItems.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <p className="text-center text-[11px] text-gray-500 uppercase tracking-widest mb-4">Follow @mayabiboutiques</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {igItems.map((item: any) => (
              <a key={item.id} href={item.post_link || "#"} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-colors">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 text-center mb-12 pb-12 border-b border-white/10">
        <h3 className="font-serif text-lg font-bold text-white mb-2">নিউজলেটার সাবস্ক্রাইব করুন</h3>
        <p className="text-gray-500 mb-5">নতুন কালেকশন ও এক্সক্লুসিভ অফারের খবর সবার আগে পেতে ইমেইল দিন</p>
        <div className="max-w-sm mx-auto">
          <NewsletterForm />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-3.5">
          <h4 className="font-serif text-white font-bold tracking-wide text-base">⚜ MAYABI BOUTIQUES</h4>
          <p className="leading-relaxed text-gray-500">
            পণ্য এবং সার্ভিসের আভিজাত্যের এক অনন্য মেলবন্ধন। আপনার প্রতিটি উৎসবের অনবদ্য ফ্যাশন পার্টনার।
          </p>
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map(({ url, label, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:border-amber-500/50 hover:text-amber-400 hover:shadow-[0_0_20px_-6px_rgba(245,158,11,0.5)] transition-all duration-500 ease-out"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">কুইক লিঙ্ক</h4>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:text-amber-400 transition-colors duration-300">হোম পেজ</Link></li>
            <li><Link href="/#featured" className="hover:text-amber-400 transition-colors duration-300">এক্সক্লুসিভ কালেকশন</Link></li>
            <li><Link href="/#our-story" className="hover:text-amber-400 transition-colors duration-300">আমাদের গল্প</Link></li>
            <li><Link href="/#pricing" className="hover:text-amber-400 transition-colors duration-300">সেরা অফার সমূহ</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">জরুরি পলিসি</h4>
          <ul className="space-y-1.5">
            <li><Link href="/faq" className="hover:text-amber-400 transition-colors duration-300">FAQ</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-amber-400 transition-colors duration-300">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-amber-400 transition-colors duration-300">Terms &amp; Conditions</Link></li>
            <li><Link href="/refund-policy" className="hover:text-amber-400 transition-colors duration-300">Refund/Return Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">যোগাযোগ</h4>
          <ul className="space-y-1.5 text-gray-500">
            {settings.phoneNumber && <li>📞 {settings.phoneNumber}</li>}
            <li>✉️ support@mayabiboutiques.com</li>
            <li>📍 পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 border-t border-white/10 mt-10 pt-6 text-center text-[11px] text-gray-600">
        © ২০২৬ মায়াবী বুটিকস। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
