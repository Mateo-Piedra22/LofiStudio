import { auth } from "@/auth"
import { db } from "@/db"
import { settings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({
                theme: "dark",
                pomodoroWork: 25,
                pomodoroBreak: 5,
                preferences: null,
            })
        }
        const userSettings = await db.query.settings.findFirst({
            where: eq(settings.userId, session.user.id),
        })

        if (!userSettings) {
            // Return default settings if none exist
            return NextResponse.json({
                theme: "dark",
                pomodoroWork: 25,
                pomodoroBreak: 5,
                preferences: null,
            })
        }

        return NextResponse.json(userSettings)
    } catch (error) {
        console.error("[SETTINGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ success: true })
        }
        const body = await req.json()
        const { theme, pomodoroWork, pomodoroBreak, preferences } = body

        // Check if settings exist
        const existingSettings = await db.query.settings.findFirst({
            where: eq(settings.userId, session.user.id),
        })

        if (existingSettings) {
            await db
                .update(settings)
                .set({
                    theme,
                    pomodoroWork,
                    pomodoroBreak,
                    preferences: typeof preferences === 'string' ? preferences : JSON.stringify(preferences),
                })
                .where(eq(settings.userId, session.user.id))
        } else {
            await db.insert(settings).values({
                userId: session.user.id,
                theme,
                pomodoroWork,
                pomodoroBreak,
                preferences: typeof preferences === 'string' ? preferences : JSON.stringify(preferences),
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[SETTINGS_POST]", error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
