import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_30px_80px_rgba(32,26,23,0.08)]">
        <p className="font-display text-5xl text-ink-950">404</p>
        <p className="mt-3 text-lg text-ink-700">
          That StudioFlow page has not been designed yet.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-ink-950 px-5 py-3 font-semibold text-white transition hover:bg-rosewood-500"
          to="/"
        >
          Back to landing page
        </Link>
      </div>
    </div>
  )
}
