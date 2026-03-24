package com.studioflow.service.communication;

import com.studioflow.config.communication.CommunicationProperties;
import com.studioflow.dto.communication.DeliveryAttemptResult;
import com.studioflow.dto.communication.SmsMessage;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TwilioSmsService implements SmsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TwilioSmsService.class);

    private final CommunicationProperties communicationProperties;
    private final HttpClient httpClient;

    public TwilioSmsService(CommunicationProperties communicationProperties) {
        this.communicationProperties = communicationProperties;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public DeliveryAttemptResult send(SmsMessage smsMessage) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/"
                    + communicationProperties.getSms().getAccountSid()
                    + "/Messages.json"))
                .header("Authorization", "Basic " + buildBasicAuth())
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(buildBody(smsMessage)))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return DeliveryAttemptResult.sent();
            }

            LOGGER.warn("SMS delivery failed for {} with status {}", smsMessage.to(), response.statusCode());
            return DeliveryAttemptResult.failed("HTTP " + response.statusCode());
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            LOGGER.warn("SMS delivery failed for {}: {}", smsMessage.to(), exception.getMessage());
            return DeliveryAttemptResult.failed(exception.getMessage());
        }
    }

    private String buildBasicAuth() {
        String credentials = communicationProperties.getSms().getAccountSid() + ":" + communicationProperties.getSms().getAuthToken();
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private String buildBody(SmsMessage smsMessage) {
        return "To=" + encode(smsMessage.to())
            + "&From=" + encode(communicationProperties.getSms().getFromNumber())
            + "&Body=" + encode(smsMessage.body());
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
