import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { listTasks, createTask } from '@/lib/tasks'
import { CreateTaskSchema } from '@/lib/schemas/task'
import { validationError } from '@/lib/errors'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async () => {
    const tasks = await listTasks()
    return NextResponse.json(tasks)
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async () => {
    const body = await request.json().catch(() => null)

    const parsed = CreateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const task = await createTask(parsed.data)
    return NextResponse.json(task, { status: 201 })
  })
}
