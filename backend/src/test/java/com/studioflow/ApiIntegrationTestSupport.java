package com.studioflow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
abstract class ApiIntegrationTestSupport {

    protected static final String STUDIO_ID = "11111111-1111-1111-1111-111111111111";
    protected static final String LOCATION_ID = "12121212-1212-1212-1212-121212121212";
    protected static final String SECOND_LOCATION_ID = "13131313-1313-1313-1313-131313131313";
    protected static final String CLIENT_ID = "44444444-4444-4444-4444-444444444441";
    protected static final String STAFF_ID = "33333333-3333-3333-3333-333333333331";
    protected static final String SERVICE_ID = "55555555-5555-5555-5555-555555555551";
    protected static final String APPOINTMENT_ID = "66666666-6666-6666-6666-666666666661";
    protected static final String PAYMENT_ID = "77777777-7777-7777-7777-777777777771";
    protected static final String STUDIO_SLUG = "studioflow-hq";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected LocalDate tomorrow;

    @BeforeEach
    void setUpSupportDates() {
        tomorrow = LocalDate.now().plusDays(1);
    }

    protected String loginAsAdmin() throws Exception {
        return login("admin@studioflow.co", "password123");
    }

    protected String loginAsReceptionist() throws Exception {
        return login("receptionist@studioflow.co", "password123");
    }

    protected String loginAsStaff() throws Exception {
        return login("staff@studioflow.co", "password123");
    }

    protected String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "%s"
                    }
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andReturn();

        return readJson(result).path("token").asText();
    }

    protected JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
