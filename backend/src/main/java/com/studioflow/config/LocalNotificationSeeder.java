package com.studioflow.config;

import com.studioflow.entity.Appointment;
import com.studioflow.entity.Notification;
import com.studioflow.entity.User;
import com.studioflow.enums.NotificationType;
import com.studioflow.enums.UserRole;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.NotificationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"local", "staging"})
@RequiredArgsConstructor
public class LocalNotificationSeeder {

    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final UserRepository userRepository;

    @Bean
    CommandLineRunner seedLocalNotifications() {
        return (args) -> {
            if (notificationRepository.count() > 0) {
                return;
            }

            Appointment appointment = appointmentRepository.findAll().stream().findFirst().orElse(null);
            if (appointment == null) {
                return;
            }

            appointment = appointmentRepository.findDetailedById(appointment.getId()).orElse(appointment);

            List<User> internalUsers = staffProfileRepository.findByStudioId(appointment.getStudio().getId()).stream()
                .map((staffProfile) -> staffProfile.getUser())
                .filter(Objects::nonNull)
                .map((user) -> userRepository.findById(user.getId()).orElse(null))
                .filter((user) -> user != null && user.getRole() != UserRole.CUSTOMER)
                .distinct()
                .toList();

            for (User user : internalUsers) {
                notificationRepository.save(createNotification(
                    appointment,
                    user,
                    NotificationType.APPOINTMENT_CREATED,
                    "New appointment booked",
                    appointment.getCustomerProfile().getFullName() + " booked " + appointment.getService().getName() + ".",
                    "/appointments",
                    false
                ));

                notificationRepository.save(createNotification(
                    appointment,
                    user,
                    NotificationType.PAYMENT_PENDING,
                    "Deposit still pending",
                    appointment.getCustomerProfile().getFullName() + " still has a pending payment record.",
                    "/payments",
                    true
                ));
            }
        };
    }

    private Notification createNotification(
        Appointment appointment,
        User user,
        NotificationType type,
        String title,
        String message,
        String actionUrl,
        boolean isRead
    ) {
        Notification notification = new Notification();
        notification.setStudio(appointment.getStudio());
        notification.setUser(user);
        notification.setAppointment(appointment);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setIsRead(isRead);
        return notification;
    }
}
