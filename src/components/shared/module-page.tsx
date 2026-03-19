import { PageIntro } from './page-intro'
import { SectionCard } from './section-card'
import { appRoleMeta, type AppRole } from '../../data/navigation'

type ModulePageProps = {
  description: string
  highlights: string[]
  role: AppRole
  title: string
  workflow: string[]
}

export function ModulePage({
  description,
  highlights,
  role,
  title,
  workflow,
}: ModulePageProps) {
  const roleMeta = appRoleMeta[role]

  return (
    <div className="space-y-8">
      <PageIntro
        action={
          <div className="rounded-full border border-ink-900/10 bg-stone-100 px-4 py-2 text-sm font-semibold text-ink-900">
            {roleMeta.label}
          </div>
        }
        description={description}
        eyebrow="MVP module"
        title={title}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Key capabilities">
          <ul className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-stone-200 bg-stone-100/70 px-4 py-4 leading-7"
              >
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Suggested workflow">
          <ol className="space-y-3">
            {workflow.map((item, index) => (
              <li
                key={item}
                className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 leading-7"
              >
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 font-display text-sm text-white">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  )
}
