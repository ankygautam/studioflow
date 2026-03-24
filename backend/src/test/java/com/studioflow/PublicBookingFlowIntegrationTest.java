package com.studioflow;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicBookingFlowIntegrationTest extends ApiIntegrationTestSupport {

    @Test
    void publicBookingEndpointsSupportAvailabilitySubmitAndLookup() throws Exception {
        mockMvc.perform(get("/api/public/booking/{studioSlug}/services", STUDIO_SLUG))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.studioName").value("StudioFlow HQ"))
            .andExpect(jsonPath("$.locations[0].slug").isNotEmpty());

        mockMvc.perform(get("/api/public/booking/{studioSlug}/staff", STUDIO_SLUG)
                .param("serviceId", SERVICE_ID)
                .param("locationId", LOCATION_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.staff[0].displayName").isNotEmpty());

        MvcResult availabilityResult = mockMvc.perform(get("/api/public/booking/{studioSlug}/availability", STUDIO_SLUG)
                .param("locationId", LOCATION_ID)
                .param("serviceId", SERVICE_ID)
                .param("staffProfileId", STAFF_ID)
                .param("date", tomorrow.toString()))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode availabilityJson = readJson(availabilityResult);
        assertThat(availabilityJson.path("slots").isArray()).isTrue();
        assertThat(availabilityJson.path("slots")).isNotEmpty();
        String startTime = availabilityJson.path("slots").get(0).path("startTime").asText();

        String email = "public+" + System.nanoTime() + "@example.com";

        MvcResult submitResult = mockMvc.perform(post("/api/public/booking/{studioSlug}/submit", STUDIO_SLUG)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "studioId": "%s",
                      "locationId": "%s",
                      "serviceId": "%s",
                      "staffProfileId": "%s",
                      "appointmentDate": "%s",
                      "startTime": "%s",
                      "fullName": "Public Flow Customer",
                      "email": "%s",
                      "phone": "(555) 555-9090",
                      "notes": "Smoke booking request."
                    }
                    """.formatted(STUDIO_ID, LOCATION_ID, SERVICE_ID, STAFF_ID, tomorrow, startTime, email)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookingReference").isNotEmpty())
            .andExpect(jsonPath("$.locationName").value("Downtown Atelier"))
            .andReturn();

        String bookingReference = readJson(submitResult).path("bookingReference").asText();

        mockMvc.perform(post("/api/public/booking/{studioSlug}/lookup", STUDIO_SLUG)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "bookingReference": "%s",
                      "email": "%s",
                      "phone": "(555) 555-9090"
                    }
                    """.formatted(bookingReference, email)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bookingReference").value(bookingReference))
            .andExpect(jsonPath("$.manageToken").isNotEmpty());
    }
}
