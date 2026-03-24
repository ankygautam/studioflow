package com.studioflow.service.communication;

import com.studioflow.dto.communication.SmsMessage;
import com.studioflow.dto.communication.DeliveryAttemptResult;

public interface SmsService {

    DeliveryAttemptResult send(SmsMessage smsMessage);
}
