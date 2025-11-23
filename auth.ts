import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts } from "@/db/schema"
import { eq } from "drizzle-orm"

const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
if (!hasSecret) {
    console.error("[auth] Missing AUTH_SECRET or NEXTAUTH_SECRET")
    throw new Error("AUTH secret is not configured")
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    trustHost: true,
    ...(process.env.DATABASE_URL ? { adapter: DrizzleAdapter(db) } : {}),
    session: { strategy: 'jwt' },
    debug: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',
            issuer: 'https://accounts.google.com',
            checks: ['pkce', 'state'],
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks',
                    include_granted_scopes: true,
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        }),
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
        async redirect() {
            return '/'
        },
        async jwt({ token, account }) {
            if (account) {
                (token as any).scope = (account as any).scope
                ;(token as any).access_token = (account as any).access_token
                ;(token as any).refresh_token = (account as any).refresh_token
                ;(token as any).expires_at = (account as any).expires_at
            }

            const needsRefresh = !!(token as any)?.access_token && !!(token as any)?.refresh_token && !!(token as any)?.expires_at && (Date.now() / 1000 > (token as any).expires_at - 60)
            if (needsRefresh) {
                try {
                    const params = new URLSearchParams({
                        client_id: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
                        client_secret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',
                        grant_type: 'refresh_token',
                        refresh_token: (token as any).refresh_token || '',
                    })
                    const res = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString(),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh token')
                    ;(token as any).access_token = data.access_token
                    ;(token as any).expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
                } catch (e) {
                    console.error('[auth] failed to refresh token', e)
                }
            }
            return token
        },
        async session({ session, token, user }) {
            const enhanced: any = { ...session }
            if ((token as any)?.scope) enhanced.scope = (token as any).scope
            if ((token as any)?.access_token) enhanced.accessToken = (token as any).access_token
            if ((token as any)?.expires_at) enhanced.accessTokenExpiresAt = (token as any).expires_at
            if ((token as any)?.refresh_token) enhanced.refreshToken = (token as any).refresh_token
            if (process.env.DATABASE_URL && user?.id && !enhanced.scope) {
                try {
                    const acc = await (db as any).query.accounts.findFirst({ where: eq(accounts.userId, user.id) })
                    if (acc?.scope) enhanced.scope = acc.scope
                } catch {}
            }
            return enhanced
        },
    },
    events: {
        async signIn(message) {
            console.info('[auth][event][signIn]', { user: (message as any)?.user?.email || (message as any)?.user?.id, provider: (message as any)?.account?.provider })
        },
    },
    logger: {
        error(code, ...message) {
            console.error('[auth][logger][error]', code, ...message)
        },
        warn(code, ...message) {
            console.warn('[auth][logger][warn]', code, ...message)
        },
        debug(code, ...message) {
            console.debug('[auth][logger][debug]', code, ...message)
        },
    },
    pages: undefined,
})
