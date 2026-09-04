'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LogOut, MessageSquare, Clock, ArrowRight, UserX, Loader2, Sparkles } from 'lucide-react';

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
  
  // নতুন লোডিং স্টেট
  const [isSearching, setIsSearching] = useState(false);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

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
    if (!search.trim() || !currentUserId) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, is_online')
        .ilike('username', `%${search.trim()}%`)
        .neq('id', currentUserId)
        .limit(10);

      setResults(data ?? []);
      setIsSearching(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search, currentUserId]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;
    setMessage('');
    setStartingChatId(otherUserId);

    const { data: myRows, error: myRowsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (myRowsError) {
      setMessage('Could not load conversations. Please try again.');
      setStartingChatId(null);
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
      setStartingChatId(null);
      return;
    }

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: currentUserId },
        { conversation_id: conversation.id, user_id: otherUserId },
      ]);

    if (participantError) {
      setMessage('Chat was created but participants could not be added.');
      setStartingChatId(null);
      return;
    }

    router.push(`/chat/${conversation.id}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050f] text-indigo-200">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="text-sm font-medium tracking-widest uppercase"
        >
          Loading NovaChat
        </motion.p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pb-16 bg-[#05050f] text-white font-sans overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          <span>Nova<span className="text-indigo-400">Chat</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-white/60 font-medium">
            Hi, <span className="text-white">@{username}</span>
          </span>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-red-400 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Log out</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mt-12 mb-10 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            You are online
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Your messages.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-lg">
              Your universe.
            </span>
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Search a username below to start a live conversation instantly.
          </p>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-8">
        
        {/* Search Panel */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl"
        >
          <label htmlFor="user-search" className="block text-sm font-semibold text-indigo-200 mb-3 ml-1">
            Find someone
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
              )}
            </div>
            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
            />
          </div>

          {message && <p className="text-red-400 text-sm mt-3 ml-1">{message}</p>}

          <AnimatePresence>
            {search && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden border border-white/10 rounded-2xl bg-black/10"
              >
                {results.length > 0 ? (
                  <ul className="divide-y divide-white/5">
                    {results.map((user) => (
                      <li key={user.id}>
                        <button 
                          onClick={() => startConversation(user.id)}
                          disabled={startingChatId === user.id}
                          className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-inner border border-white/10 shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white/90 group-hover:text-white">{user.username}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                              {user.is_online ? 'Online' : 'Offline'}
                            </div>
                          </div>
                          {startingChatId === user.id ? (
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-indigo-400/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isSearching && (
                    <div className="p-8 text-center text-white/40 flex flex-col items-center">
                      <UserX className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No user found with this username.</p>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Conversations List */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Your Conversations
            </h2>
          </div>

          {conversations.length === 0 ? (
            <div className="py-12 px-6 border border-dashed border-white/10 rounded-2xl text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-white/90 font-semibold mb-1">No conversations yet</h3>
              <p className="text-white/40 text-sm">Find someone by username and send the first message.</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3">
              {conversations.map((conversation) => (
                <motion.div key={conversation.id} variants={itemVariants}>
                  <Link 
                    href={`/chat/${conversation.id}`} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white/90 group-hover:text-white">Open Conversation</h4>
                      <p className="text-xs text-white/40 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" />
                        Started {new Date(conversation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

      </div>

      {/* Global Aurora Background */}
      <style jsx>{`
        .aurora-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .aurora-bg::before,
        .aurora-bg::after {
          content: '';
          position: absolute;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.25;
          animation: float 20s ease-in-out infinite;
        }
        .aurora-bg::before {
          background: radial-gradient(circle, rgba(99,102,241,0.8), transparent 70%);
          top: -20%;
          left: -10%;
        }
        .aurora-bg::after {
          background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 70%);
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
      `}</style>
    </main>
  );
}
