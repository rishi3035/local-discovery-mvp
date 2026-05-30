import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">403 - Unauthorized</h1>
      <p className="mt-4 text-lg text-gray-600">
        You do not have permission to access the Admin Console.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to Login
      </Link>
    </div>
  )
}
