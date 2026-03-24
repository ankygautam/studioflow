package com.studioflow.service.communication;

import com.studioflow.dto.communication.SmsMessage;
import com.studioflow.dto.communication.DeliveryAttemptResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NoopSmsService implements SmsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NoopSmsService.class);

    private final String reason;

    public NoopSmsService(String reason) {
        this.reason = reason;
        LOGGER.info("Using no-op SMS delivery. {}", reason);
    }

    @Override
    public DeliveryAttemptResult send(SmsMessage smsMessage) {
        LOGGER.debug("Skipping SMS delivery because the channel is disabled. {}", reason);
        return DeliveryAttemptResult.skipped(reason);
    }
}
