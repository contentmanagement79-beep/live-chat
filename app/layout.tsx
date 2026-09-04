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
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#05050f',
          color: '#ffffff',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          overflowX: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  );
}
