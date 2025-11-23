import { auth } from "@/auth"
import { db } from "@/db"
import { reviews } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await auth()

  try {
    const body = await req.json()
    const { rating, message } = body
    const r = Number(rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return new NextResponse("Invalid rating", { status: 400 })
    }
    const payload = {
      userId: session?.user?.id || '',
      userName: session?.user?.name || '',
      userImage: session?.user?.image || null,
      rating: r,
      comment: typeof message === 'string' ? message : null,
    }
    if (!payload.userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const existing = await db.query.reviews.findFirst({ where: eq(reviews.userId, payload.userId) }).catch(() => null)
    if (existing) {
      await db.update(reviews).set(payload).where(eq(reviews.userId, payload.userId))
    } else {
      await db.insert(reviews).values(payload)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
