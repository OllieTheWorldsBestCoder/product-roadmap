import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Product Roadmap | Kernel',
  description: 'See what we are building',
  icons: {
    icon: '/favicon.svg',
  },
};

async function AuthWrapper({ children }: { children: React.ReactNode }) {
  if (process.env.DEV_BYPASS_AUTH) {
    return <>{children}</>;
  }

  const { AuthKitProvider } = await import('@workos-inc/authkit-nextjs/components');
  return <AuthKitProvider>{children}</AuthKitProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-bg font-sans antialiased`}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
