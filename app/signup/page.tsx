'use client';

import { useState } from 'react';
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

  // STEP 2: OTP ভেরিফাই করে Supabase এ একাউন্ট খোলা
  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

    router.push('/login');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-[#05050f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 blur-[140px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
        <AnimatePresence mode="wait">
          
          {step === 1 ? (
            <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30"><MessageSquare size={28}/></div>
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-white/40 text-sm mt-2">Join NovaChat and start connecting.</p>
              </div>

              <form onSubmit={handleStartSignup} className="space-y-4">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2"><AlertCircle size={18}/>{error}</div>}
                
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18}/>
                  <input type="text" placeholder="Username" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all"/>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18}/>
                  <input type="email" placeholder="Email address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all"/>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18}/>
                  <input type="password" placeholder="Password (min. 6 chars)" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-white/30 transition-all"/>
                </div>

                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 mt-2 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
                </button>
              </form>
              <p className="text-center text-sm text-white/50 mt-8">
                Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Login here</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => setStep(1)} className="absolute top-0 left-0 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ArrowLeft size={18}/></button>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30"><KeyRound size={28}/></div>
                <h2 className="text-2xl font-bold">Verify Email</h2>
                <p className="text-white/40 text-sm mt-2 max-w-[250px] mx-auto">We've sent a 6-digit code to <br/><b className="text-white/80">{form.email}</b></p>
              </div>

              <form onSubmit={handleVerifyAndCreate} className="space-y-6">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2"><AlertCircle size={18}/>{error}</div>}
                
                <input type="text" placeholder="------" maxLength={6} required value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.5em] focus:border-green-500/50 outline-none text-white transition-all"/>

                <button disabled={loading || form.otp.length < 6} className="w-full bg-green-600 hover:bg-green-500 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 disabled:opacity-50">
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
