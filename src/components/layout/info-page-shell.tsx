import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type InfoSection = {
  body: ReactNode
  title: string
}

export function InfoPageShell({
  description,
  sections,
  title,
}: {
  description?: string
  sections: InfoSection[]
  title: string
}) {
  return (
    <div className="theme-page-shell min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="sticky top-4 z-10 mb-6 md:mb-8">
          <Link
            className="group flex items-center gap-4 rounded-[32px] border border-white/55 bg-[#0d1321]/95 px-5 py-5 shadow-[0_24px_80px_rgba(6,10,20,0.24)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-white/70 hover:shadow-[0_30px_90px_rgba(6,10,20,0.28)] focus-visible:-translate-y-1 focus-visible:border-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/25 md:gap-5 md:px-8 md:py-7"
            to="/login"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/10 text-xl font-semibold text-white md:h-20 md:w-20 md:rounded-[28px] md:text-2xl">
              SF
            </div>
            <div className="min-w-0">
              <p className="font-display text-[2rem] leading-none text-white md:text-[3.25rem]">StudioFlow</p>
              <p className="mt-1 text-sm text-slate-400 transition-colors duration-200 group-hover:text-slate-300 group-focus-visible:text-slate-300 md:mt-2 md:text-[1.1rem]">
                Premium studio operations
              </p>
            </div>
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/75 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="border-b border-slate-200/80 px-8 py-8 md:px-10 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-400">StudioFlow</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-slate-950 md:text-5xl">{title}</h1>
            {description ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{description}</p>
            ) : null}
          </div>

          <div className="space-y-10 px-8 py-8 md:px-10 md:py-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-slate-950 md:text-2xl">{section.title}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">{section.body}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
