'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ১. প্রথমে চেক করা হচ্ছে ইউজারনেমটি আগে থেকেই আছে কিনা
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      setError('এই ইউজারনেম আগে থেকেই আছে, অন্য একটি চেষ্টা করুন।');
      setLoading(false);
      return;
    }

    // ২. সাইনআপ প্রসেস
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/login');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[#05050f] text-white font-sans">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Create Account</h1>
          <p className="text-white/50 text-sm mt-2 text-center">
            Join NovaChat and start connecting instantly.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-300 mt-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors hover:underline underline-offset-4">
            Login here
          </Link>
        </p>
      </motion.div>

      {/* Styles for Aurora Background */}
      <style jsx>{`
        .aurora-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .aurora-bg::before,
        .aurora-bg::after {
          content: '';
          position: absolute;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.35;
          animation: float 20s ease-in-out infinite;
        }
        .aurora-bg::before {
          background: radial-gradient(circle, rgba(99,102,241,0.8), transparent 60%);
          top: -10%;
          left: -10%;
        }
        .aurora-bg::after {
          background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 60%);
          bottom: -10%;
          right: -10%;
          animation-delay: -10s;
          animation-direction: reverse;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 10%) scale(1.1); }
          66% { transform: translate(-5%, 5%) scale(0.9); }
        }
      `}</style>
    </main>
  );
}
