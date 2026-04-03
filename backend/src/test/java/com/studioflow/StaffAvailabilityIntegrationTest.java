package com.studioflow;

import com.studioflow.entity.Availability;
import com.studioflow.entity.StaffProfile;
import com.studioflow.repository.AvailabilityRepository;
import com.studioflow.repository.StaffProfileRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StaffAvailabilityIntegrationTest extends ApiIntegrationTestSupport {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private StaffProfileRepository staffProfileRepository;

    @Test
    void receptionistCannotCreateAppointmentOutsideStaffWeeklyAvailability() throws Exception {
        String token = loginAsReceptionist();
        LocalDate scheduledDate = LocalDate.now().plusDays(4);
        StaffProfile staffProfile = staffProfileRepository.findById(java.util.UUID.fromString(STAFF_ID)).orElseThrow();

        Availability availability = new Availability();
        availability.setStaffProfile(staffProfile);
        availability.setDayOfWeek(scheduledDate.getDayOfWeek().getValue());
        availability.setStartTime(LocalTime.of(12, 0));
        availability.setEndTime(LocalTime.of(17, 0));
        availability.setIsAvailable(true);
        Availability savedAvailability = availabilityRepository.save(availability);

        try {
            mockMvc.perform(post("/api/appointments")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "studioId": "%s",
                          "locationId": "%s",
                          "customerProfileId": "%s",
                          "staffProfileId": "%s",
                          "serviceId": "%s",
                          "appointmentDate": "%s",
                          "startTime": "09:00:00",
                          "endTime": "10:00:00",
                          "status": "BOOKED",
                          "notes": "Outside weekly availability",
                          "source": "ADMIN_CREATED"
                        }
                        """.formatted(STUDIO_ID, LOCATION_ID, CLIENT_ID, STAFF_ID, SERVICE_ID, scheduledDate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The selected staff member is unavailable during this time."));
        } finally {
            availabilityRepository.deleteById(savedAvailability.getId());
        }
    }
}
