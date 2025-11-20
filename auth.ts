import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...(process.env.DATABASE_URL ? { adapter: DrizzleAdapter(db) } : { session: { strategy: 'jwt' as const } }),
    providers: [
        Google({
            authorization: {
                params: {
                    scope: 'openid email profile'
                }
            }
        }),
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
        async jwt({ token, account }) {
            if (account) {
                (token as any).scope = (account as any).scope
                ;(token as any).access_token = (account as any).access_token
                ;(token as any).refresh_token = (account as any).refresh_token
            }
            return token
        },
        async session({ session, token, user }) {
            const enhanced: any = { ...session }
            if ((token as any)?.scope) enhanced.scope = (token as any).scope
            if ((token as any)?.access_token) enhanced.accessToken = (token as any).access_token
            if (process.env.DATABASE_URL && user?.id && !enhanced.scope) {
                try {
                    const acc = await (db as any).query.accounts.findFirst({ where: eq(accounts.userId, user.id) })
                    if (acc?.scope) enhanced.scope = acc.scope
                } catch {}
            }
            return enhanced
        },
    },
    pages: {
        signIn: "/",
    }
})
