import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { TaskStatus, Role } from '@prisma/client'
import { getTestPrisma, cleanDatabase } from '../helpers/db'
import { createTask, moveTask, listTasks, TaskNotFoundError } from '@/lib/tasks'

beforeAll(async () => {
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/minitask_dev'
})

afterEach(async () => {
  await cleanDatabase()
})

describe('createTask', () => {
  // AC: appends task at end of TODO column (order = max + 1)
  it('should set order=0 for first task in TODO', async () => {
    const task = await createTask({ title: 'First' })
    expect(task.order).toBe(0)
    expect(task.status).toBe(TaskStatus.TODO)
  })

  it('should append at end of TODO column (order = max + 1)', async () => {
    await createTask({ title: 'Task A' })
    await createTask({ title: 'Task B' })
    const task = await createTask({ title: 'Task C' })
    expect(task.order).toBe(2)
  })
})

describe('moveTask', () => {
  // AC: moveTask recalculates order within target column
  it('should move to a different empty column with order 0', async () => {
    const task = await createTask({ title: 'Move me' })
    const moved = await moveTask(task.id, { status: 'IN_PROGRESS', order: 0 })
    expect(moved.status).toBe(TaskStatus.IN_PROGRESS)
    expect(moved.order).toBe(0)
  })

  it('should shift existing tasks when moving to a non-empty column', async () => {
    const prisma = getTestPrisma()
    // Manually create tasks in IN_PROGRESS
    await prisma.task.createMany({
      data: [
        { title: 'IP-A', status: TaskStatus.IN_PROGRESS, order: 0 },
        { title: 'IP-B', status: TaskStatus.IN_PROGRESS, order: 1 },
      ],
    })
    const newTask = await createTask({ title: 'New Task' })

    await moveTask(newTask.id, { status: 'IN_PROGRESS', order: 1 })

    const tasks = await listTasks()
    const ipTasks = tasks
      .filter((t) => t.status === TaskStatus.IN_PROGRESS)
      .sort((a, b) => a.order - b.order)

    expect(ipTasks.map((t) => t.title)).toEqual(['IP-A', 'New Task', 'IP-B'])
    expect(ipTasks.map((t) => t.order)).toEqual([0, 1, 2])
  })

  it('should move down within the same column', async () => {
    const prisma = getTestPrisma()
    await prisma.task.createMany({
      data: [
        { title: 'T0', status: TaskStatus.TODO, order: 0 },
        { title: 'T1', status: TaskStatus.TODO, order: 1 },
        { title: 'T2', status: TaskStatus.TODO, order: 2 },
      ],
    })
    const allTasks = await listTasks()
    const t0 = allTasks.find((t) => t.title === 'T0')!

    await moveTask(t0.id, { status: 'TODO', order: 2 })

    const updated = await listTasks()
    const todoTasks = updated
      .filter((t) => t.status === TaskStatus.TODO)
      .sort((a, b) => a.order - b.order)
    expect(todoTasks.map((t) => t.title)).toEqual(['T1', 'T2', 'T0'])
  })

  it('should move up within the same column', async () => {
    const prisma = getTestPrisma()
    await prisma.task.createMany({
      data: [
        { title: 'T0', status: TaskStatus.TODO, order: 0 },
        { title: 'T1', status: TaskStatus.TODO, order: 1 },
        { title: 'T2', status: TaskStatus.TODO, order: 2 },
      ],
    })
    const allTasks = await listTasks()
    const t2 = allTasks.find((t) => t.title === 'T2')!

    await moveTask(t2.id, { status: 'TODO', order: 0 })

    const updated = await listTasks()
    const todoTasks = updated
      .filter((t) => t.status === TaskStatus.TODO)
      .sort((a, b) => a.order - b.order)
    expect(todoTasks.map((t) => t.title)).toEqual(['T2', 'T0', 'T1'])
  })

  it('should throw TaskNotFoundError for non-existent task', async () => {
    await expect(moveTask('nonexistent-uuid-here', { status: 'TODO', order: 0 })).rejects.toThrow(
      TaskNotFoundError
    )
  })
})
