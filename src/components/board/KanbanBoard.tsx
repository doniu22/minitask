'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskStatus } from '@prisma/client'
import { toast } from 'sonner'
import { TaskCard } from './TaskCard'
import { TaskColumn } from './TaskColumn'
import { TaskModal } from './TaskModal'

type Member = { id: string; name: string; email: string }
export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  order: number
  assigneeId: string | null
  assignee: Member | null
  createdAt: Date
  updatedAt: Date
}

type KanbanBoardProps = {
  initialTasksByStatus: Record<TaskStatus, Task[]>
  initialMembers: Member[]
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: TaskStatus.TODO, label: 'To Do' },
  { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { status: TaskStatus.DONE, label: 'Done' },
]

export function KanbanBoard({ initialTasksByStatus, initialMembers }: KanbanBoardProps) {
  const [tasksByStatus, setTasksByStatus] =
    useState<Record<TaskStatus, Task[]>>(initialTasksByStatus)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const allTasks = Object.values(tasksByStatus).flat()

  function findTask(id: string): Task | undefined {
    return allTasks.find((t) => t.id === id)
  }

  function handleDragStart(event: DragStartEvent) {
    const task = findTask(event.active.id as string)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = findTask(active.id as string)
    if (!task) return

    const overId = over.id as string
    const targetStatus = (Object.keys(tasksByStatus) as TaskStatus[]).find(
      (status) => status === overId
    ) as TaskStatus | undefined

    const targetColumn = targetStatus ?? (findTask(overId)?.status as TaskStatus | undefined)
    if (!targetColumn) return

    const newStatus = targetColumn
    const columnTasks = tasksByStatus[newStatus].filter((t) => t.id !== task.id)
    const overTask = findTask(overId)
    const targetOrder =
      overTask && overTask.id !== task.id
        ? overTask.order
        : columnTasks.length

    if (task.status === newStatus && task.order === targetOrder) return

    // Optimistic update
    const previousState = { ...tasksByStatus }
    setTasksByStatus((prev) => {
      const fromColumn = prev[task.status].filter((t) => t.id !== task.id)
      const toColumn = prev[newStatus].filter((t) => t.id !== task.id)
      const insertAt = overTask && overTask.id !== task.id ? overTask.order : toColumn.length
      toColumn.splice(insertAt, 0, { ...task, status: newStatus, order: insertAt })
      const reordered = toColumn.map((t, i) => ({ ...t, order: i }))
      return {
        ...prev,
        [task.status]: fromColumn.map((t, i) => ({ ...t, order: i })),
        [newStatus]: reordered,
      }
    })

    try {
      const res = await fetch(`/api/tasks/${task.id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, order: targetOrder }),
      })
      if (!res.ok) throw new Error('Move failed')
    } catch {
      setTasksByStatus(previousState)
      toast.error('Failed to move task')
    }
  }

  function handleTaskCreated(task: Task) {
    setTasksByStatus((prev) => ({
      ...prev,
      [task.status]: [...prev[task.status], task].map((t, i) => ({ ...t, order: i })),
    }))
    setCreateStatus(null)
  }

  function handleTaskUpdated(updated: Task) {
    setTasksByStatus((prev) => ({
      ...prev,
      [updated.status]: prev[updated.status].map((t) => (t.id === updated.id ? updated : t)),
    }))
    setEditTask(null)
  }

  function handleTaskDeleted(id: string, status: TaskStatus) {
    setTasksByStatus((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== id).map((t, i) => ({ ...t, order: i })),
    }))
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4">
          {COLUMNS.map(({ status, label }) => {
            const tasks = tasksByStatus[status]
            return (
              <TaskColumn
                key={status}
                id={status}
                label={label}
                tasks={tasks}
                onAddTask={() => setCreateStatus(status)}
                onEditTask={setEditTask}
                onDeleteTask={(id) => handleTaskDeleted(id, status)}
              />
            )
          })}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {(createStatus !== null || editTask !== null) && (
        <TaskModal
          task={editTask}
          defaultStatus={createStatus ?? undefined}
          members={members}
          onCreated={handleTaskCreated}
          onUpdated={handleTaskUpdated}
          onClose={() => {
            setEditTask(null)
            setCreateStatus(null)
          }}
        />
      )}
    </>
  )
}
