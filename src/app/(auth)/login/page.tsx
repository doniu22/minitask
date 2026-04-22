import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const session = await getSession()
  if (session.userId) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">MiniTask</h1>
        <LoginForm />
      </div>
    </div>
  )
}
