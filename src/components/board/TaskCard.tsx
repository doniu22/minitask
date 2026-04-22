'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Task } from './KanbanBoard'

type TaskCardProps = {
  task: Task
  isDragging?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (res.ok || res.status === 404) {
        onDelete?.()
        toast.success('Task deleted')
      }
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div
      className={`group rounded-md border bg-white p-3 shadow-sm transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-300' : 'hover:shadow'
      }`}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit?.()}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">{task.title}</p>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {confirmDelete ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-1.5 py-0.5 text-xs text-white hover:bg-red-700"
                title="Confirm delete"
                aria-label="Confirm delete task"
              >
                {deleting ? '…' : 'Delete?'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDelete(false)
                }}
                className="rounded border px-1.5 py-0.5 text-xs hover:bg-gray-50"
                title="Cancel"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="rounded p-0.5 text-gray-400 hover:text-red-600"
              title="Delete task"
              aria-label={`Delete task: ${task.title}`}
            >
              🗑
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">{task.assignee?.name ?? 'Unassigned'}</p>
    </div>
  )
}
