// বাংলা সংখ্যা ও টাকা ফরম্যাট করার হেল্পার ফাংশন

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** ইংরেজি সংখ্যাকে (0-9) বাংলা সংখ্যায় (০-৯) রূপান্তর করে */
export function engToBdNum(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
}

/** সংখ্যাকে বাংলা টাকার ফরম্যাটে দেখায় — যেমন: ৳১,৪৯৯ */
export function formatBDT(amount: number | string | null | undefined): string {
  const num = Number(amount) || 0;
  const rounded = Math.round(num);
  // হাজার/লাখের কমা বসানো (বাংলা সংখ্যা পদ্ধতি অনুযায়ী: ১,২৩,৪৫৬)
  const parts = String(rounded).split("");
  let result = "";
  let count = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    result = parts[i] + result;
    count++;
    if (i !== 0) {
      if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
        result = "," + result;
      }
    }
  }
  return "৳" + engToBdNum(result);
}
