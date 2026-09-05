'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Loader2, MessageSquare, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1=Signup Form, 2=OTP Screen
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [form, setForm] = useState({ username: '', email: '', password: '', otp: '' });
  
  // OTP Inputs Ref for auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // STEP 1: ইমেইল এবং ইউজারনেম চেক করে OTP পাঠানো
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: userExists } = await supabase.from('profiles').select('username').eq('username', form.username).maybeSingle();
    if (userExists) {
      setError('Username already taken. Try another one.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send email.');
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // STEP 2: OTP ভেরিফাই করে Supabase এ একাউন্ট খোলা ও অটো-লগইন
  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ১. OTP চেক করা
    const { data: validOtp } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', form.email)
      .eq('otp', form.otp)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!validOtp) {
      setError('Invalid or expired verification code.');
      setLoading(false);
      return;
    }

    // ২. একাউন্ট তৈরি করা (Supabase-এ ইমেইল ভেরিফিকেশন অফ থাকায় অটোমেটিক সেশন তৈরি হবে)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

      // ৩. আপনার দেওয়া লিংকে সরাসরি রিডাইরেক্ট করা
    window.location.href = 'https://live-chats-assetprim.vercel.app/chat';
  };

  // 6-Box OTP লজিক হ্যান্ডলার
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return; // শুধু সংখ্যা এলাউ করবে
    
    const otpArray = form.otp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('').substring(0, 6);
    setForm({ ...form, otp: newOtp });

    // পরের বক্সে অটো-ফোকাস
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace চাপলে আগের বক্সে ফোকাস যাবে
    if (e.key === 'Backspace' && !form.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-[#05050f] text-white overflow-hidden">
      {/* Background Animated Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 blur-[140px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <AnimatePresence mode="wait">
          
          {step === 1 ? (
            <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <MessageSquare size={28} className="drop-shadow-lg" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
                <p className="text-white/40 text-sm mt-2">Join NovaChat and start connecting.</p>
              </div>

              <form onSubmit={handleStartSignup} className="space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle size={18}/>{error}
                  </motion.div>
                )}
                
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18}/>
                  <input type="text" placeholder="Username" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all shadow-inner"/>
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18}/>
                  <input type="email" placeholder="Email address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all shadow-inner"/>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18}/>
                  <input type="password" placeholder="Password (min. 6 chars)" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all shadow-inner"/>
                </div>

                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 mt-2 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
                </button>
              </form>
              <p className="text-center text-sm text-white/50 mt-8">
                Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">Login here</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => setStep(1)} className="absolute top-0 left-0 p-2 text-white/40 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft size={18}/></button>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <KeyRound size={32} className="drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Verify Email</h2>
                <p className="text-white/40 text-sm mt-3 max-w-[250px] mx-auto leading-relaxed">
                  We've sent a 6-digit code to <br/>
                  <span className="text-white/90 font-medium">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyAndCreate} className="space-y-8">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle size={18}/>{error}
                  </motion.div>
                )}
                
                {/* 6-Box Modern OTP Input */}
                <div className="flex justify-between gap-2 sm:gap-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={form.otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 bg-black/40 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:border-green-500/50 focus:bg-green-500/5 focus:ring-2 focus:ring-green-500/30 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <button disabled={loading || form.otp.length < 6} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20}/> Verify & Sign Up</>}
                </button>
              </form>
            </motion.div>
          )}
          
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
