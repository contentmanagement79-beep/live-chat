'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Paperclip, Smile, Phone, Video } from 'lucide-react';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ChatPartner = {
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

        // যার সাথে চ্যাট হচ্ছে তার ইনফো বের করা
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', uid);

        if (participants && participants.length > 0) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('username, is_online')
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
    };
    init();
  }, [conversationId]);

  // ২. রিয়েল-টাইম সাবস্ক্রিপশন
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setIsTyping(true);
          // ২ সেকেন্ড পর টাইপিং অফ করে দেওয়া
          setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

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
    setNewMessage(''); // UI তে সাথে সাথে ক্লিয়ার করার জন্য

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: messageText,
    });
  };

  // সময় ফরম্যাট করার ফাংশন
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="relative flex flex-col h-screen bg-[#05050f] text-white font-sans overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="aurora-bg" />

      {/* 🟢 Glassmorphism Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/chat')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm border border-white/10 shadow-inner">
                {partner?.username ? partner.username.charAt(0).toUpperCase() : '?'}
              </div>
              {partner?.is_online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#05050f] rounded-full"></span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white/90 text-sm md:text-base">
                {partner?.username ? `@${partner.username}` : 'Loading...'}
              </span>
              <span className="text-xs text-white/40">
                {partner?.is_online ? 'Active now' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/50">
          <button className="p-2 hover:bg-white/5 hover:text-indigo-400 rounded-full transition-colors hidden sm:block"><Phone className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-white/5 hover:text-indigo-400 rounded-full transition-colors hidden sm:block"><Video className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-white/5 hover:text-white rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </header>

      {/* 🟢 Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto custom-scrollbar">
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {messages.map((msg) => {
              const isMine = msg.sender_id === userId;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col gap-1 max-w-[75%] md:max-w-[60%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`px-4 py-3 text-[15px] shadow-lg
                        ${isMine 
                          ? 'bg-indigo-600 text-white rounded-[20px] rounded-br-[4px]' 
                          : 'bg-white/10 backdrop-blur-md border border-white/5 text-white/90 rounded-[20px] rounded-bl-[4px]'
                        }
                      `}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-white/40 font-medium px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && partner && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[20px] rounded-bl-[4px] px-4 py-3 shadow-lg flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* 🟢 Input Bar */}
      <div className="relative z-10 w-full bg-white/[0.02] backdrop-blur-2xl border-t border-white/10 p-4">
        <form 
          onSubmit={sendMessage} 
          className="max-w-4xl mx-auto flex items-end gap-2 bg-black/20 border border-white/10 rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all duration-300"
        >
          <button type="button" className="p-3 text-white/40 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-all shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              sendTypingSignal();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/30 text-[15px] focus:outline-none py-3 px-2 max-h-32"
            autoComplete="off"
          />

          <button type="button" className="p-3 text-white/40 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all shrink-0 hidden sm:block">
            <Smile className="w-5 h-5" />
          </button>

          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 m-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:text-white/30 text-white rounded-full transition-all shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Global Styles */}
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
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15; /* চ্যাট পেজে ব্যাকগ্রাউন্ড এনিমেশন একটু হালকা রাখাই ভালো */
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
        /* Custom Scrollbar for Chat */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  );
}
