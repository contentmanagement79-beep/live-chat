// components/PresenceTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PresenceTracker() {
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const updateStatus = async (status: boolean) => {
      // যদি ইউজারের আইডি না থাকে, তবে আগে বের করে নিবে
      if (!userIdRef.current) {
        const { data } = await supabase.auth.getUser();
        userIdRef.current = data.user?.id || null;
      }
      
      // ইউজার লগড-ইন থাকলে ডেটাবেসে স্ট্যাটাস আপডেট করবে
      if (userIdRef.current) {
        await supabase
          .from('profiles')
          .update({ is_online: status })
          .eq('id', userIdRef.current);
      }
    };

    // ১. শুরুতে পেজ লোড হলে অনলাইন সেট করবে
    updateStatus(true);

    // ২. লগআউট করলে অফলাইন এবং লগইন করলে অনলাইন করবে
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        userIdRef.current = session?.user?.id || null;
        updateStatus(true);
      } else if (event === 'SIGNED_OUT') {
        updateStatus(false);
        userIdRef.current = null;
      }
    });

    // ৩. অন্য ট্যাবে গেলে বা ব্রাউজার মিনিমাইজ করলে অফলাইন, ফিরে আসলে অনলাইন
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStatus(true);
      } else {
        updateStatus(false);
      }
    };

    // ৪. ব্রাউজার বা ট্যাব কেটে দিলে অফলাইন করবে
    const handleBeforeUnload = () => {
      updateStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      authListener.subscription.unsubscribe();
    };
  }, []);

  return null; // এটি কোনো UI রেন্ডার করবে না, শুধু ব্যাকগ্রাউন্ডে কাজ করবে
}
