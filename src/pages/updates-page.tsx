import { InfoPageShell } from '../components/layout/info-page-shell'
import { generatedAt, projectUpdates } from '../lib/generated/updates'

export function UpdatesPage() {
  return (
    <InfoPageShell
      description="Recent product improvements generated from the latest StudioFlow commit history."
      sections={[
        {
          title: 'Latest improvements',
          body: (
            <div className="space-y-4">
              {projectUpdates.length > 0 ? (
                projectUpdates.map((update) => (
                  <article
                    key={update.hash}
                    className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-5"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <span>{update.category}</span>
                      <span>{update.date}</span>
                      <span>{update.shortHash}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{update.subject}</h2>
                    <p className="mt-3 text-base leading-8 text-slate-600">{update.summary}</p>
                  </article>
                ))
              ) : (
                <p>Recent updates will appear here once commit history is available.</p>
              )}
            </div>
          ),
        },
        {
          title: 'How this page works',
          body: (
            <>
              <p>
                This page is generated from recent StudioFlow commit history so the product can show
                a lightweight record of what changed over time.
              </p>
              <p>
                Each time the app is started locally or built for deployment, the latest commit
                messages are turned into update entries automatically.
              </p>
              <p className="text-sm text-slate-500">Last generated: {formatGeneratedAt(generatedAt)}</p>
            </>
          ),
        },
      ]}
      title="StudioFlow Updates"
    />
  )
}

function formatGeneratedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
