'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Search, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
    title: 'Real-time Messaging',
    desc: 'Messages appear instantly, powered by Supabase Realtime — no refresh needed.',
  },
  {
    icon: <Search className="w-6 h-6 text-fuchsia-400" />,
    title: 'Find Anyone',
    desc: 'Search people by their username and start chatting in one click.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-pink-400" />,
    title: 'Secure by Design',
    desc: 'Row-level security ensures only you and your contact see your messages.',
  },
];

// Animation Variants for Framer Motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#05050f] text-white font-sans">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight"
        >
          <MessageSquare className="w-7 h-7 text-indigo-500" />
          <span>Nova<span className="text-indigo-400">Chat</span></span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 md:gap-6"
        >
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 w-full max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          <motion.span 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs md:text-sm text-indigo-300 mb-8 shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live now — real-time chat, zero delay
          </motion.span>

          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 drop-shadow-2xl"
          >
            Talk to anyone, <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 animate-gradient-x">
              instantly.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-lg text-white/60 max-w-2xl mb-10 leading-relaxed"
          >
            NovaChat connects you with anyone by username, with messages that
            sync in real time across every device. Fast, secure, and built for the future.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/signup" className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
              Start Chatting Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full font-semibold transition-all duration-300">
              I already have an account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 pb-24 w-full max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/20 backdrop-blur-xl p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white/90">{f.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} NovaChat. All rights reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            Built with <span className="font-semibold text-white/60">Next.js</span> & <span className="font-semibold text-white/60">Supabase</span>
          </p>
        </div>
      </footer>

      {/* Custom Styles for Aurora Effect */}
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
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }
        .aurora-bg::before {
          background: radial-gradient(circle, rgba(99,102,241,0.8), transparent 60%);
          top: -20%;
          left: -10%;
        }
        .aurora-bg::after {
          background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 60%);
          bottom: -20%;
          right: -10%;
          animation-delay: -10s;
          animation-direction: reverse;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 10%) scale(1.1); }
          66% { transform: translate(-5%, 5%) scale(0.9); }
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
