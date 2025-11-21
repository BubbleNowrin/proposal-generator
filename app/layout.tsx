import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'ProposalCraft - AI-Powered Freelance Proposals',
  description: 'Transform your freelance career with AI-powered proposal generation. Join 25,000+ professionals increasing their project wins by 85%.',
  keywords: 'freelance proposals, AI proposal generator, Upwork proposals, freelance success, proposal writing',
  authors: [{ name: 'ProposalCraft Team' }],
  openGraph: {
    title: 'ProposalCraft - AI-Powered Freelance Proposals',
    description: 'Transform your freelance career with AI-powered proposal generation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProposalCraft - AI-Powered Freelance Proposals',
    description: 'Transform your freelance career with AI-powered proposal generation.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}