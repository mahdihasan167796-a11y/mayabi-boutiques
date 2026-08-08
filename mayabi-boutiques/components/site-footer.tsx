import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { FacebookIcon, InstagramIcon, TiktokIcon, MessengerIcon } from "@/components/social-icons";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  const socialLinks = [
    { url: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { url: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
    { url: settings.messengerUrl, label: "Messenger", Icon: MessengerIcon },
  ].filter((s) => s.url);

  return (
    <footer id="footer" className="bg-[#0b0b0a] border-t border-[#c9a054]/15 py-12 text-xs text-gray-500 font-medium relative z-10 scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <h4 className="text-white font-bold tracking-widest text-sm uppercase">⚜ MAYABI BOUTIQUES</h4>
          <p className="leading-relaxed">
            পণ্য এবং সার্ভিসের আভিজাত্যের এক অনন্য মেলবন্ধন। আপনার প্রতিটি উৎসবের অনবদ্য ফ্যাশন পার্টনার।
          </p>
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 text-gray-400">
              {socialLinks.map(({ url, label, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#c9a054]/20 hover:border-[#c9a054] hover:text-[#c9a054] transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">কুইক লিঙ্ক</h4>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:text-[#c9a054]">হোম পেজ</Link></li>
            <li><Link href="/#featured" className="hover:text-[#c9a054]">এক্সক্লুসিভ কালেকশন</Link></li>
            <li><Link href="/#our-story" className="hover:text-[#c9a054]">আমাদের গল্প</Link></li>
            <li><Link href="/#pricing" className="hover:text-[#c9a054]">সেরা অফার সমূহ</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">জরুরি পলিসি</h4>
          <ul className="space-y-1.5">
            <li className="cursor-pointer hover:text-[#c9a054]">Privacy Policy</li>
            <li className="cursor-pointer hover:text-[#c9a054]">Terms &amp; Conditions</li>
            <li className="cursor-pointer hover:text-[#c9a054]">Refund/Return Policy</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">যোগাযোগ</h4>
          <ul className="space-y-1.5 text-gray-400">
            {settings.phoneNumber && <li>📞 {settings.phoneNumber}</li>}
            <li>✉️ support@mayabiboutiques.com</li>
            <li>📍 পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 border-t border-gray-900 mt-10 pt-6 text-center text-[11px]">
        © ২০২৬ মায়াবী বুটিকস। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
