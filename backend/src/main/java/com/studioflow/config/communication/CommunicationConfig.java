package com.studioflow.config.communication;

import com.studioflow.service.communication.EmailService;
import com.studioflow.service.communication.NoopEmailService;
import com.studioflow.service.communication.NoopSmsService;
import com.studioflow.service.communication.SmsService;
import com.studioflow.service.communication.SmtpEmailService;
import com.studioflow.service.communication.TwilioSmsService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
@EnableConfigurationProperties(CommunicationProperties.class)
public class CommunicationConfig {

    @Bean
    EmailService emailService(
        CommunicationProperties communicationProperties,
        JavaMailSender javaMailSender
    ) {
        if (!communicationProperties.getEmail().isEnabled()) {
            return new NoopEmailService("Email delivery is disabled.");
        }

        if (isBlank(communicationProperties.getEmail().getFromAddress())) {
            return new NoopEmailService("Email delivery is enabled, but no from-address is configured.");
        }

        return new SmtpEmailService(javaMailSender, communicationProperties);
    }

    @Bean
    SmsService smsService(CommunicationProperties communicationProperties) {
        if (!communicationProperties.getSms().isEnabled()) {
            return new NoopSmsService("SMS delivery is disabled.");
        }

        if (isBlank(communicationProperties.getSms().getFromNumber())
            || isBlank(communicationProperties.getSms().getAccountSid())
            || isBlank(communicationProperties.getSms().getAuthToken())) {
            return new NoopSmsService("SMS delivery is enabled, but Twilio credentials are incomplete.");
        }

        return new TwilioSmsService(communicationProperties);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
