// app/chat/[conversationId]/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(history ?? []);
    };
    init();
  }, [conversationId]);

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
          setTypingUser(payload.username);
          setTimeout(() => setTypingUser(null), 2000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTypingSignal = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, username: 'Someone' },
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="wrap">
      <div className="messages">
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`row ${isMine ? 'mine' : ''}`}>
              <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {typingUser && <p className="typing">{typingUser} is typing...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="input-bar">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            sendTypingSignal();
          }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #05050f;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 16px;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
        }
        .row {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 12px;
        }
        .row.mine {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 260px;
          padding: 10px 16px;
          border-radius: 18px;
          font-size: 14px;
          word-break: break-word;
          color: #fff;
        }
        .bubble-mine {
          background: #6366f1;
          border-bottom-right-radius: 4px;
        }
        .bubble-theirs {
          background: rgba(255,255,255,0.1);
          border-bottom-left-radius: 4px;
        }
        .typing {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-style: italic;
        }
        .input-bar {
          display: flex;
          gap: 8px;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        input {
          flex: 1;
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
          padding: 12px 24px;
          border-radius: 12px;
          background: #6366f1;
          border: none;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover { background: #818cf8; }
      `}</style>
    </div>
  );
}
