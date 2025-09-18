import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          src="https://js.supascribe.com/v1/loader/FsksCIU8kNbnB8efDw7y3hLIDU12.js" 
          async
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
