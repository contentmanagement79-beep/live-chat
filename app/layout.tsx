import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PresenceTracker from '@/components/PresenceTracker'; // 👈 এটি ইম্পোর্ট করুন

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NovaChat | Real-time Futuristic Conversations',
  description: 'Experience seamless, zero-delay messaging with NovaChat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`
          ${inter.className} 
          bg-[#05050f] 
          text-white 
          antialiased 
          selection:bg-indigo-500/30 
          selection:text-indigo-200 
          min-h-screen 
          overflow-x-hidden
        `}
      >
        {/* 👈 এই কম্পোনেন্টটি ব্যাকগ্রাউন্ডে অনলাইন স্ট্যাটাস ট্র্যাক করবে */}
        <PresenceTracker /> 
        
        {children}
      </body>
    </html>
  );
}
