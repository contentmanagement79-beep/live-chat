// app/page.tsx
'use client';

import Link from 'next/link';

const features = [
  {
    emoji: '⚡',
    title: 'Real-time Messaging',
    desc: 'Messages appear instantly, powered by Supabase Realtime — no refresh needed.',
  },
  {
    emoji: '🔍',
    title: 'Find Anyone',
    desc: 'Search people by their username and start chatting in one click.',
  },
  {
    emoji: '🛡️',
    title: 'Secure by Design',
    desc: 'Row-level security ensures only you and your contact see your messages.',
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <div className="aurora" />

      <nav className="nav">
        <div className="logo">💬 NovaChat</div>
        <div className="nav-links">
          <Link href="/login" className="link-btn">Login</Link>
          <Link href="/signup" className="primary-btn">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">⚡ Live now — real-time chat, zero delay</span>
        <h1 className="title">
          Talk to anyone, <span className="gradient-text">instantly.</span>
        </h1>
        <p className="subtitle">
          NovaChat connects you with anyone by username, with messages that
          sync in real time across every device. Fast, secure, futuristic.
        </p>
        <div className="cta-group">
          <Link href="/signup" className="primary-btn large">
            Start Chatting Free →
          </Link>
          <Link href="/login" className="glass-btn large">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="features">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.emoji}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} NovaChat. Built with Next.js & Supabase.
      </footer>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .aurora {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: #05050f;
        }
        .aurora::before,
        .aurora::after {
          content: '';
          position: absolute;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          animation: float 18s ease-in-out infinite;
        }
        .aurora::before {
          background: radial-gradient(circle, #6366f1, transparent 70%);
          top: -20%;
          left: -10%;
        }
        .aurora::after {
          background: radial-gradient(circle, #a855f7, transparent 70%);
          bottom: -20%;
          right: -10%;
          animation-delay: 6s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
        }
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 6vw;
        }
        .logo {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .link-btn {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 14px;
          padding: 8px 16px;
          transition: color 0.2s;
        }
        .link-btn:hover { color: #fff; }
        .primary-btn {
          background: #6366f1;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          transition: background 0.2s, transform 0.2s;
        }
        .primary-btn:hover { background: #818cf8; transform: translateY(-1px); }
        .primary-btn.large { padding: 16px 32px; font-size: 16px; }
        .glass-btn {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 999px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .glass-btn:hover { background: rgba(255,255,255,0.1); }
        .glass-btn.large { padding: 16px 32px; font-size: 16px; }
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
        }
        .badge {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 13px;
          color: #a5b4fc;
          margin-bottom: 24px;
        }
        .title {
          font-size: clamp(36px, 7vw, 72px);
          font-weight: 800;
          max-width: 900px;
          line-height: 1.15;
          text-shadow: 0 0 30px rgba(129,140,248,0.6);
        }
        .gradient-text {
          background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .subtitle {
          margin-top: 24px;
          font-size: 17px;
          color: rgba(255,255,255,0.6);
          max-width: 600px;
        }
        .cta-group {
          margin-top: 40px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px 100px;
          width: 100%;
        }
        .feature-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          transition: transform 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(129,140,248,0.4);
        }
        .feature-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .feature-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>
    </main>
  );
}
