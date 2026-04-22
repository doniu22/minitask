import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@prisma/client'
import type { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from './schemas/task'

const taskWithAssignee = {
  id: true,
  title: true,
  description: true,
  status: true,
  order: true,
  assigneeId: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true, email: true } },
} as const

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task not found: ${id}`)
    this.name = 'TaskNotFoundError'
  }
}

export async function listTasks() {
  return prisma.task.findMany({
    select: taskWithAssignee,
    orderBy: [{ status: 'asc' }, { order: 'asc' }],
  })
}

export async function getTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, select: taskWithAssignee })
  if (!task) throw new TaskNotFoundError(id)
  return task
}

export async function createTask(input: CreateTaskInput) {
  const maxOrderResult = await prisma.task.aggregate({
    _max: { order: true },
    where: { status: TaskStatus.TODO },
  })
  const nextOrder = (maxOrderResult._max.order ?? -1) + 1

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      assigneeId: input.assigneeId ?? null,
      status: TaskStatus.TODO,
      order: nextOrder,
    },
    select: taskWithAssignee,
  })
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new TaskNotFoundError(id)

  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
    },
    select: taskWithAssignee,
  })
}

export async function deleteTask(id: string) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new TaskNotFoundError(id)
  await prisma.task.delete({ where: { id } })
}

export async function moveTask(id: string, input: MoveTaskInput) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new TaskNotFoundError(id)

  const { status, order: targetOrder } = input

  await prisma.$transaction(async (tx) => {
    if (task.status === status) {
      // Moving within the same column
      if (task.order < targetOrder) {
        // Moving down: shift tasks in between up by 1
        await tx.task.updateMany({
          where: {
            status,
            order: { gt: task.order, lte: targetOrder },
            id: { not: id },
          },
          data: { order: { decrement: 1 } },
        })
      } else if (task.order > targetOrder) {
        // Moving up: shift tasks in between down by 1
        await tx.task.updateMany({
          where: {
            status,
            order: { gte: targetOrder, lt: task.order },
            id: { not: id },
          },
          data: { order: { increment: 1 } },
        })
      }
    } else {
      // Moving to a different column: shift source column up, shift target column down
      await tx.task.updateMany({
        where: { status: task.status, order: { gt: task.order } },
        data: { order: { decrement: 1 } },
      })
      await tx.task.updateMany({
        where: { status, order: { gte: targetOrder }, id: { not: id } },
        data: { order: { increment: 1 } },
      })
    }

    await tx.task.update({ where: { id }, data: { status, order: targetOrder } })
  })

  return getTask(id)
}
