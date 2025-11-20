import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { image } = body

        if (!image) {
            return new NextResponse("Missing image URL", { status: 400 })
        }

        await db.update(users)
            .set({ image })
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[PROFILE_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
