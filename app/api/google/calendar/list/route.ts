'use server'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/calendar.readonly'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers: { Authorization: `Bearer ${accessToken}` } })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })
    const calendars = (data.items || []).map((c: any) => ({ id: c.id, summary: c.summary, primary: !!c.primary }))
    return NextResponse.json({ calendars })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 })
  }
}
