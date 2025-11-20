'use client'

import { useEffect } from 'react'
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from './ThemeProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {})
        }
    }, [])
    return (
        <SessionProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
