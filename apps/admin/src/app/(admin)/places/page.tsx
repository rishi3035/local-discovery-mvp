'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Edit2, CheckCircle, XCircle } from 'lucide-react'

export default function PlacesPage() {
  const [places, setPlaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPlace, setEditingPlace] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    let query = supabase
      .from('places')
      .select('*, categories(name)')
      .order('name')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query
    if (data) setPlaces(data)
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlaces()
  }

  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlace) return

    const { error } = await supabase
      .from('places')
      .update({
        name: editingPlace.name,
        description: editingPlace.description,
        address: editingPlace.address,
        is_claimed: editingPlace.is_claimed
      })
      .eq('id', editingPlace.id)

    if (!error) {
      setEditingPlace(null)
      fetchPlaces()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Places Management</h1>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search places..."
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : places.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No places found.</td>
              </tr>
            ) : (
              places.map((place) => (
                <tr key={place.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{place.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{place.categories?.name}</td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{place.address}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {place.is_claimed ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Claimed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Unclaimed
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingPlace(place)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Edit Place</h2>
            <form onSubmit={handleUpdatePlace} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={editingPlace.name}
                  onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={editingPlace.description || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={editingPlace.address || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, address: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="is_claimed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={editingPlace.is_claimed}
                  onChange={(e) => setEditingPlace({ ...editingPlace, is_claimed: e.target.checked })}
                />
                <label htmlFor="is_claimed" className="ml-2 block text-sm text-gray-900">
                  Mark as Claimed
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
