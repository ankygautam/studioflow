import { useEffect, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/async-state'
import { DetailDrawer } from '../../components/ui/detail-drawer'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  createWaitlistSlotOffer,
  getWaitlistMatchSuggestions,
  getWaitlistSlotOffers,
  updateWaitlistSlotOfferStatus,
} from '../../lib/api/waitlist-api'
import type {
  AppointmentRecord,
  WaitlistEntryRecord,
  WaitlistOfferStatus,
  WaitlistSlotOfferRecord,
} from '../../lib/api/types'
import { formatDate, formatDateTime, formatTime, humanizeEnum } from '../../lib/formatters'

type WaitlistMatchSuggestionsModalProps = {
  appointment: AppointmentRecord | null
  onClose: () => void
  open: boolean
}

export function WaitlistMatchSuggestionsModal({
  appointment,
  onClose,
  open,
}: WaitlistMatchSuggestionsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<WaitlistEntryRecord[]>([])
  const [offers, setOffers] = useState<WaitlistSlotOfferRecord[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingOfferId, setPendingOfferId] = useState<string | null>(null)
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !appointment) {
      if (!open) {
        setSuggestions([])
        setOffers([])
        setError(null)
        setActionError(null)
        setIsLoading(false)
      }

      return
    }

    let active = true

    setIsLoading(true)
    setError(null)
    setActionError(null)
    setSuggestions([])
    setOffers([])

    void Promise.all([
      getWaitlistMatchSuggestions(appointment.id),
      getWaitlistSlotOffers(appointment.id),
    ])
      .then(([nextSuggestions, nextOffers]) => {
        if (!active) {
          return
        }

        setSuggestions(nextSuggestions)
        setOffers(nextOffers)
      })
      .catch((nextError) => {
        if (!active) {
          return
        }

        setError(nextError instanceof Error ? nextError.message : 'Unable to load waitlist suggestions right now.')
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [appointment, open])

  const offersByEntryId = offers.reduce<Record<string, WaitlistSlotOfferRecord>>((accumulator, offer) => {
    if (!accumulator[offer.waitlistEntryId]) {
      accumulator[offer.waitlistEntryId] = offer
    }

    return accumulator
  }, {})

  const handleCreateOffer = async (waitlistEntryId: string) => {
    if (!appointment || pendingActionKey) {
      return
    }

    setPendingActionKey(`create:${waitlistEntryId}`)
    setActionError(null)

    try {
      const nextOffer = await createWaitlistSlotOffer({
        cancelledAppointmentId: appointment.id,
        waitlistEntryId,
      })

      setOffers((current) => [nextOffer, ...current.filter((offer) => offer.id !== nextOffer.id)])
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Unable to send the slot offer right now.')
    } finally {
      setPendingActionKey(null)
    }
  }

  const handleUpdateOfferStatus = async (
    offerId: string,
    status: WaitlistOfferStatus,
    convertedAppointmentId?: string | null,
  ) => {
    setPendingOfferId(offerId)
    setActionError(null)

    try {
      const updatedOffer = await updateWaitlistSlotOfferStatus(offerId, {
        convertedAppointmentId: convertedAppointmentId ?? null,
        status,
      })

      setOffers((current) => current.map((offer) => (offer.id === updatedOffer.id ? updatedOffer : offer)))
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Unable to update the offer status right now.')
    } finally {
      setPendingOfferId(null)
    }
  }

  return (
    <DetailDrawer
      footer={(
        <div className="flex justify-end">
          <button
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      )}
      onClose={onClose}
      open={open}
      subtitle="Waitlist suggestions"
      title="Eligible clients for this opening"
      variant="modal"
    >
      {appointment ? (
        <div className="space-y-5">
          <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Cancelled slot</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone="neutral">{appointment.serviceName}</StatusBadge>
              <StatusBadge tone="neutral">{appointment.locationName}</StatusBadge>
              <StatusBadge tone="neutral">{appointment.staffName}</StatusBadge>
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900">{appointment.customerName}</p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(appointment.appointmentDate)} - {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </p>
          </section>

          {isLoading ? <LoadingState title="Finding waitlist matches..." /> : null}
          {!isLoading && error ? <ErrorState message={error} /> : null}
          {!isLoading && !error && actionError ? <ErrorState message={actionError} title="Offer action failed" /> : null}
          {!isLoading && !error && suggestions.length === 0 ? (
            <EmptyState
              description="No active waitlist entries currently match this service, location, staff preference, and preferred timing."
              title="No eligible waitlist matches"
            />
          ) : null}
          {!isLoading && !error && suggestions.length > 0 ? (
            <section className="space-y-3">
              {suggestions.map((suggestion) => {
                const offer = offersByEntryId[suggestion.id] ?? null
                const isCreating = pendingActionKey === `create:${suggestion.id}`
                const isUpdatingOffer = pendingOfferId === offer?.id

                return (
                  <article
                    key={suggestion.id}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{suggestion.customerName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{suggestion.serviceName} - {suggestion.locationName}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {buildMatchLabels(suggestion, appointment).map((label) => (
                          <StatusBadge key={label} tone="attention">
                            {label}
                          </StatusBadge>
                        ))}
                        {offer ? (
                          <StatusBadge tone={offerTone(offer.status)}>
                            {humanizeEnum(offer.status)}
                          </StatusBadge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <InfoLine
                        label="Preferred date"
                        value={suggestion.preferredDate ? formatDate(suggestion.preferredDate) : 'Flexible'}
                      />
                      <InfoLine
                        label="Preferred time"
                        value={formatPreferredWindow(suggestion.preferredStartTime, suggestion.preferredEndTime)}
                      />
                      <InfoLine
                        label="Preferred staff"
                        value={suggestion.preferredStaffName || 'Any staff member'}
                      />
                      <InfoLine
                        label="Waitlist status"
                        value={suggestion.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>
                    {offer ? (
                      <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                          <InfoLine label="Offer status" value={humanizeEnum(offer.status)} />
                          <InfoLine label="Expires" value={formatDateTime(offer.expiresAt)} />
                          <InfoLine
                            label="Responded"
                            value={offer.respondedAt ? formatDateTime(offer.respondedAt) : 'Waiting on response'}
                          />
                          <InfoLine
                            label="Offer created"
                            value={formatDateTime(offer.createdAt)}
                          />
                        </div>
                        {renderOfferActions(offer, isUpdatingOffer, handleUpdateOfferStatus)}
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={isCreating}
                          onClick={() => void handleCreateOffer(suggestion.id)}
                          type="button"
                        >
                          {isCreating ? 'Sending offer...' : 'Send slot offer'}
                        </button>
                        <p className="self-center text-sm text-slate-500">
                          Sends a tracked offer for this cancelled slot and starts offer-status tracking.
                        </p>
                      </div>
                    )}
                    {suggestion.notes ? (
                      <p className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                        {suggestion.notes}
                      </p>
                    ) : null}
                  </article>
                )
              })}
            </section>
          ) : null}
        </div>
      ) : null}
    </DetailDrawer>
  )
}

function renderOfferActions(
  offer: WaitlistSlotOfferRecord,
  isUpdating: boolean,
  onUpdate: (offerId: string, status: WaitlistOfferStatus, convertedAppointmentId?: string | null) => Promise<void>,
) {
  if (offer.status === 'SENT') {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <OfferActionButton
          disabled={isUpdating}
          label="Mark accepted"
          onClick={() => void onUpdate(offer.id, 'ACCEPTED')}
          pending={isUpdating}
          tone="calm"
        />
        <OfferActionButton
          disabled={isUpdating}
          label="Mark declined"
          onClick={() => void onUpdate(offer.id, 'DECLINED')}
          pending={isUpdating}
          tone="danger"
        />
        <OfferActionButton
          disabled={isUpdating}
          label="Expire now"
          onClick={() => void onUpdate(offer.id, 'EXPIRED')}
          pending={isUpdating}
          tone="attention"
        />
      </div>
    )
  }

  if (offer.status === 'ACCEPTED') {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <OfferActionButton
          disabled={isUpdating}
          label="Mark converted"
          onClick={() => void onUpdate(offer.id, 'CONVERTED')}
          pending={isUpdating}
          tone="success"
        />
        <OfferActionButton
          disabled={isUpdating}
          label="Mark declined"
          onClick={() => void onUpdate(offer.id, 'DECLINED')}
          pending={isUpdating}
          tone="danger"
        />
      </div>
    )
  }

  return null
}

function offerTone(status: WaitlistOfferStatus) {
  if (status === 'ACCEPTED') return 'calm' as const
  if (status === 'DECLINED') return 'danger' as const
  if (status === 'EXPIRED') return 'attention' as const
  if (status === 'CONVERTED') return 'success' as const
  return 'violet' as const
}

function buildMatchLabels(entry: WaitlistEntryRecord, appointment: AppointmentRecord) {
  const labels = ['Service match', 'Location match']

  if (entry.preferredStaffProfileId) {
    labels.push('Staff match')
  }

  if (entry.preferredDate === appointment.appointmentDate) {
    labels.push('Date match')
  }

  if (entry.preferredStartTime || entry.preferredEndTime) {
    labels.push('Time overlap')
  }

  return labels
}

function formatPreferredWindow(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  if (startTime) {
    return `After ${formatTime(startTime)}`
  }

  if (endTime) {
    return `Before ${formatTime(endTime)}`
  }

  return 'Flexible time'
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  )
}

function OfferActionButton({
  disabled,
  label,
  onClick,
  pending,
  tone,
}: {
  disabled: boolean
  label: string
  onClick: () => void
  pending: boolean
  tone: 'attention' | 'calm' | 'danger' | 'success'
}) {
  const toneClassName = {
    attention: 'border-amber-200 bg-amber-50 text-amber-700',
    calm: 'border-sky-200 bg-sky-50 text-sky-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }[tone]

  return (
    <button
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClassName}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {pending ? 'Updating...' : label}
    </button>
  )
}
