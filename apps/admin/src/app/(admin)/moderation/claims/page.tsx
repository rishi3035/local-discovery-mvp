'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Building2, User, FileText } from 'lucide-react'

export default function BusinessClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingClaims()
  }, [])

  const fetchPendingClaims = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('business_claims')
      .select('*, profiles(full_name), places(name, id)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (data) setClaims(data)
    setLoading(false)
  }

  const handleModeration = async (claim: any, status: 'verified' | 'rejected') => {
    // 1. Update claim status
    const { error: claimError } = await supabase
      .from('business_claims')
      .update({ status })
      .eq('id', claim.id)

    if (claimError) return

    // 2. If verified, update place.is_claimed
    if (status === 'verified') {
      await supabase
        .from('places')
        .update({ is_claimed: true })
        .eq('id', claim.place_id)
    }

    setClaims(claims.filter(c => c.id !== claim.id))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Business Claims Moderation</h1>
      <p className="mt-2 text-sm text-gray-600">Review business ownership claims.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">Loading pending claims...</p>
        ) : claims.length === 0 ? (
          <p className="col-span-full text-center py-12 text-gray-500">No pending claims to moderate.</p>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Building2 className="mr-1 h-4 w-4" />
                  {claim.places?.name}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <User className="mr-1 h-4 w-4" />
                  Claimed by: {claim.profiles?.full_name || 'Unknown'}
                </div>
                
                <div className="mt-4 rounded-md bg-gray-50 p-3">
                  <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <FileText className="mr-1 h-3 w-3" />
                    Verification Details
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {JSON.stringify(claim.verification_details, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleModeration(claim, 'verified')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleModeration(claim, 'rejected')}
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
