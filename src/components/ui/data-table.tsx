import type { ReactNode } from 'react'

export function DataTable({
  children,
  columns,
}: {
  children: ReactNode
  columns: string[]
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
        Scroll to view all columns
      </div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>
        </table>
      </div>
    </div>
  )
}
