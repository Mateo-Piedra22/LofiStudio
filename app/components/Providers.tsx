'use client'

import { useEffect } from 'react'
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from './ThemeProvider'
import { StoreHydration } from './StoreHydration'

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => { })
        }
    }, [])
    return (
        <SessionProvider>
            <ThemeProvider>
                <StoreHydration>
                    {children}
                </StoreHydration>
            </ThemeProvider>
        </SessionProvider>
    )
}
