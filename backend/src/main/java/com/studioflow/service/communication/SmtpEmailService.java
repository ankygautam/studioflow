package com.studioflow.service.communication;

import com.studioflow.config.communication.CommunicationProperties;
import com.studioflow.dto.communication.DeliveryAttemptResult;
import com.studioflow.dto.communication.EmailMessage;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

public class SmtpEmailService implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender javaMailSender;
    private final CommunicationProperties communicationProperties;

    public SmtpEmailService(
        JavaMailSender javaMailSender,
        CommunicationProperties communicationProperties
    ) {
        this.javaMailSender = javaMailSender;
        this.communicationProperties = communicationProperties;
    }

    @Override
    public DeliveryAttemptResult send(EmailMessage emailMessage) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            helper.setTo(emailMessage.to());
            helper.setSubject(emailMessage.subject());
            helper.setText(emailMessage.body(), false);
            helper.setFrom(new InternetAddress(
                communicationProperties.getEmail().getFromAddress(),
                communicationProperties.getEmail().getFromName()
            ).toString());

            javaMailSender.send(mimeMessage);
            return DeliveryAttemptResult.sent();
        } catch (Exception exception) {
            LOGGER.warn("Email delivery failed for {}: {}", maskTarget(emailMessage.to()), exception.getMessage());
            return DeliveryAttemptResult.failed(exception.getMessage());
        }
    }

    private String maskTarget(String value) {
        int atIndex = value.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }

        return value.charAt(0) + "***" + value.substring(atIndex);
    }
}
