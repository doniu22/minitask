import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { listTasks } from '@/lib/tasks'
import { prisma } from '@/lib/prisma'
import { Role, TaskStatus } from '@prisma/client'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import { BoardErrorBoundary } from '@/components/board/BoardErrorBoundary'
import { MembersPanel } from '@/components/members/MembersPanel'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function BoardPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const [tasks, members] = await Promise.all([
    listTasks(),
    prisma.user.findMany({
      where: { role: Role.MEMBER },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const tasksByStatus = {
    [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
  }

  const isAdmin = session.role === 'ADMIN'

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <h1 className="text-xl font-bold">MiniTask</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="flex flex-1 gap-6 p-6">
        <div className="flex-1">
          <BoardErrorBoundary>
            <KanbanBoard initialTasksByStatus={tasksByStatus} initialMembers={members} />
          </BoardErrorBoundary>
        </div>
        <aside className="w-72 shrink-0">
          <MembersPanel initialMembers={members} isAdmin={isAdmin} />
        </aside>
      </main>
    </div>
  )
}
