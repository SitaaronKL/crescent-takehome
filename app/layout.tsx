import type { Metadata } from 'next';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crescent take-home',
  description: 'A small fundraising product, in two tracks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
