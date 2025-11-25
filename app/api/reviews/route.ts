import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { reviews } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

const memKey = "__lofi_mem_reviews"
function getMem(): any[] {
  const g: any = globalThis as any
  if (!g[memKey]) g[memKey] = []
  return g[memKey] as any[]
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const me = params.get("me")

  if (me) {
    const session = await auth()
    const uid = session?.user?.id
    if (!uid) return new NextResponse("Unauthorized", { status: 401 })
    if (process.env.DATABASE_URL) {
      const existing = await db.query.reviews.findFirst({ where: eq(reviews.userId, uid) })
      if (!existing) return NextResponse.json({ review: null })
      const { userName, userImage, rating, comment, createdAt } = existing as any
      return NextResponse.json({ review: { userName, userImage, rating, comment, createdAt } })
    } else {
      const mem = getMem()
      const found = mem.find((r) => r.userId === uid)
      if (!found) return NextResponse.json({ review: null })
      const { userName, userImage, rating, comment, createdAt } = found
      return NextResponse.json({ review: { userName, userImage, rating, comment, createdAt } })
    }
  }

  const sortParam = (params.get('sort') || '').toLowerCase()
  const limitStr = params.get('limit')
  const limitNum = limitStr ? parseInt(limitStr, 10) : undefined
  const doLimit = typeof limitNum === 'number' && isFinite(limitNum) && limitNum > 0

  if (process.env.DATABASE_URL) {
    const base = db
      .select({ userName: reviews.userName, userImage: reviews.userImage, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt })
      .from(reviews)
    const ordered = (sortParam === 'date' || sortParam === 'createdat')
      ? base.orderBy(desc(reviews.createdAt))
      : base.orderBy(desc(reviews.rating), desc(reviews.createdAt))
    const rows = await (doLimit ? ordered.limit(limitNum as number) : ordered)
    return NextResponse.json({ reviews: rows })
  } else {
    const mem = getMem()
    const base = mem.slice()
    const sorted = (sortParam === 'date' || sortParam === 'createdat')
      ? base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : base.sort((a, b) => {
          const byRating = Number(b.rating) - Number(a.rating)
          if (byRating !== 0) return byRating
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    const limited = doLimit ? sorted.slice(0, limitNum as number) : sorted
    const rows = limited.map((r) => ({ userName: r.userName, userImage: r.userImage, rating: r.rating, comment: r.comment, createdAt: r.createdAt }))
    return NextResponse.json({ reviews: rows })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  const uid = session?.user?.id
  if (!uid) return new NextResponse("Unauthorized", { status: 401 })

  try {
    const body = await req.json()
    let rating = Number(body?.rating)
    const comment = typeof body?.comment === "string" ? body.comment : null
    if (!Number.isInteger(rating)) return new NextResponse("Invalid rating", { status: 400 })
    rating = Math.max(1, Math.min(5, rating))
    const userName = typeof session?.user?.name === 'string' ? session.user.name : ''
    const userImage = typeof session?.user?.image === 'string' ? session.user.image : null
    const payload = {
      userId: uid,
      userName,
      userImage,
      rating,
      comment,
      createdAt: new Date(),
    }
    if (process.env.DATABASE_URL) {
      const existing = await db.query.reviews.findFirst({ where: eq(reviews.userId, uid) })
      if (existing) {
        await db.update(reviews).set(payload).where(eq(reviews.userId, uid))
      } else {
        await db.insert(reviews).values(payload)
      }
      return NextResponse.json({ success: true })
    } else {
      const mem = getMem()
      const idx = mem.findIndex((r) => r.userId === uid)
      if (idx >= 0) mem[idx] = payload
      else mem.push(payload)
      return NextResponse.json({ success: true })
    }
  } catch (e) {
    const msg = (e as any)?.message || "Internal Error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
