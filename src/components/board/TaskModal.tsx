'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { TaskStatus } from '@prisma/client'
import type { Task } from './KanbanBoard'

type Member = { id: string; name: string; email: string }

type TaskModalProps = {
  task: Task | null
  defaultStatus?: TaskStatus
  members: Member[]
  onCreated: (task: Task) => void
  onUpdated: (task: Task) => void
  onClose: () => void
}

export function TaskModal({
  task,
  defaultStatus = TaskStatus.TODO,
  members,
  onCreated,
  onUpdated,
  onClose,
}: TaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isEdit = task !== null

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTitleError(null)
    setApiError(null)

    const form = e.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim()
    const description =
      (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim() || null
    const assigneeId =
      (form.elements.namedItem('assigneeId') as HTMLSelectElement).value || null

    if (!title) {
      setTitleError('Title is required')
      return
    }

    setLoading(true)

    try {
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, assigneeId }),
        })
      } else {
        res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, assigneeId }),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setApiError(data?.message ?? 'Failed to save task')
        return
      }

      const saved: Task = await res.json()
      if (isEdit) {
        onUpdated(saved)
      } else {
        onCreated(saved)
      }
    } catch {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="w-full max-w-md rounded-lg p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold">{isEdit ? 'Edit Task' : 'New Task'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={task?.title ?? ''}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task?.description ?? ''}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
              Assignee
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              defaultValue={task?.assigneeId ?? ''}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {apiError && <p className="text-sm text-red-600">{apiError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
