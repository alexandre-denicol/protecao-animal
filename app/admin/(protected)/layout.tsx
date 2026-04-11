import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  // Middleware garante autenticação, mas esta checagem double-checks o estado de ativo
  if (!profile) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-shell flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar profile={profile} />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
