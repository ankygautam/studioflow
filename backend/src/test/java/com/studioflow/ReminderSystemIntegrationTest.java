package com.studioflow;

import com.fasterxml.jackson.databind.JsonNode;
import com.studioflow.dto.settings.ReminderDispatchResponse;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CommunicationLog;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Location;
import com.studioflow.entity.Notification;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AppointmentSource;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.CommunicationEventType;
import com.studioflow.enums.NotificationType;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CommunicationLogRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.NotificationRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.NotificationService;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReminderSystemIntegrationTest extends ApiIntegrationTestSupport {

    private static final ZoneId STUDIO_ZONE = ZoneId.of("America/Edmonton");

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private CommunicationLogRepository communicationLogRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private StaffProfileRepository staffProfileRepository;

    @Autowired
    private StudioRepository studioRepository;

    private final List<UUID> createdAppointmentIds = new ArrayList<>();

    @BeforeEach
    void resetReminderFixtures() {
        communicationLogRepository.deleteAll();
        notificationRepository.deleteAll();
        createdAppointmentIds.clear();
        saveReminderSettings(true, List.of(24), true, true, true);
    }

    @AfterEach
    void cleanupReminderFixtures() {
        for (UUID appointmentId : createdAppointmentIds) {
            communicationLogRepository.deleteByAppointmentId(appointmentId);
            notificationRepository.deleteByAppointmentId(appointmentId);
            appointmentRepository.findById(appointmentId).ifPresent(appointmentRepository::delete);
        }
        createdAppointmentIds.clear();
        saveReminderSettings(true, List.of(24), true, true, true);
    }

    @Test
    void manualSweepGeneratesReminderBatchesForDifferentConfiguredOffsets() throws Exception {
        saveReminderSettings(true, List.of(24, 4), true, false, false);
        String adminToken = loginAsAdmin();

        UUID dayBeforeAppointmentId = createAppointment(dueDateTimeForOffset(24), "Reminder offset 24h");
        UUID sameDayAppointmentId = createAppointment(dueDateTimeForOffset(4), "Reminder offset 4h");

        MvcResult result = mockMvc.perform(post("/api/settings/reminders/dispatch-now")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .param("studioId", STUDIO_ID))
            .andExpect(status().isOk())
            .andReturn();

        ReminderDispatchResponse response = objectMapper.readValue(
            result.getResponse().getContentAsString(),
            ReminderDispatchResponse.class
        );

        assertThat(response.dispatchedCount()).isEqualTo(2);
        assertThat(response.reminderOffsetsHours()).containsExactly(24, 4);

        List<Notification> reminderNotifications = findReminderNotificationsForAppointments(dayBeforeAppointmentId, sameDayAppointmentId);
        assertThat(reminderNotifications)
            .extracting(Notification::getReminderOffsetHours)
            .contains(24, 4);
        assertThat(findReminderLogsForAppointment(dayBeforeAppointmentId)).isEmpty();
        assertThat(findReminderLogsForAppointment(sameDayAppointmentId)).isEmpty();
    }

    @Test
    void reminderDedupeIsScopedByOffset() throws Exception {
        saveReminderSettings(true, List.of(24, 4), true, false, false);
        UUID appointmentId = createAppointment(dueDateTimeForOffset(24), "Reminder dedupe scope");
        Appointment appointment = appointmentRepository.findDetailedById(appointmentId).orElseThrow();
        Instant duplicateThreshold = Instant.now().minusSeconds(60L * 90L);

        boolean firstDayBefore = notificationService.notifyAppointmentReminder(appointment, 24, duplicateThreshold);
        boolean duplicateDayBefore = notificationService.notifyAppointmentReminder(appointment, 24, duplicateThreshold);
        boolean sameAppointmentSoon = notificationService.notifyAppointmentReminder(appointment, 4, duplicateThreshold);

        assertThat(firstDayBefore).isTrue();
        assertThat(duplicateDayBefore).isFalse();
        assertThat(sameAppointmentSoon).isTrue();

        List<Notification> reminderNotifications = findReminderNotificationsForAppointments(appointmentId);
        assertThat(reminderNotifications)
            .extracting(Notification::getReminderOffsetHours)
            .containsExactlyInAnyOrder(24, 24, 24, 4, 4, 4);
        assertThat(reminderNotifications.stream()
            .filter((notification) -> notification.getReminderOffsetHours() == 24)
            .toList()).hasSize(3);
        assertThat(reminderNotifications.stream()
            .filter((notification) -> notification.getReminderOffsetHours() == 4)
            .toList()).hasSize(3);
    }

    @Test
    void channelTogglesPreventDisabledReminderDeliveryPaths() throws Exception {
        saveReminderSettings(true, List.of(4), false, true, false);
        UUID appointmentId = createAppointment(dueDateTimeForOffset(4), "Reminder channel controls");
        Appointment appointment = appointmentRepository.findDetailedById(appointmentId).orElseThrow();

        boolean triggered = notificationService.notifyAppointmentReminder(
            appointment,
            4,
            Instant.now().minusSeconds(60L * 90L)
        );

        assertThat(triggered).isTrue();
        assertThat(findReminderNotificationsForAppointments(appointmentId)).isEmpty();

        List<CommunicationLog> reminderLogs = findReminderLogsForAppointment(appointmentId);
        assertThat(reminderLogs).hasSize(1);
        assertThat(reminderLogs.get(0).getChannel().name()).isEqualTo("EMAIL");
        assertThat(reminderLogs.get(0).getReminderOffsetHours()).isEqualTo(4);
    }

    @Test
    void manualSweepRespectsReminderSettingsWhenAllChannelsAreDisabled() throws Exception {
        saveReminderSettings(true, List.of(4), false, false, false);
        String adminToken = loginAsAdmin();
        UUID appointmentId = createAppointment(dueDateTimeForOffset(4), "Reminder channels disabled");

        MvcResult result = mockMvc.perform(post("/api/settings/reminders/dispatch-now")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .param("studioId", STUDIO_ID))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode response = readJson(result);
        assertThat(response.path("dispatchedCount").asLong()).isZero();
        assertThat(findReminderNotificationsForAppointments(appointmentId)).isEmpty();
        assertThat(findReminderLogsForAppointment(appointmentId)).isEmpty();
    }

    private UUID createAppointment(LocalDateTime appointmentDateTime, String notes) {
        Studio studio = studioRepository.findById(UUID.fromString(STUDIO_ID)).orElseThrow();
        Location location = locationRepository.findById(UUID.fromString(LOCATION_ID)).orElseThrow();
        CustomerProfile customerProfile = customerProfileRepository.findById(UUID.fromString(CLIENT_ID)).orElseThrow();
        StaffProfile staffProfile = staffProfileRepository.findById(UUID.fromString(STAFF_ID)).orElseThrow();
        Service service = serviceRepository.findById(UUID.fromString(SERVICE_ID)).orElseThrow();

        Appointment appointment = new Appointment();
        appointment.setStudio(studio);
        appointment.setLocation(location);
        appointment.setCustomerProfile(customerProfile);
        appointment.setStaffProfile(staffProfile);
        appointment.setService(service);
        appointment.setAppointmentDate(appointmentDateTime.toLocalDate());
        appointment.setStartTime(appointmentDateTime.toLocalTime());
        appointment.setEndTime(appointmentDateTime.toLocalTime().plusHours(1));
        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setBookingReference("REM-" + UUID.randomUUID().toString().substring(0, 8));
        appointment.setNotes(notes);
        appointment.setSource(AppointmentSource.ADMIN_CREATED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        createdAppointmentIds.add(savedAppointment.getId());
        return savedAppointment.getId();
    }

    private LocalDateTime dueDateTimeForOffset(int offsetHours) {
        return LocalDateTime.now(STUDIO_ZONE)
            .plusHours(offsetHours)
            .minusMinutes(10)
            .withSecond(0)
            .withNano(0);
    }

    private List<Notification> findReminderNotificationsForAppointments(UUID... appointmentIds) {
        List<UUID> ids = List.of(appointmentIds);
        return notificationRepository.findByStudioId(UUID.fromString(STUDIO_ID)).stream()
            .filter((notification) -> notification.getType() == NotificationType.APPOINTMENT_REMINDER)
            .filter((notification) -> notification.getAppointment() != null)
            .filter((notification) -> ids.contains(notification.getAppointment().getId()))
            .toList();
    }

    private List<CommunicationLog> findReminderLogsForAppointment(UUID appointmentId) {
        return communicationLogRepository.findAll().stream()
            .filter((communicationLog) -> communicationLog.getAppointment() != null)
            .filter((communicationLog) -> appointmentId.equals(communicationLog.getAppointment().getId()))
            .filter((communicationLog) -> communicationLog.getEventType() == CommunicationEventType.APPOINTMENT_REMINDER)
            .toList();
    }

    private void saveReminderSettings(
        boolean remindersEnabled,
        List<Integer> reminderOffsets,
        boolean inAppEnabled,
        boolean emailEnabled,
        boolean smsEnabled
    ) {
        Studio studio = studioRepository.findById(UUID.fromString(STUDIO_ID)).orElseThrow();
        studio.setAppointmentReminderEnabled(remindersEnabled);
        studio.setAppointmentReminderHoursBefore(reminderOffsets.get(0));
        studio.setAppointmentReminderOffsetsCsv(reminderOffsets.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(",")));
        studio.setAppointmentReminderInAppEnabled(inAppEnabled);
        studio.setAppointmentReminderEmailEnabled(emailEnabled);
        studio.setAppointmentReminderSmsEnabled(smsEnabled);
        studioRepository.save(studio);
    }
}
