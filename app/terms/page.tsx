import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শর্তাবলী | Mayabi Boutiques",
  description: "মায়াবী বুটিকস ব্যবহারের শর্তাবলী।",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="font-serif text-base font-bold text-amber-400">{title}</h2>
      <div className="text-sm text-gray-300 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">শর্তাবলী (Terms &amp; Conditions)</h1>
        <p className="text-xs text-gray-500">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD")}</p>
      </div>

      <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)]">
        <Section title="১. সাধারণ শর্তাবলী">
          <p>
            মায়াবী বুটিকস ওয়েবসাইট ব্যবহার বা এখান থেকে অর্ডার করার মাধ্যমে আপনি নিচের শর্তাবলীতে
            সম্মত হচ্ছেন বলে গণ্য হবে।
          </p>
        </Section>

        <Section title="২. পণ্য ও মূল্য">
          <p>
            ওয়েবসাইটে দেখানো ছবি ও বিবরণ যথাসম্ভব নির্ভুল রাখার চেষ্টা করা হয়, তবে ফেব্রিক/রঙে সামান্য
            পার্থক্য হতে পারে। কোনো পূর্ব নোটিশ ছাড়াই মূল্য বা স্টক পরিবর্তনের অধিকার আমরা সংরক্ষণ করি।
          </p>
        </Section>

        <Section title="৩. অর্ডার ও পেমেন্ট">
          <p>
            আমরা ক্যাশ অন ডেলিভারি, বিকাশ এবং নগদ গ্রহণ করি। বিকাশ/নগদ পেমেন্টের ক্ষেত্রে সঠিক
            ট্রানজেকশন আইডি প্রদান আবশ্যক। ভুয়া বা সন্দেহজনক অর্ডার আমরা বাতিল করার অধিকার রাখি।
          </p>
        </Section>

        <Section title="৪. মেধাস্বত্ব">
          <p>
            এই ওয়েবসাইটের সকল ছবি, ডিজাইন ও কনটেন্ট মায়াবী বুটিকস-এর সম্পত্তি। লিখিত অনুমতি ছাড়া
            পুনঃব্যবহার করা যাবে না।
          </p>
        </Section>

        <Section title="৫. দায়বদ্ধতা">
          <p>
            ডেলিভারি সময় কুরিয়ার পার্টনারের কারণে বিলম্ব হলে তার জন্য আমরা দায়ী থাকব না, তবে আপনার
            অর্ডারের সর্বশেষ অবস্থা জানাতে আমরা সর্বোচ্চ চেষ্টা করব।
          </p>
        </Section>

        <p className="text-[11px] text-gray-500 border-t border-white/10 pt-4">
          দ্রষ্টব্য: এটি একটি সাধারণ টেমপ্লেট। আপনার ব্যবসার নির্দিষ্ট প্র্যাকটিস অনুযায়ী পর্যালোচনা করে
          প্রয়োজনে আইনজীবীর পরামর্শ নিয়ে সম্পূর্ণ করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।
        </p>
      </div>
    </div>
  );
}
