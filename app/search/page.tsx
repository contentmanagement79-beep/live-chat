// app/search/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_online')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId ?? '')
        .limit(20);

      setResults(data ?? []);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, currentUserId]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;

    const { data: myConvos } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    const myConvoIds = (myConvos ?? []).map((c) => c.conversation_id);

    let existingId: string | null = null;
    if (myConvoIds.length > 0) {
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConvoIds);
      if (shared && shared.length > 0) existingId = shared[0].conversation_id;
    }

    if (existingId) {
      router.push(`/chat/${existingId}`);
      return;
    }

    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({ is_group: false })
      .select()
      .single();

    if (error || !newConvo) return;

    await supabase.from('conversation_participants').insert([
      { conversation_id: newConvo.id, user_id: currentUserId },
      { conversation_id: newConvo.id, user_id: otherUserId },
    ]);

    router.push(`/chat/${newConvo.id}`);
  };

  return (
    <div className="wrap">
      <div className="aurora" />
      <div className="box">
        <h1>Find People</h1>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="list">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => startConversation(user.id)}
              className="user-row"
            >
              <div className="left">
                <span className={`dot ${user.is_online ? 'online' : ''}`} />
                <span className="uname">@{user.username}</span>
              </div>
              <span className="chat-label">Chat →</span>
            </button>
          ))}
          {query && results.length === 0 && (
            <p className="empty">No users found.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrap {
          position: relative;
          min-height: 100vh;
          padding: 40px 16px;
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
        .box {
          max-width: 420px;
          margin: 0 auto;
        }
        h1 {
          color: #fff;
          font-size: 22px;
          margin-bottom: 16px;
        }
        input {
          width: 100%;
          margin-bottom: 16px;
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
        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .user-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: background 0.2s;
        }
        .user-row:hover { background: rgba(255,255,255,0.1); }
        .left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6b7280;
        }
        .dot.online { background: #4ade80; }
        .uname {
          color: #fff;
          font-weight: 500;
        }
        .chat-label {
          color: #a5b4fc;
          font-size: 13px;
        }
        .empty {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
