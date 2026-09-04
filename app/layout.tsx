import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // নিশ্চিত করুন যে এই ফাইলটি আছে এবং এতে Tailwind ইমপোর্ট করা আছে

// প্রফেশনাল এবং ক্লিন লুকের জন্য Inter ফন্ট ব্যবহার করা হলো
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NovaChat | Real-time Futuristic Conversations',
  description: 'Experience seamless, zero-delay messaging with NovaChat. A futuristic real-time chat platform built for instant connections.',
  keywords: ['chat', 'real-time', 'messaging', 'supabase', 'nextjs', 'novachat'],
  openGraph: {
    title: 'NovaChat | Real-time Conversations',
    description: 'A futuristic real-time chat platform. Connect instantly.',
    type: 'website',
    siteName: 'NovaChat',
  },
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
        {children}
      </body>
    </html>
  );
}
