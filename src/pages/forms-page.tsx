import { useCallback, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAppointments } from '../lib/api/appointments-api'
import { getClients } from '../lib/api/clients-api'
import {
  createConsentFormSubmission,
  createConsentFormTemplate,
  deleteConsentFormSubmission,
  deleteConsentFormTemplate,
  getConsentFormSubmissions,
  getConsentFormTemplates,
  updateConsentFormSubmission,
  updateConsentFormTemplate,
} from '../lib/api/consent-forms-api'
import { getDefaultStudioId } from '../lib/api/http'
import type {
  AppointmentRecord,
  ConsentFormStatus,
  ConsentFormSubmissionRecord,
  ConsentFormTemplateRecord,
} from '../lib/api/types'
import { formatDate, formatDateTime, formatTime, humanizeEnum } from '../lib/formatters'

type TemplateFormState = {
  content: string
  description: string
  isActive: boolean
  title: string
}

type SubmissionFormState = {
  appointmentId: string
  customerProfileId: string
  signatureImageUrl: string
  signedAt: string
  status: ConsentFormStatus
  templateId: string
}

const submissionStatuses: ConsentFormStatus[] = ['PENDING', 'SIGNED', 'EXPIRED']

export function FormsPage() {
  const defaultStudioId = getDefaultStudioId()
  const loadTemplates = useCallback(() => getConsentFormTemplates(defaultStudioId), [defaultStudioId])
  const loadSubmissions = useCallback(
    () => getConsentFormSubmissions({ studioId: defaultStudioId }),
    [defaultStudioId],
  )
  const loadClients = useCallback(() => getClients(defaultStudioId), [defaultStudioId])
  const loadAppointments = useCallback(() => getAppointments(defaultStudioId), [defaultStudioId])

  const {
    data: templates,
    error: templatesError,
    isLoading: templatesLoading,
    reload: reloadTemplates,
  } = useRemoteList(loadTemplates)
  const {
    data: submissions,
    error: submissionsError,
    isLoading: submissionsLoading,
    reload: reloadSubmissions,
  } = useRemoteList(loadSubmissions)
  const {
    data: clients,
    error: clientsError,
    isLoading: clientsLoading,
  } = useRemoteList(loadClients)
  const {
    data: appointments,
    error: appointmentsError,
    isLoading: appointmentsLoading,
  } = useRemoteList(loadAppointments)

  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false)
  const [submissionDrawerOpen, setSubmissionDrawerOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ConsentFormTemplateRecord | null>(null)
  const [editingSubmission, setEditingSubmission] = useState<ConsentFormSubmissionRecord | null>(null)
  const [templateState, setTemplateState] = useState<TemplateFormState>(createTemplateForm())
  const [submissionState, setSubmissionState] = useState<SubmissionFormState>(createSubmissionForm())
  const [templateErrors, setTemplateErrors] = useState<Partial<Record<keyof TemplateFormState, string>>>({})
  const [submissionErrors, setSubmissionErrors] = useState<
    Partial<Record<keyof SubmissionFormState, string>>
  >({})
  const [templateSaving, setTemplateSaving] = useState(false)
  const [submissionSaving, setSubmissionSaving] = useState(false)
  const [templateMutationError, setTemplateMutationError] = useState<string | null>(null)
  const [submissionMutationError, setSubmissionMutationError] = useState<string | null>(null)
  const [confirmTemplateDeleteOpen, setConfirmTemplateDeleteOpen] = useState(false)
  const [confirmSubmissionDeleteOpen, setConfirmSubmissionDeleteOpen] = useState(false)

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        label: client.fullName,
        value: client.id,
      })),
    [clients],
  )

  const appointmentOptions = useMemo(
    () =>
      appointments.map((appointment) => ({
        label: appointmentOptionLabel(appointment),
        value: appointment.id,
      })),
    [appointments],
  )

  const templateOptions = useMemo(
    () =>
      templates
        .filter((template) => template.isActive)
        .map((template) => ({
          label: template.title,
          value: template.id,
        })),
    [templates],
  )

  const openTemplateCreate = () => {
    setEditingTemplate(null)
    setTemplateMutationError(null)
    setTemplateErrors({})
    setTemplateState(createTemplateForm())
    setTemplateDrawerOpen(true)
  }

  const openTemplateEdit = (template: ConsentFormTemplateRecord) => {
    setEditingTemplate(template)
    setTemplateMutationError(null)
    setTemplateErrors({})
    setTemplateState(createTemplateForm(template))
    setTemplateDrawerOpen(true)
  }

  const closeTemplateDrawer = () => {
    setEditingTemplate(null)
    setTemplateMutationError(null)
    setTemplateErrors({})
    setTemplateDrawerOpen(false)
    setConfirmTemplateDeleteOpen(false)
  }

  const openSubmissionCreate = () => {
    setEditingSubmission(null)
    setSubmissionMutationError(null)
    setSubmissionErrors({})
    setSubmissionState(createSubmissionForm())
    setSubmissionDrawerOpen(true)
  }

  const openSubmissionEdit = (submission: ConsentFormSubmissionRecord) => {
    setEditingSubmission(submission)
    setSubmissionMutationError(null)
    setSubmissionErrors({})
    setSubmissionState(createSubmissionForm(submission))
    setSubmissionDrawerOpen(true)
  }

  const closeSubmissionDrawer = () => {
    setEditingSubmission(null)
    setSubmissionMutationError(null)
    setSubmissionErrors({})
    setSubmissionDrawerOpen(false)
    setConfirmSubmissionDeleteOpen(false)
  }

  const handleTemplateSubmit = async () => {
    const errors = validateTemplateForm(templateState)
    setTemplateErrors(errors)

    if (Object.keys(errors).length > 0 || !defaultStudioId) {
      return
    }

    setTemplateSaving(true)
    setTemplateMutationError(null)

    try {
      const payload = {
        content: templateState.content.trim(),
        description: templateState.description.trim(),
        isActive: templateState.isActive,
        studioId: defaultStudioId,
        title: templateState.title.trim(),
      }

      if (editingTemplate) {
        await updateConsentFormTemplate(editingTemplate.id, payload)
      } else {
        await createConsentFormTemplate(payload)
      }

      await reloadTemplates()
      closeTemplateDrawer()
    } catch (error) {
      setTemplateMutationError(
        error instanceof Error ? error.message : 'Unable to save this template right now.',
      )
    } finally {
      setTemplateSaving(false)
    }
  }

  const handleTemplateDelete = async () => {
    if (!editingTemplate) {
      return
    }

    setTemplateSaving(true)
    setTemplateMutationError(null)

    try {
      await deleteConsentFormTemplate(editingTemplate.id)
      await reloadTemplates()
      closeTemplateDrawer()
    } catch (error) {
      setTemplateMutationError(
        error instanceof Error ? error.message : 'Unable to deactivate this template right now.',
      )
    } finally {
      setTemplateSaving(false)
    }
  }

  const handleSubmissionSubmit = async () => {
    const errors = validateSubmissionForm(submissionState)
    setSubmissionErrors(errors)

    if (Object.keys(errors).length > 0 || !defaultStudioId) {
      return
    }

    setSubmissionSaving(true)
    setSubmissionMutationError(null)

    try {
      const payload = {
        appointmentId: submissionState.appointmentId || null,
        customerProfileId: submissionState.customerProfileId,
        signatureImageUrl: submissionState.signatureImageUrl.trim(),
        signedAt:
          submissionState.status === 'SIGNED'
            ? submissionState.signedAt || new Date().toISOString()
            : submissionState.signedAt || null,
        status: submissionState.status,
        studioId: defaultStudioId,
        templateId: submissionState.templateId,
      }

      if (editingSubmission) {
        await updateConsentFormSubmission(editingSubmission.id, payload)
      } else {
        await createConsentFormSubmission(payload)
      }

      await reloadSubmissions()
      closeSubmissionDrawer()
    } catch (error) {
      setSubmissionMutationError(
        error instanceof Error ? error.message : 'Unable to save this submission right now.',
      )
    } finally {
      setSubmissionSaving(false)
    }
  }

  const handleSubmissionDelete = async () => {
    if (!editingSubmission) {
      return
    }

    setSubmissionSaving(true)
    setSubmissionMutationError(null)

    try {
      await deleteConsentFormSubmission(editingSubmission.id)
      await reloadSubmissions()
      closeSubmissionDrawer()
    } catch (error) {
      setSubmissionMutationError(
        error instanceof Error ? error.message : 'Unable to delete this submission right now.',
      )
    } finally {
      setSubmissionSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <button
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
              onClick={openTemplateCreate}
              type="button"
            >
              Add template
            </button>
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
              onClick={openSubmissionCreate}
              type="button"
            >
              Track submission
            </button>
          </>
        }
        description="Consent workflows stay centered on reusable templates and simple signing status visibility, so teams can track waivers without adding legal-process clutter."
        eyebrow="Consent Forms"
        title="Templates and signing status"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <SurfaceCard title="Form templates">
          {templatesLoading ? <LoadingState title="Loading templates..." /> : null}
          {!templatesLoading && templatesError ? (
            <ErrorState
              action={
                <button
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
                  onClick={() => void reloadTemplates()}
                  type="button"
                >
                  Retry
                </button>
              }
              message={templatesError}
            />
          ) : null}
          {!templatesLoading && !templatesError && templates.length === 0 ? (
            <EmptyState
              action={
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openTemplateCreate}
                  type="button"
                >
                  Create the first template
                </button>
              }
              description="Start with a reusable waiver or intake form so the front desk can attach it to bookings without rebuilding the content each time."
              title="No form templates yet"
            />
          ) : null}
          {!templatesLoading && !templatesError && templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white"
                  onClick={() => openTemplateEdit(template)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{template.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        {template.description || 'No short description added yet.'}
                      </p>
                    </div>
                    <StatusBadge tone={template.isActive ? 'success' : 'neutral'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Updated {formatDateTime(template.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </SurfaceCard>

        <SurfaceCard title="Submission tracking">
          {submissionsLoading ? <LoadingState title="Loading submissions..." /> : null}
          {!submissionsLoading && submissionsError ? (
            <ErrorState
              action={
                <button
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
                  onClick={() => void reloadSubmissions()}
                  type="button"
                >
                  Retry
                </button>
              }
              message={submissionsError}
            />
          ) : null}
          {!submissionsLoading && !submissionsError && submissions.length === 0 ? (
            <EmptyState
              action={
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openSubmissionCreate}
                  type="button"
                >
                  Create the first submission
                </button>
              }
              description="As soon as a client form is tracked, the linked appointment and signing state will show up here for the team."
              title="No submissions tracked yet"
            />
          ) : null}
          {!submissionsLoading && !submissionsError && submissions.length > 0 ? (
            <DataTable columns={['Template', 'Client', 'Appointment', 'Status', 'Signed', 'Updated']}>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-4 py-4">
                    <button
                      className="font-semibold text-slate-950 transition hover:text-slate-700"
                      onClick={() => openSubmissionEdit(submission)}
                      type="button"
                    >
                      {submission.templateTitle}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{submission.customerName}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {submission.appointmentDate ? (
                      <div className="space-y-1">
                        <p>{formatDate(submission.appointmentDate)}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {submission.appointmentStartTime
                            ? formatTime(submission.appointmentStartTime)
                            : 'Time not set'}
                          {submission.serviceName ? ` • ${submission.serviceName}` : ''}
                        </p>
                      </div>
                    ) : (
                      'No appointment linked'
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={consentTone(submission.status)}>
                      {humanizeEnum(submission.status)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {submission.signedAt ? formatDateTime(submission.signedAt) : 'Not signed'}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(submission.updatedAt)}</td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              {editingTemplate ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={templateSaving}
                  onClick={() => setConfirmTemplateDeleteOpen(true)}
                  type="button"
                >
                  Deactivate template
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                disabled={templateSaving}
                onClick={closeTemplateDrawer}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={templateSaving}
                onClick={() => void handleTemplateSubmit()}
                type="button"
              >
                {templateSaving ? 'Saving...' : editingTemplate ? 'Save changes' : 'Create template'}
              </button>
            </div>
          </div>
        }
        onClose={closeTemplateDrawer}
        open={templateDrawerOpen}
        variant={editingTemplate ? 'drawer' : 'modal'}
        subtitle="Consent template"
        title={editingTemplate ? editingTemplate.title : 'New template'}
      >
        <div className="space-y-5">
          {templateMutationError ? <ErrorState message={templateMutationError} /> : null}
          <InputField
            error={templateErrors.title}
            label="Title"
            onChange={(event) => setTemplateState((current) => ({ ...current, title: event.target.value }))}
            placeholder="Tattoo release"
            value={templateState.title}
          />
          <TextAreaField
            error={templateErrors.description}
            label="Description"
            onChange={(event) =>
              setTemplateState((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Short context for staff, like aftercare acknowledgement or intake notes."
            rows={3}
            value={templateState.description}
          />
          <TextAreaField
            error={templateErrors.content}
            label="Content"
            onChange={(event) => setTemplateState((current) => ({ ...current, content: event.target.value }))}
            placeholder="Plain form copy is fine for now."
            rows={8}
            value={templateState.content}
          />
          <ToggleField
            checked={templateState.isActive}
            label="Template active"
            onChange={(checked) => setTemplateState((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </DetailDrawer>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              {editingSubmission ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={submissionSaving}
                  onClick={() => setConfirmSubmissionDeleteOpen(true)}
                  type="button"
                >
                  Delete submission
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                disabled={submissionSaving}
                onClick={closeSubmissionDrawer}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={
                  submissionSaving ||
                  clientsLoading ||
                  appointmentsLoading ||
                  templateOptions.length === 0 ||
                  clientOptions.length === 0
                }
                onClick={() => void handleSubmissionSubmit()}
                type="button"
              >
                {submissionSaving ? 'Saving...' : editingSubmission ? 'Save changes' : 'Create submission'}
              </button>
            </div>
          </div>
        }
        onClose={closeSubmissionDrawer}
        open={submissionDrawerOpen}
        variant={editingSubmission ? 'drawer' : 'modal'}
        subtitle="Submission tracking"
        title={editingSubmission ? editingSubmission.customerName : 'New submission'}
      >
        <div className="space-y-5">
          {submissionMutationError ? <ErrorState message={submissionMutationError} /> : null}
          {clientsError ? <ErrorState message={clientsError} /> : null}
          {appointmentsError ? <ErrorState message={appointmentsError} /> : null}
          {templatesError ? <ErrorState message={templatesError} /> : null}
          {(clientsLoading || appointmentsLoading || templatesLoading) ? (
            <LoadingState title="Loading form dependencies..." />
          ) : null}
          {!clientsLoading && !clientsError && clientOptions.length === 0 ? (
            <EmptyState
              description="Create a client first so the consent record can be attached to a real customer profile."
              title="No clients yet"
            />
          ) : null}
          {!templatesLoading && !templatesError && templateOptions.length === 0 ? (
            <EmptyState
              description="Create a form template first so the team has something reusable to attach to a booking."
              title="No active templates"
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              error={submissionErrors.templateId}
              label="Template"
              onChange={(event) =>
                setSubmissionState((current) => ({ ...current, templateId: event.target.value }))
              }
              value={submissionState.templateId}
            >
              <option value="">Select a template</option>
              {templateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={submissionErrors.customerProfileId}
              label="Client"
              onChange={(event) =>
                setSubmissionState((current) => ({ ...current, customerProfileId: event.target.value }))
              }
              value={submissionState.customerProfileId}
            >
              <option value="">Select a client</option>
              {clientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={submissionErrors.appointmentId}
              label="Appointment"
              onChange={(event) =>
                setSubmissionState((current) => ({ ...current, appointmentId: event.target.value }))
              }
              value={submissionState.appointmentId}
            >
              <option value="">No linked appointment</option>
              {appointmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={submissionErrors.status}
              label="Status"
              onChange={(event) =>
                setSubmissionState((current) => ({
                  ...current,
                  status: event.target.value as ConsentFormStatus,
                }))
              }
              value={submissionState.status}
            >
              {submissionStatuses.map((status) => (
                <option key={status} value={status}>
                  {humanizeEnum(status)}
                </option>
              ))}
            </SelectField>
            <InputField
              error={submissionErrors.signedAt}
              label="Signed at"
              onChange={(event) =>
                setSubmissionState((current) => ({ ...current, signedAt: event.target.value }))
              }
              type="datetime-local"
              value={submissionState.signedAt}
            />
            <InputField
              error={submissionErrors.signatureImageUrl}
              label="Signature image URL"
              onChange={(event) =>
                setSubmissionState((current) => ({ ...current, signatureImageUrl: event.target.value }))
              }
              placeholder="Optional image reference"
              value={submissionState.signatureImageUrl}
            />
          </div>
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate template"
        description={`"${editingTemplate?.title ?? 'This template'}" will stay in history but will stop being available for new consent requests.`}
        isConfirming={templateSaving}
        onCancel={() => setConfirmTemplateDeleteOpen(false)}
        onConfirm={() => void handleTemplateDelete()}
        open={confirmTemplateDeleteOpen}
        title="Deactivate this template?"
      />

      <ConfirmDialog
        confirmLabel="Delete submission"
        description={`This removes the submission record for ${editingSubmission?.customerName ?? 'this client'}. This should only be used for cleanup or mistakes.`}
        isConfirming={submissionSaving}
        onCancel={() => setConfirmSubmissionDeleteOpen(false)}
        onConfirm={() => void handleSubmissionDelete()}
        open={confirmSubmissionDeleteOpen}
        title="Delete this submission?"
      />
    </div>
  )
}

function createTemplateForm(template?: ConsentFormTemplateRecord | null): TemplateFormState {
  return {
    content: template?.content ?? '',
    description: template?.description ?? '',
    isActive: template?.isActive ?? true,
    title: template?.title ?? '',
  }
}

function createSubmissionForm(
  submission?: ConsentFormSubmissionRecord | null,
): SubmissionFormState {
  return {
    appointmentId: submission?.appointmentId ?? '',
    customerProfileId: submission?.customerProfileId ?? '',
    signatureImageUrl: submission?.signatureImageUrl ?? '',
    signedAt: submission?.signedAt ? toDateTimeLocal(submission.signedAt) : '',
    status: submission?.status ?? 'PENDING',
    templateId: submission?.templateId ?? '',
  }
}

function validateTemplateForm(state: TemplateFormState) {
  const errors: Partial<Record<keyof TemplateFormState, string>> = {}

  if (!state.title.trim()) {
    errors.title = 'Title is required.'
  }

  if (!state.content.trim()) {
    errors.content = 'Content is required.'
  }

  return errors
}

function validateSubmissionForm(state: SubmissionFormState) {
  const errors: Partial<Record<keyof SubmissionFormState, string>> = {}

  if (!state.templateId) {
    errors.templateId = 'Template is required.'
  }

  if (!state.customerProfileId) {
    errors.customerProfileId = 'Client is required.'
  }

  if (!state.status) {
    errors.status = 'Status is required.'
  }

  if (state.signatureImageUrl && !isValidUrl(state.signatureImageUrl)) {
    errors.signatureImageUrl = 'Enter a valid URL or leave this blank.'
  }

  return errors
}

function appointmentOptionLabel(appointment: AppointmentRecord) {
  return `${appointment.customerName} • ${formatDate(appointment.appointmentDate)} • ${appointment.serviceName}`
}

function consentTone(status: ConsentFormStatus) {
  switch (status) {
    case 'SIGNED':
      return 'success'
    case 'PENDING':
      return 'attention'
    case 'EXPIRED':
      return 'danger'
    default:
      return 'neutral'
  }
}

function toDateTimeLocal(value: string) {
  return value.slice(0, 16)
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
