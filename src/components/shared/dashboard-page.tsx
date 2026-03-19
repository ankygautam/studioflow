import { PageIntro } from './page-intro'
import { SectionCard } from './section-card'
import { StatCard } from './stat-card'
import { appRoleMeta, type AppRole } from '../../data/navigation'
import { dashboardContent } from '../../data/mock-data'

type DashboardPageProps = {
  role: AppRole
}

export function DashboardPage({ role }: DashboardPageProps) {
  const content = dashboardContent[role]
  const roleMeta = appRoleMeta[role]

  return (
    <div className="space-y-8">
      <PageIntro
        action={
          <div className="rounded-full border border-rosewood-500/20 bg-rosewood-500 px-4 py-2 text-sm font-semibold text-white">
            {roleMeta.label}
          </div>
        }
        description={content.summary}
        eyebrow={roleMeta.badge}
        title={content.title}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.metrics.map((metric) => (
          <StatCard
            key={metric.caption}
            caption={metric.caption}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {content.panels.map((panel) => (
          <SectionCard key={panel.title} title={panel.title}>
            <ul className="space-y-3">
              {panel.items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-stone-200 bg-stone-100/60 px-4 py-3 leading-7"
                >
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
