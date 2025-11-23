import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { reviews } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const me = params.get("me")

  if (me) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })
    const existing = await db.query.reviews.findFirst({ where: eq(reviews.userId, session.user.id) })
    if (!existing) return NextResponse.json({ review: null })
    const { userName, userImage, rating, comment, createdAt } = existing as any
    return NextResponse.json({ review: { userName, userImage, rating, comment, createdAt } })
  }

  const rows = await db
    .select({ userName: reviews.userName, userImage: reviews.userImage, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt })
    .from(reviews)
    .where(eq(reviews.rating, 4))
    .orderBy(desc(reviews.createdAt))
    .limit(10)

  return NextResponse.json({ reviews: rows })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

  try {
    const body = await req.json()
    let rating = Number(body?.rating)
    const comment = typeof body?.comment === "string" ? body.comment : null
    if (!Number.isInteger(rating)) return new NextResponse("Invalid rating", { status: 400 })
    rating = Math.max(1, Math.min(5, rating))

    const existing = await db.query.reviews.findFirst({ where: eq(reviews.userId, session.user.id) })
    const payload = {
      userId: session.user.id,
      userName: session.user.name || "",
      userImage: session.user.image || null,
      rating,
      comment,
    }

    if (existing) {
      await db.update(reviews).set(payload).where(eq(reviews.userId, session.user.id))
    } else {
      await db.insert(reviews).values(payload)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
