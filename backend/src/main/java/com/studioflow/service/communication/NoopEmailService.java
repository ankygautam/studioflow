package com.studioflow.service.communication;

import com.studioflow.dto.communication.EmailMessage;
import com.studioflow.dto.communication.DeliveryAttemptResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NoopEmailService implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NoopEmailService.class);

    private final String reason;

    public NoopEmailService(String reason) {
        this.reason = reason;
        LOGGER.info("Using no-op email delivery. {}", reason);
    }

    @Override
    public DeliveryAttemptResult send(EmailMessage emailMessage) {
        LOGGER.debug("Skipping email delivery because the channel is disabled. {}", reason);
        return DeliveryAttemptResult.skipped(reason);
    }
}
