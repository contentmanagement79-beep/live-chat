'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Paperclip, Smile, Phone, Video, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ChatPartner = {
  id: string;
  username: string;
  is_online?: boolean;
};

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string>('Me');
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ১. ইউজার ডাটা এবং চ্যাট হিস্ট্রি লোড করা
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        // নিজের ইউজারনেম বের করা
        const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', uid).single();
        if (myProfile) setMyUsername(myProfile.username);

        // পার্টনারের ইনফো বের করা
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', uid);

        if (participants && participants.length > 0) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('id, username, is_online')
            .eq('id', participants[0].user_id)
            .single();
          
          if (partnerProfile) setPartner(partnerProfile);
        }
      }

      // চ্যাট হিস্ট্রি লোড করা
      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(history ?? []);
      setInitialLoading(false);
    };
    init();
  }, [conversationId]);

  // ২. রিয়েল-টাইম সাবস্ক্রিপশন (মেসেজ, টাইপিং এবং অনলাইন স্ট্যাটাস)
  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`room-${conversationId}`);

    // নতুন মেসেজ শোনার জন্য
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      }
    );

    // 🚀 ম্যাজিক: পার্টনারের অনলাইন/অফলাইন স্ট্যাটাস রিয়েল-টাইমে শোনার জন্য
    if (partner?.id) {
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${partner.id}` },
        (payload) => {
          setPartner((prev) => prev ? { ...prev, is_online: payload.new.is_online } : null);
        }
      );
    }

    // টাইপিং সিগন্যাল শোনার জন্য
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2500); // আড়াই সেকেন্ড পর অফ
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, partner?.id]); // partner?.id ডিপেন্ডেন্সিতে রাখলাম যাতে পার্টনার আইডি পেলেই সাবস্ক্রাইব করে

  // স্ক্রল টু বটম
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // টাইপিং সিগন্যাল পাঠানো
  const sendTypingSignal = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, username: myUsername },
    });
  };

  // মেসেজ পাঠানো
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // UI তে সাথে সাথে ক্লিয়ার

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: messageText,
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050f]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative flex flex-col h-[100dvh] bg-[#05050f] text-white font-sans overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      {/* 🟢 Glassmorphism Premium Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:py-4 bg-white/[0.02] backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => router.push('/chat')} // আপনার আগের ড্যাশবোর্ড পেজের লিংক
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/5 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                {partner?.username ? partner.username.charAt(0).toUpperCase() : '?'}
              </div>
              {/* রিয়েল-টাইম অনলাইন ডট */}
              <AnimatePresence>
                {partner?.is_online && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#12121e] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white/95 text-base md:text-lg tracking-tight">
                {partner?.username ? `${partner.username}` : 'Loading...'}
              </span>
              <motion.span 
                key={partner?.is_online ? 'online' : 'offline'}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`text-xs font-medium ${partner?.is_online ? 'text-green-400' : 'text-white/40'}`}
              >
                {partner?.is_online ? 'Active now' : 'Offline'}
              </motion.span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-white/50">
          <button className="p-2 hover:bg-white/10 hover:text-indigo-400 rounded-xl transition-all hidden sm:block"><Phone className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-white/10 hover:text-indigo-400 rounded-xl transition-all hidden sm:block"><Video className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </header>

      {/* 🟢 Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto custom-scrollbar scroll-smooth">
        <div className="flex flex-col gap-5">
          <AnimatePresence>
            {messages.map((msg) => {
              const isMine = msg.sender_id === userId;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  layout
                  className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col gap-1.5 max-w-[80%] md:max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-xl
                        ${isMine 
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-[24px] rounded-br-[6px] shadow-indigo-500/20' 
                          : 'bg-white/[0.05] backdrop-blur-xl border border-white/10 text-white/95 rounded-[24px] rounded-bl-[6px]'
                        }
                      `}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-white/40 font-medium px-2 flex items-center gap-1">
                      {formatTime(msg.created_at)}
                      {isMine && <span className="text-indigo-400/80 text-[10px]">✓</span>}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && partner && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex justify-start"
              >
                <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[24px] rounded-bl-[6px] px-5 py-4 shadow-xl flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* 🟢 Premium Input Bar */}
      <div className="relative z-10 w-full bg-[#05050f]/80 backdrop-blur-2xl border-t border-white/5 p-4 pb-6 md:pb-4">
        <form 
          onSubmit={sendMessage} 
          className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3 bg-white/[0.03] border border-white/10 rounded-[28px] p-1.5 focus-within:bg-white/[0.06] focus-within:border-indigo-500/50 transition-all duration-300 shadow-[0_5px_30px_rgba(0,0,0,0.3)]"
        >
          <button type="button" className="p-3.5 text-white/40 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-all shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              sendTypingSignal();
            }}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/30 text-[15px] focus:outline-none py-3.5 px-2 max-h-32 font-medium"
            autoComplete="off"
          />

          <button type="button" className="p-3.5 text-white/40 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all shrink-0 hidden sm:block">
            <Smile className="w-5 h-5" />
          </button>

          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3.5 m-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-600/30 disabled:to-purple-600/30 disabled:text-white/30 text-white rounded-full transition-all shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:shadow-none hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .aurora-bg {
          position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .aurora-bg::before, .aurora-bg::after {
          content: ''; position: absolute; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(150px); opacity: 0.12; animation: float 25s ease-in-out infinite;
        }
        .aurora-bg::before { background: radial-gradient(circle, rgba(99,102,241,0.8), transparent 70%); top: -20%; left: -10%; }
        .aurora-bg::after { background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 70%); bottom: -20%; right: -10%; animation-delay: -12s; animation-direction: reverse; }
        @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(3%, 5%) scale(1.05); } }
        
        /* Premium Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
      `}</style>
    </main>
  );
}
