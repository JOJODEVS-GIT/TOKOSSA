'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import NewOrderAlert from '@/components/admin/NewOrderAlert'

/**
 * Layout admin TOKOSSA.
 * Wrap SessionProvider pour next-auth (necessaire pour signOut dans le sidebar).
 * Cache la sidebar sur la page login.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-gray-100">{children}</div>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <NewOrderAlert />
        <main className="md:ml-64 p-4 md:p-6 pt-4">{children}</main>
      </div>
    </SessionProvider>
  )
}
