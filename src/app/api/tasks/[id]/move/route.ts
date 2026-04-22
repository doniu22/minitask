import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { moveTask, TaskNotFoundError } from '@/lib/tasks'
import { MoveTaskSchema } from '@/lib/schemas/task'
import { notFound, validationError } from '@/lib/errors'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params
    const body = await request.json().catch(() => null)

    const parsed = MoveTaskSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    try {
      const task = await moveTask(id, parsed.data)
      return NextResponse.json(task)
    } catch (e) {
      if (e instanceof TaskNotFoundError) return notFound('Task')
      throw e
    }
  })
}
