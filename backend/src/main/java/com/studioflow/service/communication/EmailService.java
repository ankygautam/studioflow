package com.studioflow.service.communication;

import com.studioflow.dto.communication.EmailMessage;
import com.studioflow.dto.communication.DeliveryAttemptResult;

public interface EmailService {

    DeliveryAttemptResult send(EmailMessage emailMessage);
}
