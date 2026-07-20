export const ADMIN_SESSION_COOKIE = "mb_admin_session";

/** Web Crypto API দিয়ে SHA-256 হেক্স ডাইজেস্ট বানায় — Node ও Edge রানটাইম উভয়েই কাজ করে */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
