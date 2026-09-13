import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি | Mayabi Boutiques",
  description: "মায়াবী বুটিকস কীভাবে আপনার তথ্য সংগ্রহ ও ব্যবহার করে তার বিস্তারিত।",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="font-serif text-base font-bold text-amber-400">{title}</h2>
      <div className="text-sm text-gray-300 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">প্রাইভেসি পলিসি</h1>
        <p className="text-xs text-gray-500">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD")}</p>
      </div>

      <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)]">
        <Section title="১. আমরা যে তথ্য সংগ্রহ করি">
          <p>
            অর্ডার সম্পন্ন করার জন্য আমরা আপনার নাম, মোবাইল নাম্বার, ডেলিভারি ঠিকানা এবং পেমেন্ট
            (বিকাশ/নগদ) ট্রানজেকশন আইডি সংগ্রহ করি। আমরা কখনো আপনার বিকাশ/নগদ পিন বা কার্ড নাম্বার
            সংগ্রহ বা সংরক্ষণ করি না।
          </p>
        </Section>

        <Section title="২. তথ্য কীভাবে ব্যবহার করা হয়">
          <p>
            সংগৃহীত তথ্য শুধুমাত্র অর্ডার প্রসেসিং, ডেলিভারি, এবং অর্ডার সংক্রান্ত SMS/ইমেইল
            নোটিফিকেশন পাঠানোর জন্য ব্যবহার করা হয়। আপনার সম্মতি ছাড়া আমরা কখনো আপনার তথ্য তৃতীয়
            কোনো পক্ষের কাছে বিক্রি বা শেয়ার করি না, কুরিয়ার পার্টনার (Steadfast/Pathao/RedX) ছাড়া —
            যাদের কাছে শুধুমাত্র ডেলিভারির জন্য প্রয়োজনীয় তথ্যটুকুই পাঠানো হয়।
          </p>
        </Section>

        <Section title="৩. তথ্যের নিরাপত্তা">
          <p>
            আপনার তথ্য সুরক্ষিত সার্ভারে সংরক্ষণ করা হয় এবং শুধুমাত্র অনুমোদিত অ্যাডমিন/স্টাফ সদস্যরাই
            এতে প্রবেশ করতে পারেন।
          </p>
        </Section>

        <Section title="৪. যোগাযোগ">
          <p>
            আপনার তথ্য সংক্রান্ত কোনো প্রশ্ন বা উদ্বেগ থাকলে আমাদের সাথে যোগাযোগ করুন:{" "}
            <a href="mailto:support@mayabiboutiques.com" className="text-amber-400 underline">
              support@mayabiboutiques.com
            </a>
          </p>
        </Section>

        <p className="text-[11px] text-gray-500 border-t border-white/10 pt-4">
          দ্রষ্টব্য: এটি একটি সাধারণ টেমপ্লেট পলিসি। আপনার ব্যবসার নির্দিষ্ট প্র্যাকটিস ও বাংলাদেশের প্রযোজ্য আইন
          অনুযায়ী এটি পর্যালোচনা করে প্রয়োজনে আইনজীবীর পরামর্শ নিয়ে সম্পূর্ণ করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।
        </p>
      </div>
    </div>
  );
}
