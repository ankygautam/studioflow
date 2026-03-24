export type ServiceCategory =
  | 'TATTOO'
  | 'BARBER'
  | 'HAIR'
  | 'NAIL'
  | 'PIERCING'
  | 'WELLNESS'
  | 'MASSAGE'
  | 'MAKEUP'
  | 'BEAUTY'
  | 'CONSULTATION'
  | 'OTHER'

export type BusinessType =
  | 'TATTOO_STUDIO'
  | 'BARBER_SHOP'
  | 'SALON'
  | 'PIERCING_STUDIO'
  | 'NAIL_STUDIO'
  | 'WELLNESS_CLINIC'
  | 'SOLO_PRACTICE'

export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export type AppointmentSource = 'ADMIN_CREATED' | 'STAFF_CREATED' | 'ONLINE_BOOKING'

export type NotificationType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_PENDING'
  | 'CONSENT_PENDING'
  | 'CONSENT_SIGNED'

export type AuditEntityType =
  | 'APPOINTMENT'
  | 'PAYMENT'
  | 'CLIENT'
  | 'STAFF'
  | 'SERVICE'
  | 'CONSENT_TEMPLATE'
  | 'CONSENT_SUBMISSION'
  | 'LOCATION'
  | 'SETTINGS'
  | 'AUTH'
  | 'ONBOARDING'

export type AuditActionType =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'DEACTIVATED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_DENIED'
  | 'COMPLETED'

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED'

export type PaymentMethod = 'CASH' | 'CARD' | 'ETRANSFER' | 'OTHER'

export type ConsentFormStatus = 'PENDING' | 'SIGNED' | 'EXPIRED'

export interface ServiceRecord {
  category: ServiceCategory
  createdAt: string
  depositAmount: number
  depositRequired: boolean
  description: string | null
  durationMinutes: number
  id: string
  isActive: boolean
  name: string
  price: number
  studioId: string
  updatedAt: string
}

export interface ServiceUpsertPayload {
  category: ServiceCategory
  depositAmount: number
  depositRequired: boolean
  description: string
  durationMinutes: number
  isActive?: boolean
  name: string
  price: number
  studioId: string
}

export interface StaffRecord {
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  displayName: string
  id: string
  jobTitle: string | null
  phone: string | null
  primaryLocationId?: string | null
  primaryLocationName?: string | null
  status: StaffStatus
  studioId: string
  studioName?: string | null
  updatedAt: string
  userEmail?: string | null
  userFullName?: string | null
  userId: string
}

export interface StaffUpsertPayload {
  avatarUrl: string
  bio: string
  displayName: string
  jobTitle: string
  phone: string
  primaryLocationId?: string | null
  status: StaffStatus
  studioId: string
  userId: string
}

export interface LocationRecord {
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  country: string | null
  createdAt: string
  email: string | null
  id: string
  isActive: boolean
  name: string
  phone: string | null
  postalCode: string | null
  provinceOrState: string | null
  slug: string
  studioId: string
  timezone: string
  updatedAt: string
}

export interface LocationUpsertPayload {
  addressLine1: string
  addressLine2: string
  city: string
  country: string
  email: string
  isActive?: boolean
  name: string
  phone: string
  postalCode: string
  provinceOrState: string
  slug: string
  studioId: string
  timezone: string
}

export interface StudioOnboardingPayload {
  addressLine1: string
  addressLine2: string
  businessType: BusinessType
  city: string
  country: string
  locationEmail: string
  locationName: string
  locationPhone: string
  postalCode: string
  provinceOrState: string
  starterServices: Array<{
    category: ServiceCategory
    durationMinutes: number
    name: string
    price: number
  }>
  bookingLeadTimeHours: number
  defaultDepositAmount: number
  defaultDepositRequired: boolean
  studioEmail: string
  studioName: string
  studioPhone: string
  timezone: string
}

export interface StudioOnboardingRecord {
  locationId: string
  locationName: string
  locationSlug: string
  onboardingCompleted: boolean
  studioId: string
  studioName: string
}

export interface ClientRecord {
  createdAt: string
  dateOfBirth: string | null
  email: string | null
  fullName: string
  id: string
  isActive: boolean
  notes: string | null
  phone: string | null
  studioId: string
  studioName?: string | null
  updatedAt: string
}

export interface ClientUpsertPayload {
  dateOfBirth: string | null
  email: string
  fullName: string
  isActive?: boolean
  notes: string
  phone: string
  studioId: string
}

export interface AppointmentRecord {
  appointmentDate: string
  bookingConfirmationSentAt: string | null
  createdAt: string
  customerName: string
  customerProfileId: string
  endTime: string
  id: string
  locationId: string
  locationName: string
  notes: string | null
  serviceId: string
  serviceName: string
  source: AppointmentSource
  staffName: string
  staffProfileId: string
  startTime: string
  status: AppointmentStatus
  studioId: string
  reminderSentAt: string | null
  updatedAt: string
}

export interface AppointmentUpsertPayload {
  appointmentDate: string
  customerProfileId: string
  endTime: string
  locationId: string
  notes: string
  serviceId: string
  source: AppointmentSource
  staffProfileId: string
  startTime: string
  status: AppointmentStatus
  studioId: string
}

export interface PaymentRecord {
  amount: number
  appointmentDate: string
  appointmentId: string
  appointmentStartTime: string
  createdAt: string
  customerName: string
  depositAmount: number
  id: string
  locationId: string
  locationName: string
  paidAt: string | null
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  serviceName: string
  studioId: string
  transactionReference: string | null
  updatedAt: string
}

export interface PaymentUpsertPayload {
  amount: number
  appointmentId: string
  depositAmount: number
  paidAt: string | null
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  transactionReference: string
}

export interface NotificationRecord {
  actionUrl: string | null
  appointmentId: string | null
  createdAt: string
  id: string
  isRead: boolean
  message: string
  title: string
  type: NotificationType
}

export interface NotificationUnreadCountRecord {
  unreadCount: number
}

export interface AuditLogRecord {
  actionType: AuditActionType
  actorName: string
  actorRole: 'ADMIN' | 'STAFF' | 'RECEPTIONIST' | 'CUSTOMER' | null
  createdAt: string
  description: string
  entityId: string | null
  entityType: AuditEntityType
  id: string
  locationId: string | null
  locationName: string | null
  metadataJson: string | null
  studioId: string
  title: string
}

export interface ConsentFormTemplateRecord {
  content: string
  createdAt: string
  description: string | null
  id: string
  isActive: boolean
  studioId: string
  studioName: string | null
  title: string
  updatedAt: string
}

export interface ConsentFormTemplateUpsertPayload {
  content: string
  description: string
  isActive?: boolean
  studioId: string
  title: string
}

export interface ConsentFormSubmissionRecord {
  appointmentDate: string | null
  appointmentId: string | null
  appointmentStartTime: string | null
  createdAt: string
  customerName: string
  customerProfileId: string
  id: string
  serviceName: string | null
  signatureImageUrl: string | null
  signedAt: string | null
  status: ConsentFormStatus
  studioId: string
  templateId: string
  templateTitle: string
  updatedAt: string
}

export interface ConsentFormSubmissionUpsertPayload {
  appointmentId: string | null
  customerProfileId: string
  signatureImageUrl: string
  signedAt: string | null
  status: ConsentFormStatus
  studioId: string
  templateId: string
}

export interface AnalyticsOverviewRecord {
  activeServices: number
  cancelledAppointments: number
  completedAppointments: number
  noShowAppointments: number
  totalAppointments: number
  totalClients: number
  totalDeposits: number
  totalRevenue: number
}

export interface RevenueTrendPointRecord {
  date: string
  deposits: number
  revenue: number
}

export interface RevenueAnalyticsRecord {
  paidCount: number
  pendingCount: number
  totalDeposits: number
  totalRevenue: number
  trend: RevenueTrendPointRecord[]
}

export interface AppointmentStatusMetricRecord {
  count: number
  status: AppointmentStatus
}

export interface AppointmentAnalyticsRecord {
  bookingsTotal: number
  cancelledTotal: number
  completedTotal: number
  noShowTotal: number
  statusBreakdown: AppointmentStatusMetricRecord[]
  upcomingTotal: number
}

export interface ServiceAnalyticsItemRecord {
  bookingCount: number
  category: ServiceCategory | null
  serviceId: string
  serviceName: string
  totalRevenue: number
}

export interface ServiceAnalyticsRecord {
  topServices: ServiceAnalyticsItemRecord[]
}

export interface PublicBookableServiceRecord {
  category: ServiceCategory
  depositAmount: number
  depositRequired: boolean
  description: string | null
  durationMinutes: number
  id: string
  name: string
  price: number
}

export interface PublicBookingLocationRecord {
  id: string
  name: string
  slug: string
}

export interface PublicBookingServicesRecord {
  locations: PublicBookingLocationRecord[]
  services: PublicBookableServiceRecord[]
  studioId: string
  studioSlug: string
  studioName: string
  timezone: string
}

export interface PublicBookableStaffRecord {
  avatarUrl: string | null
  bio: string | null
  displayName: string
  id: string
  jobTitle: string | null
  locationId: string | null
}

export interface PublicBookingStaffRecord {
  locationId: string
  serviceId: string
  staff: PublicBookableStaffRecord[]
  studioId: string
  studioSlug: string
}

export interface PublicBookingSlotRecord {
  endTime: string
  label: string
  startTime: string
}

export interface PublicBookingAvailabilityRecord {
  date: string
  locationId: string
  serviceId: string
  slots: PublicBookingSlotRecord[]
  staffProfileId: string
  studioId: string
  studioSlug: string
}

export interface PublicBookingCreatePayload {
  appointmentDate: string
  email: string
  fullName: string
  locationId: string
  notes: string
  phone: string
  serviceId: string
  staffProfileId: string
  startTime: string
  studioId: string
}

export interface PublicBookingConfirmationRecord {
  appointmentDate: string
  appointmentId: string
  bookingReference: string
  customerEmail: string | null
  customerName: string
  customerPhone: string | null
  depositAmount: number | null
  depositRequired: boolean
  endTime: string
  locationId: string
  locationName: string
  serviceName: string
  staffName: string
  startTime: string
  status: AppointmentStatus
  studioId: string
  studioSlug: string
  studioName: string
}

export interface PublicBookingLookupPayload {
  bookingReference: string
  email: string
  phone: string
}

export interface PublicBookingLookupRecord {
  manageToken: string
  bookingReference: string
  appointmentId: string
  locationId: string
  locationName: string
  studioId: string
  studioSlug: string
  studioName: string
  serviceId: string
  serviceName: string
  staffProfileId: string
  staffName: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  appointmentDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
}

export interface PublicBookingCancelPayload {
  manageToken: string
}

export interface PublicBookingReschedulePayload {
  manageToken: string
  appointmentDate: string
  startTime: string
}

export interface PublicBookingManageRecord {
  message: string
  bookingReference: string
  appointmentId: string
  locationId: string
  locationName: string
  studioId: string
  studioSlug: string
  studioName: string
  customerName: string
  serviceName: string
  staffName: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
}
