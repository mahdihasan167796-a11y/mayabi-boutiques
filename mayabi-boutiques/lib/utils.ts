// সাধারণ ইউটিলিটি ফাংশনসমূহ — পুরো প্রজেক্ট জুড়ে ব্যবহৃত হয়

const BD_DIGITS: { [key: string]: string } = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

/** ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর করে */
export function engToBdNum(input: string | number): string {
  return input.toString().replace(/[0-9]/g, (d) => BD_DIGITS[d] ?? d);
}

/** টাকার পরিমাণকে "৳১,৮৫০" ফরম্যাটে দেখায় */
export function formatBDT(amount: number): string {
  return `৳${engToBdNum(amount.toLocaleString("en-US"))}`;
}
