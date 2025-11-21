'use server'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/calendar.events'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })

  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const { searchParams } = new URL(req.url)
  const timeMin = searchParams.get('timeMin') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const timeMax = searchParams.get('timeMax') || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString()
  const calendarId = searchParams.get('calendarId') || 'primary'

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })

    const events = (data.items || []).map((e: any) => {
      const startStr = e.start?.dateTime || e.start?.date
      const endStr = e.end?.dateTime || e.end?.date
      const start = startStr ? Date.parse(startStr) : undefined
      const end = endStr ? Date.parse(endStr) : undefined
      return {
        id: e.id,
        summary: e.summary || 'Event',
        description: e.description || undefined,
        start,
        end,
        colorId: e.colorId || undefined,
        location: e.location || undefined,
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/calendar.events'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const summary = body?.summary || 'Event'
  const description = body?.description || undefined
  const startMs = body?.start as number | undefined
  const endMs = body?.end as number | undefined
  const calendarId = body?.calendarId || 'primary'
  const start = startMs ? new Date(startMs).toISOString() : new Date().toISOString()
  const end = endMs ? new Date(endMs).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString()

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, description, start: { dateTime: start }, end: { dateTime: end } })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })
    return NextResponse.json({ event: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/calendar.events'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const id = body?.id
  const calendarId = body?.calendarId || 'primary'
  if (!id) return new NextResponse('Missing id', { status: 400 })
  const updates: any = {}
  if (typeof body?.summary === 'string') updates.summary = body.summary
  if (typeof body?.description === 'string') updates.description = body.description
  if (typeof body?.start === 'number') updates.start = { dateTime: new Date(body.start).toISOString() }
  if (typeof body?.end === 'number') updates.end = { dateTime: new Date(body.end).toISOString() }

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })
    return NextResponse.json({ event: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/calendar.events'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const id = body?.id
  const calendarId = body?.calendarId || 'primary'
  if (!id) return new NextResponse('Missing id', { status: 400 })
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}