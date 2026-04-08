package com.studioflow.service;

import com.studioflow.enums.NotificationType;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationTypeConstraintMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationTypeConstraintMigrationService.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignNotificationTypeConstraint() {
        if (!notificationsTableExists()) {
            return;
        }

        String currentCheckClause = findNotificationTypeCheckClause();
        if (currentCheckClause != null && supportsCurrentNotificationTypes(currentCheckClause)) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
        jdbcTemplate.execute(
            "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (" + expectedNotificationTypeValuesSql() + "))"
        );

        LOGGER.info(
            "Aligned notifications.type check constraint with current NotificationType values. allowedNotificationTypes={}",
            Arrays.toString(NotificationType.values())
        );
    }

    private boolean notificationsTableExists() {
        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = 'notifications'",
            Integer.class
        );

        return tableCount != null && tableCount > 0;
    }

    private String findNotificationTypeCheckClause() {
        List<String> checkClauses = jdbcTemplate.query(
            """
                SELECT cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
                WHERE lower(tc.table_name) = 'notifications'
                  AND lower(tc.constraint_name) = 'notifications_type_check'
            """,
            (resultSet, rowNum) -> resultSet.getString(1)
        );

        return checkClauses.stream().findFirst().orElse(null);
    }

    private boolean supportsCurrentNotificationTypes(String checkClause) {
        String normalizedClause = checkClause.toUpperCase(Locale.ROOT);
        return Arrays.stream(NotificationType.values())
            .map(NotificationType::name)
            .allMatch((notificationType) -> normalizedClause.contains("'" + notificationType + "'"));
    }

    private String expectedNotificationTypeValuesSql() {
        return Arrays.stream(NotificationType.values())
            .map(NotificationType::name)
            .map((notificationType) -> "'" + notificationType + "'")
            .collect(Collectors.joining(", "));
    }
}
