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
        const { image, name } = body

        if (!image && !name) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const updates: { image?: string; name?: string } = {}
        if (image) updates.image = image
        if (name) updates.name = name

        await db.update(users)
            .set(updates)
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[PROFILE_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
