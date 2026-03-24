package com.studioflow;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OperationalApiSmokeTest extends ApiIntegrationTestSupport {

    @Test
    void adminCanRunServicesCrudFlow() throws Exception {
        String token = loginAsAdmin();
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        MvcResult createResult = mockMvc.perform(post("/api/services")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "studioId": "%s",
                      "name": "Smoke Service %s",
                      "category": "CONSULTATION",
                      "description": "Short validation service.",
                      "durationMinutes": 45,
                      "price": 80.00,
                      "depositRequired": false,
                      "depositAmount": 0.00,
                      "isActive": true
                    }
                    """.formatted(STUDIO_ID, suffix)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Smoke Service " + suffix))
            .andReturn();

        String serviceId = readJson(createResult).path("id").asText();

        mockMvc.perform(put("/api/services/{id}", serviceId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "studioId": "%s",
                      "name": "Smoke Service %s Updated",
                      "category": "CONSULTATION",
                      "description": "Updated validation service.",
                      "durationMinutes": 60,
                      "price": 95.00,
                      "depositRequired": true,
                      "depositAmount": 20.00,
                      "isActive": true
                    }
                    """.formatted(STUDIO_ID, suffix)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.depositRequired").value(true));

        mockMvc.perform(delete("/api/services/{id}", serviceId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());
    }

    @Test
    void receptionistCanManageAppointmentsAndPayments() throws Exception {
        String token = loginAsReceptionist();
        String appointmentNotes = "Smoke appointment " + UUID.randomUUID().toString().substring(0, 8);

        MvcResult appointmentCreateResult = mockMvc.perform(post("/api/appointments")
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
                      "notes": "%s",
                      "source": "ADMIN_CREATED"
                    }
                    """.formatted(STUDIO_ID, LOCATION_ID, CLIENT_ID, STAFF_ID, SERVICE_ID, tomorrow, appointmentNotes)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.locationId").value(LOCATION_ID))
            .andReturn();

        String appointmentId = readJson(appointmentCreateResult).path("id").asText();

        mockMvc.perform(put("/api/appointments/{id}", appointmentId)
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
                      "startTime": "09:30:00",
                      "endTime": "10:30:00",
                      "status": "CONFIRMED",
                      "notes": "%s updated",
                      "source": "ADMIN_CREATED"
                    }
                    """.formatted(STUDIO_ID, LOCATION_ID, CLIENT_ID, STAFF_ID, SERVICE_ID, tomorrow, appointmentNotes)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMED"));

        MvcResult paymentCreateResult = mockMvc.perform(post("/api/payments")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "appointmentId": "%s",
                      "amount": 100.00,
                      "depositAmount": 20.00,
                      "paymentStatus": "PENDING",
                      "paymentMethod": "CARD",
                      "transactionReference": "SMOKE-%s",
                      "paidAt": null
                    }
                    """.formatted(appointmentId, UUID.randomUUID().toString().substring(0, 8))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
            .andReturn();

        String paymentId = readJson(paymentCreateResult).path("id").asText();

        mockMvc.perform(put("/api/payments/{id}", paymentId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "appointmentId": "%s",
                      "amount": 100.00,
                      "depositAmount": 20.00,
                      "paymentStatus": "PAID",
                      "paymentMethod": "CARD",
                      "transactionReference": "SMOKE-PAID",
                      "paidAt": "2026-03-24T12:00:00Z"
                    }
                    """.formatted(appointmentId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        mockMvc.perform(delete("/api/payments/{id}", paymentId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/appointments/{id}", appointmentId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());
    }

    @Test
    void staffCanReadNotificationsButCannotAccessFullAuditLogs() throws Exception {
        String staffToken = loginAsStaff();

        mockMvc.perform(get("/api/notifications")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + staffToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/audit-logs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + staffToken))
            .andExpect(status().isForbidden());

        String adminToken = loginAsAdmin();
        mockMvc.perform(get("/api/audit-logs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
            .andExpect(status().isOk());
    }
}
