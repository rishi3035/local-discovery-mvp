'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, MapPin, User } from 'lucide-react'

export default function TipsModerationPage() {
  const [tips, setTips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingTips()
  }, [])

  const fetchPendingTips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tips')
      .select('*, profiles(full_name), places(name)')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true })

    if (data) setTips(data)
    setLoading(false)
  }

  const handleModeration = async (tipId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('tips')
      .update({ moderation_status: status })
      .eq('id', tipId)

    if (!error) {
      setTips(tips.filter(t => t.id !== tipId))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Tips Moderation Queue</h1>
      <p className="mt-2 text-sm text-gray-600">Review and moderate community tips.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">Loading pending tips...</p>
        ) : tips.length === 0 ? (
          <p className="col-span-full text-center py-12 text-gray-500">No pending tips to moderate.</p>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {tip.places?.name}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <User className="mr-1 h-4 w-4" />
                  {tip.profiles?.full_name || 'Anonymous'}
                </div>
                <p className="mt-4 text-gray-900 italic">"{tip.content}"</p>
                {tip.freshness_confirmed && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Freshness Confirmed
                  </span>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleModeration(tip.id, 'approved')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleModeration(tip.id, 'rejected')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
