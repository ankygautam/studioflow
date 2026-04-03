package com.studioflow.service;

import com.studioflow.dto.notification.NotificationResponse;
import com.studioflow.dto.notification.NotificationUnreadCountResponse;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.ConsentFormSubmission;
import com.studioflow.entity.Notification;
import com.studioflow.entity.Payment;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.ConsentFormStatus;
import com.studioflow.enums.NotificationType;
import com.studioflow.enums.PaymentStatus;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.NotificationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.service.communication.NotificationDeliveryService;
import com.studioflow.service.auth.CurrentUserService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d");
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Edmonton");

    private final CurrentUserService currentUserService;
    private final NotificationRepository notificationRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final NotificationDeliveryService notificationDeliveryService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(boolean unreadOnly, Integer limit) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);

        UUID currentUserId = currentUserService.getCurrentUserId();
        int safeLimit = limit == null || limit < 1 ? 20 : Math.min(limit, 50);
        List<Notification> notifications = unreadOnly
            ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUserId, PageRequest.of(0, safeLimit))
            : notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUserId, PageRequest.of(0, safeLimit));

        return notifications.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadCount() {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(currentUserService.getCurrentUserId());
        return new NotificationUnreadCountResponse(unreadCount);
    }

    public NotificationResponse markAsRead(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);

        Notification notification = notificationRepository.findByIdAndUserId(id, currentUserService.getCurrentUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead() {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);

        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(currentUserService.getCurrentUserId());
        unreadNotifications.forEach((notification) -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void notifyAppointmentCreated(Appointment appointment) {
        createStudioNotification(
            appointment,
            NotificationType.APPOINTMENT_CREATED,
            "New appointment booked",
            appointment.getCustomerProfile().getFullName() + " booked " + appointment.getService().getName() + " for " + formatDate(appointment.getAppointmentDate()) + ".",
            "/appointments"
        );
        notificationDeliveryService.sendBookingConfirmation(appointment);
    }

    public void notifyAppointmentUpdated(
        Appointment appointment,
        LocalDate previousDate,
        java.time.LocalTime previousStartTime,
        java.time.LocalTime previousEndTime,
        com.studioflow.enums.AppointmentStatus previousStatus,
        UUID previousCustomerId,
        UUID previousLocationId,
        UUID previousStaffId,
        UUID previousServiceId
    ) {
        if (handleAppointmentScheduleNotification(appointment, previousDate, previousStartTime, previousStatus)) {
            return;
        }

        boolean meaningfulUpdate =
            !appointment.getEndTime().equals(previousEndTime)
                || !appointment.getCustomerProfile().getId().equals(previousCustomerId)
                || !appointment.getLocation().getId().equals(previousLocationId)
                || !appointment.getStaffProfile().getId().equals(previousStaffId)
                || !appointment.getService().getId().equals(previousServiceId)
                || previousStatus != appointment.getStatus();

        if (!meaningfulUpdate) {
            return;
        }

        createStudioNotification(
            appointment,
            NotificationType.APPOINTMENT_UPDATED,
            "Appointment updated",
            appointment.getCustomerProfile().getFullName()
                + "'s "
                + appointment.getService().getName()
                + " booking was updated for "
                + formatDate(appointment.getAppointmentDate())
                + " at "
                + appointment.getStartTime()
                + ".",
            "/appointments"
        );
    }

    public void notifyAppointmentUpdated(
        Appointment appointment,
        LocalDate previousDate,
        java.time.LocalTime previousStartTime,
        com.studioflow.enums.AppointmentStatus previousStatus
    ) {
        handleAppointmentScheduleNotification(appointment, previousDate, previousStartTime, previousStatus);
    }

    private boolean handleAppointmentScheduleNotification(
        Appointment appointment,
        LocalDate previousDate,
        java.time.LocalTime previousStartTime,
        com.studioflow.enums.AppointmentStatus previousStatus
    ) {
        if (appointment.getStatus() == com.studioflow.enums.AppointmentStatus.CANCELLED
            && previousStatus != com.studioflow.enums.AppointmentStatus.CANCELLED) {
            createStudioNotification(
                appointment,
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment cancelled",
                appointment.getCustomerProfile().getFullName() + " has a cancelled appointment on " + formatDate(appointment.getAppointmentDate()) + ".",
                "/appointments"
            );
            notificationDeliveryService.sendBookingCancelledConfirmation(appointment);
            return true;
        }

        boolean dateChanged = !appointment.getAppointmentDate().equals(previousDate);
        boolean timeChanged = !appointment.getStartTime().equals(previousStartTime);

        if (dateChanged || timeChanged) {
            createStudioNotification(
                appointment,
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment rescheduled",
                appointment.getCustomerProfile().getFullName() + " moved to " + formatDate(appointment.getAppointmentDate()) + " at " + appointment.getStartTime() + ".",
                "/appointments"
            );
            notificationDeliveryService.sendBookingRescheduledConfirmation(appointment);
            return true;
        }

        return false;
    }

    public boolean notifyAppointmentReminder(Appointment appointment) {
        return notifyAppointmentReminder(appointment, Instant.now().minusSeconds(60L * 60L * 12L));
    }

    public boolean notifyAppointmentReminder(Appointment appointment, Instant duplicateThreshold) {
        boolean created = createAppointmentReminderNotifications(appointment, duplicateThreshold);
        if (created) {
            notificationDeliveryService.sendAppointmentReminder(appointment);
        }
        return created;
    }

    @Transactional(readOnly = true)
    public boolean hasRecentReminderNotification(Appointment appointment, Instant threshold) {
        List<StaffProfile> staffProfiles = staffProfileRepository.findByStudioId(appointment.getStudio().getId());
        Map<UUID, User> recipients = resolveRecipients(staffProfiles, appointment, NotificationType.APPOINTMENT_REMINDER);

        return recipients.values().stream().anyMatch((user) ->
            notificationRepository.existsByUserIdAndAppointmentIdAndTypeAndCreatedAtAfter(
                user.getId(),
                appointment.getId(),
                NotificationType.APPOINTMENT_REMINDER,
                threshold
            )
        );
    }

    public void notifyPaymentSaved(Payment payment) {
        NotificationType type = payment.getPaymentStatus() == PaymentStatus.PENDING
            ? NotificationType.PAYMENT_PENDING
            : NotificationType.PAYMENT_RECORDED;

        String title = type == NotificationType.PAYMENT_PENDING ? "Payment still pending" : "Payment recorded";
        String message = payment.getAppointment().getCustomerProfile().getFullName()
            + " has a payment update for "
            + payment.getAppointment().getService().getName()
            + ".";

        createStudioNotification(payment.getAppointment(), type, title, message, "/payments");
    }

    public void notifyConsentSubmissionSaved(ConsentFormSubmission submission) {
        NotificationType type = submission.getStatus() == ConsentFormStatus.SIGNED
            ? NotificationType.CONSENT_SIGNED
            : NotificationType.CONSENT_PENDING;

        String title = type == NotificationType.CONSENT_SIGNED ? "Consent form signed" : "Consent form pending";
        String message = submission.getCustomerProfile().getFullName()
            + " has a "
            + submission.getTemplate().getTitle()
            + " update.";

        createStudioNotification(submission.getAppointment(), submission.getStudio().getId(), type, title, message, "/forms");
    }

    public void createStudioNotification(
        Appointment appointment,
        NotificationType type,
        String title,
        String message,
        String actionUrl
    ) {
        createStudioNotification(appointment, appointment != null ? appointment.getStudio().getId() : null, type, title, message, actionUrl);
    }

    private void createStudioNotification(
        Appointment appointment,
        UUID studioId,
        NotificationType type,
        String title,
        String message,
        String actionUrl
    ) {
        if (studioId == null) {
            return;
        }

        List<StaffProfile> staffProfiles = staffProfileRepository.findByStudioId(studioId);
        Studio studio = appointment != null
            ? appointment.getStudio()
            : staffProfiles.stream().findFirst().map(StaffProfile::getStudio).orElse(null);

        if (studio == null) {
            return;
        }

        Map<UUID, User> recipients = resolveRecipients(staffProfiles, appointment, type);

        List<Notification> notifications = recipients.values().stream()
            .map((user) -> buildNotification(studio, user, appointment, type, title, message, actionUrl))
            .toList();

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    private boolean createAppointmentReminderNotifications(Appointment appointment, Instant duplicateThreshold) {
        List<StaffProfile> staffProfiles = staffProfileRepository.findByStudioId(appointment.getStudio().getId());
        Map<UUID, User> recipients = resolveRecipients(staffProfiles, appointment, NotificationType.APPOINTMENT_REMINDER);

        if (recipients.isEmpty()) {
            return false;
        }

        String title = buildReminderTitle(appointment);
        String message = buildReminderMessage(appointment);

        List<Notification> notifications = recipients.values().stream()
            .filter((user) -> !notificationRepository.existsByUserIdAndAppointmentIdAndTypeAndCreatedAtAfter(
                user.getId(),
                appointment.getId(),
                NotificationType.APPOINTMENT_REMINDER,
                duplicateThreshold
            ))
            .map((user) -> buildNotification(
                appointment.getStudio(),
                user,
                appointment,
                NotificationType.APPOINTMENT_REMINDER,
                title,
                message,
                "/appointments"
            ))
            .toList();

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
            return true;
        }

        return false;
    }

    private Map<UUID, User> resolveRecipients(
        List<StaffProfile> staffProfiles,
        Appointment appointment,
        NotificationType type
    ) {
        Map<UUID, User> recipients = new LinkedHashMap<>();
        UUID assignedStaffUserId = appointment != null && appointment.getStaffProfile() != null && appointment.getStaffProfile().getUser() != null
            ? appointment.getStaffProfile().getUser().getId()
            : null;

        for (StaffProfile staffProfile : staffProfiles) {
            User user = staffProfile.getUser();
            if (user == null || user.getRole() == UserRole.CUSTOMER || !Boolean.TRUE.equals(user.getIsActive())) {
                continue;
            }

            boolean include = switch (type) {
                case APPOINTMENT_CREATED,
                    APPOINTMENT_UPDATED,
                    APPOINTMENT_RESCHEDULED,
                    APPOINTMENT_CANCELLED,
                    APPOINTMENT_REMINDER -> user.getRole() == UserRole.ADMIN
                        || user.getRole() == UserRole.RECEPTIONIST
                        || user.getId().equals(assignedStaffUserId);
                case PAYMENT_RECORDED,
                    PAYMENT_PENDING,
                    CONSENT_PENDING,
                    CONSENT_SIGNED -> user.getRole() == UserRole.ADMIN
                        || user.getRole() == UserRole.RECEPTIONIST;
            };

            if (include) {
                recipients.put(user.getId(), user);
            }
        }

        return recipients;
    }

    private Notification buildNotification(
        Studio studio,
        User user,
        Appointment appointment,
        NotificationType type,
        String title,
        String message,
        String actionUrl
    ) {
        Notification notification = new Notification();
        notification.setStudio(studio);
        notification.setUser(user);
        notification.setAppointment(appointment);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setIsRead(false);
        return notification;
    }

    private String buildReminderTitle(Appointment appointment) {
        java.time.LocalDateTime appointmentDateTime = java.time.LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        long hoursUntil = java.time.Duration.between(java.time.LocalDateTime.now(DEFAULT_ZONE), appointmentDateTime).toHours();
        return hoursUntil <= 4 ? "Appointment coming up soon" : "Tomorrow's appointment reminder";
    }

    private String buildReminderMessage(Appointment appointment) {
        return appointment.getCustomerProfile().getFullName()
            + " is booked for "
            + appointment.getService().getName()
            + " on "
            + formatDate(appointment.getAppointmentDate())
            + " at "
            + appointment.getStartTime()
            + ".";
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType(),
            Boolean.TRUE.equals(notification.getIsRead()),
            notification.getCreatedAt(),
            notification.getAppointment() != null ? notification.getAppointment().getId() : null,
            notification.getActionUrl()
        );
    }

    private String formatDate(LocalDate date) {
        return DATE_FORMATTER.format(date);
    }
}
