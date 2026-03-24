import { Link } from 'react-router-dom'

export function AuthFooterLinkRow({
  actionLabel,
  prompt,
  to,
}: {
  actionLabel: string
  prompt: string
  to: string
}) {
  return (
    <p className="mt-6 text-sm text-slate-600">
      {prompt}{' '}
      <Link className="font-semibold text-slate-900 transition hover:text-slate-700" to={to}>
        {actionLabel}
      </Link>
    </p>
  )
}
