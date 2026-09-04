import { createClient } from '@supabase/supabase-js';

// 'as string' ব্যবহার করা হয়েছে যাতে TypeScript কোনো এরর না ধরে
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ইউজারের লগইন সেশন ধরে রাখবে
    autoRefreshToken: true, // টোকেন এক্সপায়ার হলে অটো রিফ্রেশ করবে
  },
});
