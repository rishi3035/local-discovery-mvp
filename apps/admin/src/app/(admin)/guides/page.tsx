'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, User } from 'lucide-react'

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    setLoading(true)
    let query = supabase
      .from('guides')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error } = await query
    if (data) setGuides(data)
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGuides()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Guides Management</h1>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Places</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : guides.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No guides found.</td>
              </tr>
            ) : (
              guides.map((guide) => (
                <tr key={guide.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{guide.title}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      {guide.profiles?.full_name || 'Unknown'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {guide.tags?.length || 0} tags
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(guide.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {guide.is_editorial ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Editorial
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        User
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
