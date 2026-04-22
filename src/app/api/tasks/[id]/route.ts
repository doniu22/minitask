import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getTask, updateTask, deleteTask, TaskNotFoundError } from '@/lib/tasks'
import { UpdateTaskSchema } from '@/lib/schemas/task'
import { notFound, validationError } from '@/lib/errors'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params
    try {
      const task = await getTask(id)
      return NextResponse.json(task)
    } catch (e) {
      if (e instanceof TaskNotFoundError) return notFound('Task')
      throw e
    }
  })
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params
    const body = await request.json().catch(() => null)

    const parsed = UpdateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    try {
      const task = await updateTask(id, parsed.data)
      return NextResponse.json(task)
    } catch (e) {
      if (e instanceof TaskNotFoundError) return notFound('Task')
      throw e
    }
  })
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params
    try {
      await deleteTask(id)
      return new NextResponse(null, { status: 204 })
    } catch (e) {
      if (e instanceof TaskNotFoundError) return notFound('Task')
      throw e
    }
  })
}
