import { auth } from "@/auth"
import { db } from "@/db"
import { feedback } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()

    try {
        const body = await req.json()
        const { rating, message } = body

        if (!rating || !message) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        await db.insert(feedback).values({
            userId: session?.user?.id || null, // Allow anonymous feedback if needed, or link to user
            rating,
            message,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[FEEDBACK_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
