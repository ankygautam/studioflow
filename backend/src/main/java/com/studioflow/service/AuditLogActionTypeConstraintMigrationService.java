package com.studioflow.service;

import com.studioflow.enums.AuditActionType;
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
public class AuditLogActionTypeConstraintMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogActionTypeConstraintMigrationService.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignAuditLogActionTypeConstraint() {
        if (!auditLogsTableExists()) {
            return;
        }

        String currentCheckClause = findAuditLogActionTypeCheckClause();
        if (currentCheckClause != null && supportsCurrentActionTypes(currentCheckClause)) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check");
        jdbcTemplate.execute(
            "ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_type_check CHECK (action_type IN (" + expectedActionTypeValuesSql() + "))"
        );

        LOGGER.info(
            "Aligned audit_logs.action_type check constraint with current AuditActionType values. allowedActionTypes={}",
            Arrays.toString(AuditActionType.values())
        );
    }

    private boolean auditLogsTableExists() {
        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = 'audit_logs'",
            Integer.class
        );

        return tableCount != null && tableCount > 0;
    }

    private String findAuditLogActionTypeCheckClause() {
        List<String> checkClauses = jdbcTemplate.query(
            """
                SELECT cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
                WHERE lower(tc.table_name) = 'audit_logs'
                  AND lower(tc.constraint_name) = 'audit_logs_action_type_check'
            """,
            (resultSet, rowNum) -> resultSet.getString(1)
        );

        return checkClauses.stream().findFirst().orElse(null);
    }

    private boolean supportsCurrentActionTypes(String checkClause) {
        String normalizedClause = checkClause.toUpperCase(Locale.ROOT);
        return Arrays.stream(AuditActionType.values())
            .map(AuditActionType::name)
            .allMatch((actionType) -> normalizedClause.contains("'" + actionType + "'"));
    }

    private String expectedActionTypeValuesSql() {
        return Arrays.stream(AuditActionType.values())
            .map(AuditActionType::name)
            .map((actionType) -> "'" + actionType + "'")
            .collect(Collectors.joining(", "));
    }
}
