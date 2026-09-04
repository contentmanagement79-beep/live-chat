// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaChat — Real-time Conversations',
  description: 'A futuristic real-time chat platform. Connect instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <style jsx global>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            scroll-behavior: smooth;
          }
          html,
          body {
            background-color: #05050f;
            color: white;
            font-family: 'Segoe UI', system-ui, sans-serif;
            overflow-x: hidden;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(129, 140, 248, 0.4);
            border-radius: 8px;
          }
        `}</style>
      </body>
    </html>
  );
}
