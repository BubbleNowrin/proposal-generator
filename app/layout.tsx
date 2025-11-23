import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins, Outfit, Space_Grotesk } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'FreelanceHub - Complete Freelancing Platform',
  description: 'AI proposal generator, file upload tools, community platform, and everything freelancers need to succeed. Join 25,000+ professionals.',
  keywords: 'freelance platform, AI proposal generator, freelance community, file upload, Upwork proposals, freelance success',
  authors: [{ name: 'FreelanceHub Team' }],
  openGraph: {
    title: 'FreelanceHub - Complete Freelancing Platform',
    description: 'AI proposal generator, file upload tools, community platform for freelancers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelanceHub - Complete Freelancing Platform',
    description: 'AI proposal generator, file upload tools, community platform for freelancers.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}