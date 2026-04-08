import type { ReactNode } from 'react'

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden className={joinClassNames('sf-skeleton', className)} />
}

function SkeletonCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={joinClassNames(
        'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PageHeaderSkeleton({ actionCount = 2 }: { actionCount?: number }) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <SkeletonBlock className="h-3 w-28 rounded-full" />
          <SkeletonBlock className="h-12 w-full max-w-[26rem] rounded-2xl" />
          <SkeletonBlock className="h-4 w-full max-w-[42rem] rounded-full" />
          <SkeletonBlock className="h-4 w-full max-w-[36rem] rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: actionCount }).map((_, index) => (
            <SkeletonBlock key={index} className="h-12 w-32 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBlock className="mt-4 h-9 w-28 rounded-2xl" />
      <SkeletonBlock className="mt-3 h-3 w-36 rounded-full" />
    </div>
  )
}

export function StatCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function TableSkeleton({
  columns = 6,
  rows = 5,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 md:hidden">
        <SkeletonBlock className="h-3 w-36 rounded-full" />
      </div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <SkeletonBlock className="h-3 w-20 rounded-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`} className="px-4 py-4">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-full max-w-[8rem] rounded-full" />
                      {columnIndex === 0 || columnIndex === 1 ? (
                        <SkeletonBlock className="h-3 w-full max-w-[5rem] rounded-full" />
                      ) : null}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ListRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-40 rounded-full" />
              <SkeletonBlock className="h-3 w-48 rounded-full" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />
          <SkeletonBlock className="mt-2 h-4 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function FormSectionSkeleton({
  columns = 2,
  fields = 6,
  includeActions = false,
  includeToggles = false,
  titleWidthClassName = 'w-40',
}: {
  columns?: 1 | 2 | 3
  fields?: number
  includeActions?: boolean
  includeToggles?: boolean
  titleWidthClassName?: string
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <SkeletonBlock className={joinClassNames('h-4 rounded-full', titleWidthClassName)} />
        <SkeletonBlock className="h-4 w-full max-w-2xl rounded-full" />
      </div>

      <div
        className={joinClassNames(
          'grid gap-4',
          columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        )}
      >
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <SkeletonBlock className="h-12 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      {includeToggles ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-28 rounded-full" />
                  <SkeletonBlock className="h-3 w-24 rounded-full" />
                </div>
                <SkeletonBlock className="h-7 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {includeActions ? (
        <div className="flex flex-wrap justify-end gap-3">
          <SkeletonBlock className="h-11 w-28 rounded-2xl" />
          <SkeletonBlock className="h-11 w-36 rounded-2xl" />
        </div>
      ) : null}
    </div>
  )
}

export function CalendarBoardSkeleton({
  staffColumns = 4,
  timeRows = 7,
}: {
  staffColumns?: number
  timeRows?: number
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-16 rounded-full" />
              <SkeletonBlock className="h-12 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="h-12 w-64 rounded-full" />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div
          className="grid border-b border-slate-200 bg-slate-50"
          style={{ gridTemplateColumns: `104px repeat(${staffColumns}, minmax(0, 1fr))` }}
        >
          <div className="border-r border-slate-200 px-5 py-5">
            <SkeletonBlock className="h-3 w-12 rounded-full" />
          </div>
          {Array.from({ length: staffColumns }).map((_, index) => (
            <div key={index} className="border-r border-slate-200 px-5 py-5 last:border-r-0">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-24 rounded-full" />
                  <SkeletonBlock className="h-3 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {Array.from({ length: timeRows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-b border-slate-200/80 last:border-b-0"
            style={{ gridTemplateColumns: `104px repeat(${staffColumns}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-slate-200 px-5 py-6">
              <SkeletonBlock className="h-4 w-14 rounded-full" />
            </div>
            {Array.from({ length: staffColumns }).map((_, columnIndex) => (
              <div key={`${rowIndex}-${columnIndex}`} className="border-r border-slate-200 px-4 py-4 last:border-r-0">
                <div className="space-y-3">
                  {columnIndex === rowIndex % staffColumns || (rowIndex + columnIndex) % 5 === 0 ? (
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <SkeletonBlock className="h-4 w-20 rounded-full" />
                      <SkeletonBlock className="mt-3 h-5 w-24 rounded-full" />
                      <SkeletonBlock className="mt-2 h-3 w-28 rounded-full" />
                    </div>
                  ) : (
                    <SkeletonBlock className="h-20 w-full rounded-[22px]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function OnboardingSkeleton() {
  return (
    <div className="theme-page-shell min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1320px] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[#0d1321] p-8 shadow-[0_30px_120px_rgba(6,10,20,0.45)] md:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,137,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(181,234,216,0.12),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-14 w-14 rounded-[20px]" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-6 w-36 rounded-full" />
                  <SkeletonBlock className="h-4 w-32 rounded-full" />
                </div>
              </div>
              <div className="space-y-4">
                <SkeletonBlock className="h-3 w-24 rounded-full" />
                <SkeletonBlock className="h-12 w-full max-w-[28rem] rounded-2xl" />
                <SkeletonBlock className="h-4 w-full max-w-[30rem] rounded-full" />
                <SkeletonBlock className="h-4 w-full max-w-[26rem] rounded-full" />
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <SkeletonBlock className="h-4 w-28 rounded-full" />
                  <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
                  <SkeletonBlock className="mt-2 h-3 w-4/5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[36px] border border-white/70 bg-white/95 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] md:p-10">
            <div className="space-y-4">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-11 w-full max-w-[24rem] rounded-2xl" />
              <SkeletonBlock className="h-4 w-full max-w-[26rem] rounded-full" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
              ))}
            </div>
            <div className="mt-8">
              <FormSectionSkeleton fields={6} includeActions columns={2} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function WorkspaceBootSkeleton() {
  return (
    <div className="theme-page-shell min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <PageHeaderSkeleton actionCount={2} />
        <StatCardGridSkeleton />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <SkeletonCard>
            <TableSkeleton columns={5} rows={5} />
          </SkeletonCard>
          <div className="space-y-6">
            <SkeletonCard>
              <ListRowsSkeleton rows={3} />
            </SkeletonCard>
            <SkeletonCard>
              <FormSectionSkeleton columns={1} fields={4} />
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  )
}
