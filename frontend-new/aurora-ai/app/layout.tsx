import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurora AI - Image Enhancement Studio',
  description: 'Professional AI-powered image editing tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
