import { createClient } from '@/lib/supabase/server'
import { 
  MapPin, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Building2 
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch metrics
  const { count: placesCount } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })

  const { count: guidesCount } = await supabase
    .from('guides')
    .select('*', { count: 'exact', head: true })

  const { count: creatorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'creator')

  const { count: pendingTipsCount } = await supabase
    .from('tips')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')

  const { count: pendingClaimsCount } = await supabase
    .from('business_claims')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const stats = [
    { name: 'Total Places', value: placesCount || 0, icon: MapPin },
    { name: 'Total Guides', value: guidesCount || 0, icon: BookOpen },
    { name: 'Active Creators', value: creatorsCount || 0, icon: Users },
    { name: 'Pending Tips', value: pendingTipsCount || 0, icon: MessageSquare, color: 'text-yellow-600' },
    { name: 'Pending Claims', value: pendingClaimsCount || 0, icon: Building2, color: 'text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color || 'bg-indigo-500'} bg-opacity-10`}>
                <item.icon className={`h-6 w-6 ${item.color || 'text-indigo-600'}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/moderation/tips"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Review Tips
          </a>
          <a
            href="/moderation/claims"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Review Claims
          </a>
          <a
            href="/places"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Manage Places
          </a>
          <a
            href="/guides"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            View Guides
          </a>
        </div>
      </div>
    </div>
  )
}
