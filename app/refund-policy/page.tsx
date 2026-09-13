import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিফান্ড/রিটার্ন পলিসি | Mayabi Boutiques",
  description: "মায়াবী বুটিকস-এর এক্সচেঞ্জ ও রিফান্ড নীতিমালা — ৭ দিনের ইজি এক্সচেঞ্জ সুবিধা।",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="font-serif text-base font-bold text-amber-400">{title}</h2>
      <div className="text-sm text-gray-300 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">রিফান্ড / রিটার্ন পলিসি</h1>
        <p className="text-xs text-gray-500">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD")}</p>
      </div>

      <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)]">
        <Section title="১. ৭ দিনের ইজি এক্সচেঞ্জ">
          <p>
            পণ্য হাতে পাওয়ার তারিখ থেকে ৭ দিনের মধ্যে সাইজ বা রঙ পছন্দ না হলে আমরা সহজ এক্সচেঞ্জের
            সুবিধা দিয়ে থাকি।
          </p>
        </Section>

        <Section title="২. এক্সচেঞ্জের শর্তাবলী">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>পণ্যটি অব্যবহৃত, ধোয়া হয়নি এবং মূল ট্যাগ/প্যাকেজিং অক্ষত থাকতে হবে।</li>
            <li>পারফিউম, মেকআপ বা অন্য কোনো দাগ থাকা যাবে না।</li>
            <li>এক্সচেঞ্জের অনুরোধ ৭ দিনের মধ্যে জানাতে হবে।</li>
          </ul>
        </Section>

        <Section title="৩. যেসব ক্ষেত্রে এক্সচেঞ্জ প্রযোজ্য নয়">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>কাস্টমাইজড বা অর্ডার অনুযায়ী তৈরি করা পণ্য।</li>
            <li>ডিসকাউন্ট/ক্লিয়ারেন্স সেলের আওতাধীন পণ্য (নির্দিষ্টভাবে উল্লেখ থাকলে)।</li>
            <li>ব্যবহারের চিহ্ন বা ক্ষতিগ্রস্ত অবস্থায় ফেরত আসা পণ্য।</li>
          </ul>
        </Section>

        <Section title="৪. রিফান্ড (নগদ ফেরত)">
          <p>
            আমরা মূলত এক্সচেঞ্জকে অগ্রাধিকার দিই। তবে ভুল পণ্য পাঠানো হলে বা পণ্যে উৎপাদনগত ত্রুটি
            থাকলে, বিকাশ/নগদে প্রি-পেইড করা অর্থ যাচাই সাপেক্ষে ফেরত দেওয়া হবে। ক্যাশ অন ডেলিভারি
            অর্ডারের ক্ষেত্রে যেহেতু আগে থেকে টাকা নেওয়া হয় না, তাই সেক্ষেত্রে সংশোধিত/সঠিক পণ্য পাঠানো
            হবে।
          </p>
        </Section>

        <Section title="৫. এক্সচেঞ্জ/রিটার্নের জন্য যা করবেন">
          <p>
            অর্ডার আইডি ও সমস্যার বিবরণসহ আমাদের সাথে যোগাযোগ করুন —{" "}
            <a href="mailto:support@mayabiboutiques.com" className="text-amber-400 underline">
              support@mayabiboutiques.com
            </a>{" "}
            অথবা আমাদের ফেসবুক পেজে মেসেজ দিন। আমাদের টিম পরবর্তী ধাপ জানিয়ে দেবে।
          </p>
        </Section>

        <p className="text-[11px] text-gray-500 border-t border-white/10 pt-4">
          দ্রষ্টব্য: এটি একটি সাধারণ টেমপ্লেট পলিসি। আপনার প্রকৃত এক্সচেঞ্জ/রিফান্ড প্র্যাকটিস অনুযায়ী এটি
          পর্যালোচনা করে হালনাগাদ করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।
        </p>
      </div>
    </div>
  );
}
