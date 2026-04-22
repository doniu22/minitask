'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from './KanbanBoard'
import { SortableTaskCard } from './SortableTaskCard'

type TaskColumnProps = {
  id: string
  label: string
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function TaskColumn({
  id,
  label,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-1 flex-col rounded-lg bg-gray-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">
          {label}
          <span className="ml-2 text-sm font-normal text-gray-400">({tasks.length})</span>
        </h2>
        <button
          onClick={onAddTask}
          className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          title="Add task"
          aria-label={`Add task to ${label}`}
        >
          +
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`min-h-24 flex-1 space-y-2 rounded transition-colors ${isOver ? 'bg-blue-50' : ''}`}
        >
          {tasks
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
        </div>
      </SortableContext>
    </div>
  )
}
