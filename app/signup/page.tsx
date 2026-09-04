// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      setError('এই ইউজারনেম আগে থেকেই আছে, অন্য একটা দিন।');
      setLoading(false);
      return;
    }

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
    <div className="wrap">
      <div className="aurora" />
      <form onSubmit={handleSignup} className="card">
        <h1>Create Account</h1>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        <p className="switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>

      <style jsx>{`
        .wrap {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #05050f;
          overflow: hidden;
        }
        .aurora {
          position: fixed;
          inset: 0;
          z-index: -1;
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
        .card {
          width: 100%;
          max-width: 380px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        h1 {
          color: #fff;
          font-size: 24px;
          text-align: center;
          margin-bottom: 24px;
        }
        .error {
          color: #f87171;
          font-size: 13px;
          text-align: center;
          margin-bottom: 16px;
        }
        input {
          width: 100%;
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        input::placeholder { color: rgba(255,255,255,0.4); }
        input:focus { box-shadow: 0 0 0 2px #818cf8; }
        button {
          width: 100%;
          margin-top: 8px;
          padding: 12px;
          border-radius: 12px;
          background: #6366f1;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover { background: #818cf8; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .switch {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin-top: 16px;
        }
        .switch a { color: #a5b4fc; text-decoration: underline; }
      `}</style>
    </div>
  );
}
