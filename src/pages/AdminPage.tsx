import AdminFeatures from '@/components/admin/admin-features'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { ROUTES } from '@/routes'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const { isAdmin, user } = useAdminCheck()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) {
      console.log('Unauthorized access attempt to admin page')
      navigate(ROUTES.HOME)
    }
  }, [isAdmin, navigate])

  return (
    <div className="min-h-screen bg-[#FDFAD1]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-red-200 rounded-lg">
            <div className="p-4">
              <p className="mb-4 text-sm text-gray-400">
                Logged in as: {user?.wallet?.address}
              </p>
              <AdminFeatures />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
