// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import AuthProvider from '../components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://seattle-anti-freeze.com'),
  title: {
    default: 'Seattle Anti-Freeze - Meet people IRL',
    template: '%s | Seattle Anti-Freeze'
  },
  description: 'Join Seattle\'s premier social events platform. Meet like-minded people, attend curated events, and build genuine friendships in the Seattle area.',
  keywords: [
    'Seattle events',
    'meet people Seattle',
    'social events Seattle',
    'Seattle meetups',
    'things to do Seattle',
    'Seattle social groups',
    'IRL events Seattle',
    'Seattle gatherings',
    'make friends Seattle',
    'Seattle nightlife',
    'Capitol Hill events',
    'Fremont events',
    'Ballard events',
    'Seattle community',
    'Seattle social scene'
  ],
  authors: [{ name: 'Seattle Anti-Freeze' }],
  creator: 'Seattle Anti-Freeze',
  publisher: 'Seattle Anti-Freeze',
  
  openGraph: {
    title: 'Seattle Anti-Freeze - Meet people IRL',
    description: 'Join Seattle\'s premier social events platform. Meet like-minded people, attend curated events, and build genuine friendships.',
    url: 'https://seattle-anti-freeze.com',
    siteName: 'Seattle Anti-Freeze',
    images: [
      {
        url: '/og-image.jpg', // Uses metadataBase, so becomes https://seattle-anti-freeze.com/og-image.jpg
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
    title: 'Seattle Anti-Freeze - Meet people IRL',
    description: 'Join Seattle\'s premier social events platform. Meet like-minded people and build genuine friendships.',
    images: ['/og-image.jpg'], // Uses metadataBase
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // If you want to add other verification codes later (Bing, etc.)
  // verification: {
  //   google: 'your-verification-code',
  //   yandex: 'your-verification-code',
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* LocalBusiness Structured Data for Seattle SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Seattle Anti-Freeze",
              "alternateName": "SAF Events",
              "url": "https://seattle-anti-freeze.com",
              "logo": "https://seattle-anti-freeze.com/logo.png",
              "description": "Seattle's premier community for in-person social events. We bring people together through authentic gatherings and memorable experiences.",
              "areaServed": {
                "@type": "City",
                "name": "Seattle",
                "containedIn": {
                  "@type": "State",
                  "name": "Washington"
                }
              }
              // Add social media links when you have them:
              // "sameAs": [
              //   "https://www.instagram.com/seattleantifreeze",
              //   "https://www.facebook.com/seattleantifreeze"
              // ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}