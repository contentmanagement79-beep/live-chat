'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, MessageSquare, ArrowRight, UserX } from 'lucide-react';

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
  
  // নতুন লোডিং স্টেটগুলো
  const [isSearching, setIsSearching] = useState(false);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_online')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId ?? '')
        .limit(20);

      setResults(data ?? []);
      setIsSearching(false);
    }, 400); // 400ms debounce for smoother experience

    return () => clearTimeout(timeout);
  }, [query, currentUserId]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;
    setStartingChatId(otherUserId); // লোডিং শুরু

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

    if (error || !newConvo) {
      setStartingChatId(null);
      return;
    }

    await supabase.from('conversation_participants').insert([
      { conversation_id: newConvo.id, user_id: currentUserId },
      { conversation_id: newConvo.id, user_id: otherUserId },
    ]);

    router.push(`/chat/${newConvo.id}`);
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center pt-24 px-4 bg-[#05050f] text-white font-sans overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Find People</h1>
          <p className="text-white/50 text-sm md:text-base">Search by username to start a new conversation instantly.</p>
        </motion.div>

        {/* Search Input Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search username (e.g. alex)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          />
        </motion.div>

        {/* Results List */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {query.trim().length > 0 && results.length === 0 && !isSearching && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-white/40"
              >
                <UserX className="w-12 h-12 mb-4 opacity-50" />
                <p>No users found matching "{query}"</p>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {results.map((user) => (
                  <motion.li key={user.id} variants={itemVariants}>
                    <div className="group flex items-center justify-between p-3 md:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 backdrop-blur-lg transition-all duration-300">
                      
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-inner border border-white/10">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          {/* Online Indicator */}
                          {user.is_online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f0f1a] rounded-full">
                              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-white/90 text-lg group-hover:text-white transition-colors">
                            {user.username}
                          </span>
                          <span className="text-xs text-white/40 font-medium">
                            {user.is_online ? 'Online now' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => startConversation(user.id)}
                        disabled={startingChatId === user.id}
                        className="flex items-center gap-2 bg-white/5 hover:bg-indigo-600 text-white/80 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-transparent hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                      >
                        {startingChatId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Chat</span>
                          </>
                        )}
                      </button>

                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Background Styles */}
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
