import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Optimal Logo Particles",
  description: "Animated logo particles for embedding",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, width: "100%", height: "100%" }}>{children}</body>
    </html>
  )
}


import './globals.css'