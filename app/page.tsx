'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Search, ShieldCheck, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
    title: 'Real-time Messaging',
    desc: 'Messages appear instantly, powered by Supabase Realtime — no refresh needed.',
    gradient: 'from-indigo-500/20 to-transparent',
    borderHover: 'hover:border-indigo-500/50',
  },
  {
    icon: <Search className="w-6 h-6 text-fuchsia-400" />,
    title: 'Find Anyone',
    desc: 'Search people by their username and start chatting in just one click.',
    gradient: 'from-fuchsia-500/20 to-transparent',
    borderHover: 'hover:border-fuchsia-500/50',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    title: 'Secure by Design',
    desc: 'Advanced security policies ensure only you and your contact see your messages.',
    gradient: 'from-emerald-500/20 to-transparent',
    borderHover: 'hover:border-emerald-500/50',
  },
];

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#030308] text-white font-sans selection:bg-indigo-500/30">
      
      {/* 🟢 Premium Background (Aurora + Grid) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="aurora-bg" />
      </div>

      {/* 🟢 Floating Glass Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto mt-4 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <span>Nova<span className="text-indigo-400">Chat</span></span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="group relative flex items-center gap-2 text-sm font-semibold bg-white text-black px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.nav>

      {/* 🟢 Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 w-full max-w-5xl mx-auto mt-16 md:mt-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
          
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs md:text-sm font-medium text-indigo-300 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Welcome to the future of communication
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight max-w-4xl leading-[1.05] mb-6 drop-shadow-2xl">
            Talk to anyone, <br className="hidden md:block" />
            <span className="relative">
              <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 rounded-full"></span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 animate-gradient-x">
                instantly.
              </span>
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed font-medium">
            Connect with anyone by username. Messages sync in real-time across all your devices. Fast, secure, and beautifully designed.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
            <Link href="/signup" className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] w-full sm:w-auto">
              Start Chatting Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 w-full sm:w-auto">
              I have an account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 🟢 Features Section (Linear Style) */}
      <section className="relative z-10 px-6 pb-32 w-full max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeInUp} className={`group relative bg-black/40 border border-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${f.borderHover} hover:shadow-2xl`}>
              {/* Background Glow */}
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white/95 tracking-tight">{f.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 🟢 Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-auto bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-bold opacity-80">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <span>NovaChat</span>
          </div>
          <p className="text-white/40 text-sm font-medium">
            © {new Date().getFullYear()} NovaChat. Designed for the future.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1.5 font-medium">
            Powered by <span className="text-white/80">Next.js</span> & <span className="text-white/80">Supabase</span>
          </p>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style jsx>{`
        .aurora-bg {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .aurora-bg::before, .aurora-bg::after {
          content: ''; position: absolute; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(140px); opacity: 0.15; animation: float 20s ease-in-out infinite;
        }
        .aurora-bg::before {
          background: radial-gradient(circle, rgba(99,102,241,0.8), transparent 60%); top: -20%; left: -10%;
        }
        .aurora-bg::after {
          background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 60%); bottom: -20%; right: -10%; animation-delay: -10s; animation-direction: reverse;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, 5%) scale(1.05); }
          66% { transform: translate(-3%, 2%) scale(0.95); }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}
