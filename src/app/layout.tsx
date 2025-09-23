// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '../components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Seattle Anti-Freeze - Meet people IRL',
  description: 'Join Seattle\'s premier social events platform. Meet like-minded people, attend curated events, and build genuine friendships.',
  openGraph: {
    title: 'Seattle Anti-Freeze - Meet people IRL',
    description: 'Join Seattle\'s premier social events platform. Meet like-minded people, attend curated events, and build genuine friendships.',
    url: 'https://seattle-anti-freeze.com',
    siteName: 'Seattle Anti-Freeze',
    images: [
      {
        url: 'https://seattle-anti-freeze.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Seattle Anti-Freeze - Bringing people together IRL',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seattle Anti-Freeze - Bringing people together IRL',
    description: 'Join Seattle\'s premier social events platform. Meet like-minded people and build genuine friendships.',
    images: ['https://seattle-anti-freeze.vercel.app/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}