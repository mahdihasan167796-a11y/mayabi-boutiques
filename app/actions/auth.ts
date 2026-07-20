// app/actions/auth.ts
'use server';

export async function loginAdmin(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;

  // আপনার দেওয়া পাসওয়ার্ডের সাথে মিলছে কিনা চেক করুন
  if (password === correctPassword) {
    return { success: true, message: 'লগইন সফল হয়েছে!' };
  }

  return { success: false, message: 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' };
}