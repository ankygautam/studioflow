import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthCardProps = {
  children: ReactNode
  description: string
  footerCta: string
  footerLabel: string
  footerTo: string
  title: string
}

export function AuthCard({
  children,
  description,
  footerCta,
  footerLabel,
  footerTo,
  title,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(32,26,23,0.1)] backdrop-blur">
      <div className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-rosewood-500">
          StudioFlow access
        </p>
        <h1 className="font-display text-4xl text-ink-950">{title}</h1>
        <p className="leading-7 text-ink-700">{description}</p>
      </div>

      <div className="mt-8">{children}</div>

      <p className="mt-6 text-sm text-ink-700">
        {footerLabel}{' '}
        <Link className="font-semibold text-rosewood-500 transition hover:text-ink-950" to={footerTo}>
          {footerCta}
        </Link>
      </p>
    </div>
  )
}
