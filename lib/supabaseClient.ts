import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🛡️ Safety Check: প্রোডাকশনে বা লোকাল মেশিনে env ভেরিয়েবল মিসিং থাকলে ডেভেলপারকে সতর্ক করবে
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase Environment Variables! Please check your .env.local file.'
  );
}

// Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ইউজারের লগইন সেশন ধরে রাখবে
    autoRefreshToken: true, // টোকেন এক্সপায়ার হলে অটো রিফ্রেশ করবে
  },
});
