'use client'

import { useState, type FormEvent } from 'react'

type Member = { id: string; name: string; email: string }

type MembersPanelProps = {
  initialMembers: Member[]
  isAdmin: boolean
  onMembersChange?: (members: Member[]) => void
}

export function MembersPanel({ initialMembers, isAdmin, onMembersChange }: MembersPanelProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function updateMembers(updated: Member[]) {
    setMembers(updated)
    onMembersChange?.(updated)
  }

  async function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddError(null)
    setAddLoading(true)

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (res.status === 409) {
        setAddError('A member with this email already exists')
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setAddError(data?.message ?? 'Failed to add member')
        return
      }

      const newMember: Member = await res.json()
      updateMembers([...members, newMember])
      form.reset()
    } catch {
      setAddError('Network error. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        updateMembers(members.filter((m) => m.id !== id))
      }
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Team Members</h2>

      <ul className="mb-4 space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between rounded border p-2">
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            {isAdmin && (
              <div>
                {confirmDeleteId === member.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(member.id)}
                    className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    aria-label={`Remove ${member.name}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-gray-400">No team members yet.</p>
        )}
      </ul>

      {isAdmin && (
        <form onSubmit={handleAddMember} className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">Add Member</h3>
          <input
            name="name"
            type="text"
            placeholder="Name"
            required
            className="block w-full rounded border px-2 py-1 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="block w-full rounded border px-2 py-1 text-sm"
          />
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={addLoading}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {addLoading ? 'Adding…' : 'Add Member'}
          </button>
        </form>
      )}
    </div>
  )
}
