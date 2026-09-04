// app/chat/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  username: string;
  is_online: boolean;
};

type Conversation = {
  id: string;
  created_at: string;
};

export default function ChatDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace('/login');
        return;
      }

      setCurrentUserId(user.id);

      const [{ data: profile }, { data: participantRows }] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', user.id).maybeSingle(),
        supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id),
      ]);

      setUsername(profile?.username ?? 'User');

      const conversationIds = (participantRows ?? []).map((row) => row.conversation_id);
      if (conversationIds.length > 0) {
        const { data: convos } = await supabase
          .from('conversations')
          .select('id, created_at')
          .in('id', conversationIds)
          .order('created_at', { ascending: false });
        setConversations(convos ?? []);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  useEffect(() => {
    const findUsers = async () => {
      if (!search.trim() || !currentUserId) {
        setResults([]);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, is_online')
        .ilike('username', `%${search.trim()}%`)
        .neq('id', currentUserId)
        .limit(10);

      setResults(data ?? []);
    };

    const timer = window.setTimeout(findUsers, 300);
    return () => window.clearTimeout(timer);
  }, [search, currentUserId]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;
    setMessage('');

    const { data: myRows, error: myRowsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (myRowsError) {
      setMessage('Could not load conversations. Please try again.');
      return;
    }

    const myConversationIds = (myRows ?? []).map((row) => row.conversation_id);

    if (myConversationIds.length > 0) {
      const { data: sharedRows } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConversationIds);

      if (sharedRows && sharedRows.length > 0) {
        router.push(`/chat/${sharedRows[0].conversation_id}`);
        return;
      }
    }

    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({ is_group: false })
      .select('id')
      .single();

    if (conversationError || !conversation) {
      setMessage('Could not create a new chat. Please try again.');
      return;
    }

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: currentUserId },
        { conversation_id: conversation.id, user_id: otherUserId },
      ]);

    if (participantError) {
      setMessage('Chat was created but participants could not be added. Check Supabase RLS policies.');
      return;
    }

    router.push(`/chat/${conversation.id}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="loadingPage">
        <div className="loader" />
        <p>Loading NovaChat...</p>
        <style jsx>{`
          .loadingPage { min-height: 100vh; display: grid; place-content: center; gap: 14px; background: #05050f; color: #c7d2fe; text-align: center; }
          .loader { width: 36px; height: 36px; margin: auto; border: 3px solid rgba(129, 140, 248, 0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <main className="page">
      <div className="aurora" />

      <header className="header">
        <Link href="/" className="brand">💬 NovaChat</Link>
        <div className="rightHeader">
          <span className="welcome">Hi, @{username}</span>
          <button onClick={logout} className="logout">Log out</button>
        </div>
      </header>

      <section className="hero">
        <span className="status"><i /> You are online</span>
        <h1>Your messages.<br /><span>Your universe.</span></h1>
        <p>Search a username below to start a live conversation instantly.</p>
      </section>

      <section className="panel">
        <label htmlFor="user-search">Find someone</label>
        <div className="searchBox">
          <span>⌕</span>
          <input
            id="user-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by username..."
          />
        </div>

        {message && <p className="message">{message}</p>}

        {search && (
          <div className="searchResults">
            {results.map((user) => (
              <button key={user.id} className="user" onClick={() => startConversation(user.id)}>
                <span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span>
                <span className="userInfo">
                  <strong>@{user.username}</strong>
                  <small><i className={user.is_online ? 'onlineDot' : 'offlineDot'} /> {user.is_online ? 'Online' : 'Offline'}</small>
                </span>
                <span className="start">Chat →</span>
              </button>
            ))}
            {results.length === 0 && <p className="empty">No user found with this username.</p>}
          </div>
        )}
      </section>

      <section className="conversations">
        <div className="sectionTitle">
          <h2>Your conversations</h2>
          <Link href="/search">Open full search →</Link>
        </div>

        {conversations.length === 0 ? (
          <div className="emptyCard">
            <div>✦</div>
            <h3>No conversations yet</h3>
            <p>Find someone by username and send the first message.</p>
          </div>
        ) : (
          <div className="conversationList">
            {conversations.map((conversation) => (
              <Link key={conversation.id} href={`/chat/${conversation.id}`} className="conversation">
                <span className="conversationIcon">💬</span>
                <span>
                  <strong>Open conversation</strong>
                  <small>Started {new Date(conversation.created_at).toLocaleDateString()}</small>
                </span>
                <b>→</b>
              </Link>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .page { min-height: 100vh; padding-bottom: 60px; background: #05050f; color: #fff; overflow: hidden; }
        .aurora { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 14% 12%, rgba(79,70,229,.34), transparent 33%), radial-gradient(circle at 88% 75%, rgba(168,85,247,.28), transparent 34%), #05050f; }
        .header, .hero, .panel, .conversations { position: relative; z-index: 1; }
        .header { width: min(1080px, calc(100% - 32px)); margin: auto; padding: 22px 0; display: flex; align-items: center; justify-content: space-between; }
        .brand { color: #fff; font-size: 20px; font-weight: 800; text-decoration: none; }
        .rightHeader { display: flex; gap: 14px; align-items: center; }
        .welcome { color: rgba(255,255,255,.65); font-size: 14px; }
        .logout { border: 1px solid rgba(255,255,255,.13); background: rgba(255,255,255,.06); color: #fff; padding: 9px 14px; border-radius: 10px; cursor: pointer; }
        .logout:hover { background: rgba(255,255,255,.12); }
        .hero { width: min(760px, calc(100% - 32px)); margin: 54px auto 28px; text-align: center; }
        .status { display: inline-flex; gap: 8px; align-items: center; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; padding: 8px 13px; background: rgba(255,255,255,.05); color: #a5b4fc; font-size: 13px; }
        .status i { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 12px #4ade80; }
        h1 { margin: 18px 0 13px; font-size: clamp(38px, 7vw, 68px); line-height: 1.05; letter-spacing: -2px; }
        h1 span { color: #a78bfa; text-shadow: 0 0 30px rgba(167,139,250,.6); }
        .hero p { color: rgba(255,255,255,.6); margin: 0; font-size: 16px; }
        .panel, .conversations { width: min(690px, calc(100% - 32px)); margin: 26px auto; border: 1px solid rgba(255,255,255,.1); border-radius: 22px; background: rgba(255,255,255,.045); backdrop-filter: blur(18px); padding: 22px; }
        label { display: block; margin-bottom: 10px; color: #e0e7ff; font-size: 14px; font-weight: 700; }
        .searchBox { display: flex; gap: 10px; align-items: center; padding: 0 14px; background: rgba(0,0,0,.24); border: 1px solid rgba(255,255,255,.12); border-radius: 13px; }
        .searchBox span { color: #a5b4fc; font-size: 25px; line-height: 1; }
        input { width: 100%; padding: 14px 0; outline: none; border: 0; background: transparent; color: #fff; font-size: 15px; }
        input::placeholder { color: rgba(255,255,255,.4); }
        .searchBox:focus-within { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,.16); }
        .searchResults { margin-top: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 14px; }
        .user { width: 100%; display: flex; align-items: center; gap: 12px; border: 0; border-bottom: 1px solid rgba(255,255,255,.07); background: transparent; color: #fff; padding: 13px; cursor: pointer; text-align: left; }
        .user:last-child { border-bottom: 0; }
        .user:hover { background: rgba(129,140,248,.13); }
        .avatar { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); font-weight: 800; }
        .userInfo { display: grid; gap: 4px; }
        .userInfo small { color: rgba(255,255,255,.48); font-size: 12px; }
        .onlineDot, .offlineDot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #6b7280; }
        .onlineDot { background: #4ade80; }
        .start { margin-left: auto; color: #c4b5fd; font-weight: 700; font-size: 13px; }
        .message, .empty { color: #fda4af; font-size: 13px; margin: 12px 0 0; }
        .empty { color: rgba(255,255,255,.48); padding: 14px; }
        .sectionTitle { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        h2 { margin: 0; font-size: 18px; }
        .sectionTitle a { color: #a5b4fc; text-decoration: none; font-size: 13px; }
        .emptyCard { margin-top: 18px; padding: 34px 18px; border: 1px dashed rgba(255,255,255,.14); border-radius: 15px; text-align: center; color: rgba(255,255,255,.55); }
        .emptyCard div { font-size: 28px; color: #a78bfa; }
        .emptyCard h3 { color: #fff; margin: 10px 0 6px; font-size: 16px; }
        .emptyCard p { margin: 0; font-size: 13px; }
        .conversationList { display: grid; gap: 9px; margin-top: 18px; }
        .conversation { display: flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; padding: 13px; border-radius: 14px; background: rgba(255,255,255,.05); }
        .conversation:hover { background: rgba(255,255,255,.1); }
        .conversationIcon { font-size: 23px; }
        .conversation span:nth-child(2) { display: grid; gap: 3px; }
        .conversation small { color: rgba(255,255,255,.45); font-size: 12px; }
        .conversation b { margin-left: auto; color: #c4b5fd; }
        @media (max-width: 560px) { .welcome { display: none; } .hero { margin-top: 32px; } .panel, .conversations { padding: 16px; } h1 { letter-spacing: -1.3px; } }
      `}</style>
    </main>
  );
}
