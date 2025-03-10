'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { UserProvider } from '@/context/UserContext'
import { EngineProvider } from '@/context/EngineContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <UserProvider>
          <EngineProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                <div className="border-t">
                  <div className="bg-background">
                    <div className="flex">
                      <Sidebar
                        isCollapsed={isCollapsed}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                      />
                      <main className="flex-1 p-8">{children}</main>
                    </div>
                  </div>
                </div>
              </div>
              <Toaster position="bottom-center" />
            </div>
          </EngineProvider>
        </UserProvider>
      </body>
    </html>
  )
}
