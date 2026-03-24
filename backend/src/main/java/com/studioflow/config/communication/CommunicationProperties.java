package com.studioflow.config.communication;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "studioflow.communication")
public class CommunicationProperties {

    private String publicBaseUrl;
    private final Email email = new Email();
    private final Sms sms = new Sms();
    private final Reminders reminders = new Reminders();

    @Getter
    @Setter
    public static class Email {
        private boolean enabled;
        private String fromAddress;
        private String fromName = "StudioFlow";
    }

    @Getter
    @Setter
    public static class Sms {
        private boolean enabled;
        private String provider = "twilio";
        private String fromNumber;
        private String accountSid;
        private String authToken;
    }

    @Getter
    @Setter
    public static class Reminders {
        private boolean enabled = true;
        private String cron = "0 */30 * * * *";
    }
}
