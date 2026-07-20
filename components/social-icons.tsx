// 🔧 মূল এররের ফিক্স:
// lucide-react-এর নতুন ভার্সনগুলো থেকে ব্র্যান্ড/লোগো আইকন (Facebook, Instagram ইত্যাদি)
// বাদ দেওয়া হয়েছে, তাই `import { Facebook } from "lucide-react"` কাজ করছিল না।
// এখানে সেগুলোর বদলে ছোট, নির্ভরযোগ্য ইনলাইন SVG আইকন ব্যবহার করা হয়েছে —
// কোনো এক্সটার্নাল প্যাকেজের ভার্সনের উপর নির্ভর করতে হচ্ছে না।

type IconProps = { className?: string };

export function FacebookIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.02-3.5h-3.02v13.6a2.6 2.6 0 1 1-1.84-2.49v-3.13a5.62 5.62 0 1 0 4.86 5.58V9.7a7.26 7.26 0 0 0 4.24 1.35V8.02a4.28 4.28 0 0 1-1.22-.2 4.24 4.24 0 0 1 0-2Z" />
    </svg>
  );
}

export function MessengerIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.9 1.44 5.49 3.7 7.19V22l3.38-1.86c.9.25 1.87.38 2.92.38 5.52 0 10-4.15 10-9.25S17.52 2 12 2Zm1.02 12.46-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.9-2.72-5.46 5.82Z" />
    </svg>
  );
}

export function WhatsappIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.2-1.47a9.86 9.86 0 0 0 4.84 1.27h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm0 18.02a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.08.87.87-3-.19-.31a8.06 8.06 0 0 1-1.24-4.36c0-4.46 3.63-8.1 8.1-8.1 4.46 0 8.09 3.64 8.09 8.1 0 4.47-3.63 8.11-8.12 8.11Zm4.44-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.15.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.44-.59 1.65-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}