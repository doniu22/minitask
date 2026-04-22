'use client'

import { TaskStatus } from '@prisma/client'

type Member = { id: string; name: string; email: string }
type Task = {
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

const COLUMN_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
}

export function KanbanBoard({ initialTasksByStatus, initialMembers }: KanbanBoardProps) {
  // Full implementation in TASK-013
  return (
    <div className="flex gap-4">
      {([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as TaskStatus[]).map((status) => (
        <div key={status} className="flex-1 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">{COLUMN_LABELS[status]}</h2>
          <div className="space-y-2">
            {initialTasksByStatus[status].map((task) => (
              <div key={task.id} className="rounded border bg-white p-3 shadow-sm">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">
                  {task.assignee?.name ?? 'Unassigned'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
