'use server'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/tasks'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })

  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  try {
    const listsRes = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const listsData = await listsRes.json()
    if (!listsRes.ok) return NextResponse.json({ error: listsData }, { status: listsRes.status })

    const lists = (listsData.items || [])
    const tasks: any[] = []
    for (const list of lists) {
      try {
        const tRes = await fetch(`https://www.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        const tData = await tRes.json()
        if (!tRes.ok) continue
        (tData.items || []).forEach((t: any) => {
          const dueAt = t.due ? Date.parse(t.due) : undefined
          tasks.push({
            id: t.id,
            title: t.title,
            notes: t.notes,
            status: t.status,
            completed: t.status === 'completed',
            dueAt,
            listId: list.id,
            updated: t.updated ? Date.parse(t.updated) : undefined,
          })
        })
      } catch {}
    }
    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/tasks'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const title = body?.title || 'Task'
  const notes = body?.notes || undefined
  const dueAt = body?.dueAt ? new Date(body.dueAt) : undefined
  const chosenListId = body?.listId as string | undefined
  try {
    const listsRes = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const listsData = await listsRes.json()
    if (!listsRes.ok) return NextResponse.json({ error: listsData }, { status: listsRes.status })
    const list = chosenListId ? (listsData.items || []).find((l: any) => l.id === chosenListId) : (listsData.items || [])[0]
    if (!list) return NextResponse.json({ error: 'No task lists' }, { status: 400 })

    const createRes = await fetch(`https://www.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, notes, due: dueAt ? dueAt.toISOString() : undefined })
    })
    const createData = await createRes.json()
    if (!createRes.ok) return NextResponse.json({ error: createData }, { status: createRes.status })
    return NextResponse.json({ task: createData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/tasks'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const id = body?.id
  const chosenListId = body?.listId as string | undefined
  if (!id) return new NextResponse('Missing id', { status: 400 })
  try {
    const listsRes = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const listsData = await listsRes.json()
    if (!listsRes.ok) return NextResponse.json({ error: listsData }, { status: listsRes.status })
    const list = chosenListId ? (listsData.items || []).find((l: any) => l.id === chosenListId) : (listsData.items || [])[0]
    if (!list) return NextResponse.json({ error: 'No task lists' }, { status: 400 })

    const updates: any = {}
    if (typeof body?.title === 'string') updates.title = body.title
    if (typeof body?.notes === 'string') updates.notes = body.notes
    if (typeof body?.completed === 'boolean') updates.status = body.completed ? 'completed' : 'needsAction'
    if (typeof body?.dueAt === 'number') updates.due = new Date(body.dueAt).toISOString()

    const patchRes = await fetch(`https://www.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const patchData = await patchRes.json()
    if (!patchRes.ok) return NextResponse.json({ error: patchData }, { status: patchRes.status })
    return NextResponse.json({ task: patchData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })
  const granted = ((session as any)?.scope as string | undefined)?.split(' ') || []
  const required = 'https://www.googleapis.com/auth/tasks'
  if (!granted.includes(required)) return new NextResponse('Forbidden', { status: 403 })
  const accessToken = (session as any)?.accessToken as string | undefined
  if (!accessToken) return new NextResponse('Missing access token', { status: 401 })

  const body = await req.json()
  const id = body?.id
  const chosenListId = body?.listId as string | undefined
  if (!id) return new NextResponse('Missing id', { status: 400 })
  try {
    const listsRes = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const listsData = await listsRes.json()
    if (!listsRes.ok) return NextResponse.json({ error: listsData }, { status: listsRes.status })
    const list = chosenListId ? (listsData.items || []).find((l: any) => l.id === chosenListId) : (listsData.items || [])[0]
    if (!list) return NextResponse.json({ error: 'No task lists' }, { status: 400 })

    const delRes = await fetch(`https://www.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!delRes.ok) {
      const err = await delRes.text()
      return NextResponse.json({ error: err }, { status: delRes.status })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}