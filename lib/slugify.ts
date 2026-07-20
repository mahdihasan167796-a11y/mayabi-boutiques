/** নাম থেকে URL-বান্ধব স্লাগ বানায়, শেষে র‍্যান্ডম সাফিক্স যোগ করে ইউনিক নিশ্চিত করে */
export function slugify(name: string): string {
  const base = name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0980-\u09FF\s-]/g, "") // ইংরেজি/বাংলা অক্ষর ও সংখ্যা ছাড়া সব বাদ
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "product"}-${suffix}`;
}
