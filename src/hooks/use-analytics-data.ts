import { useCallback, useEffect, useState } from 'react'
import {
  getAnalyticsOverview,
  getAppointmentAnalytics,
  getRevenueAnalytics,
  getServiceAnalytics,
} from '../lib/api/analytics-api'
import type {
  AnalyticsOverviewRecord,
  AppointmentAnalyticsRecord,
  RevenueAnalyticsRecord,
  ServiceAnalyticsRecord,
} from '../lib/api/types'

type AnalyticsRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH'

type AnalyticsBundle = {
  appointments: AppointmentAnalyticsRecord
  overview: AnalyticsOverviewRecord
  revenue: RevenueAnalyticsRecord
  services: ServiceAnalyticsRecord
}

export function useAnalyticsData(studioId: string | null, range: AnalyticsRange) {
  const [data, setData] = useState<AnalyticsBundle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { from, to } = resolveRange(range)
      const query = { from, studioId, to }
      const [overview, revenue, appointments, services] = await Promise.all([
        getAnalyticsOverview(query),
        getRevenueAnalytics(query),
        getAppointmentAnalytics(query),
        getServiceAnalytics(query),
      ])

      setData({
        appointments,
        overview,
        revenue,
        services,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong while loading analytics.')
    } finally {
      setIsLoading(false)
    }
  }, [range, studioId])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    data,
    error,
    isLoading,
    reload,
  }
}

function resolveRange(range: AnalyticsRange) {
  const today = new Date()
  const end = formatDate(today)
  const startDate = new Date(today)

  if (range === 'LAST_30_DAYS') {
    startDate.setDate(today.getDate() - 29)
  } else if (range === 'THIS_MONTH') {
    startDate.setDate(1)
  } else {
    startDate.setDate(today.getDate() - 6)
  }

  return {
    from: formatDate(startDate),
    to: end,
  }
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

export type { AnalyticsRange }
