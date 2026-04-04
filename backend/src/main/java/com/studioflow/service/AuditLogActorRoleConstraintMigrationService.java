package com.studioflow.service;

import com.studioflow.enums.UserRole;
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
public class AuditLogActorRoleConstraintMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogActorRoleConstraintMigrationService.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignAuditLogActorRoleConstraint() {
        if (!auditLogsTableExists()) {
            return;
        }

        String currentCheckClause = findAuditLogActorRoleCheckClause();
        if (currentCheckClause != null && supportsCurrentRoles(currentCheckClause)) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_role_check");
        jdbcTemplate.execute(
            "ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_actor_role_check CHECK (actor_role IS NULL OR actor_role IN (" + expectedRoleValuesSql() + "))"
        );

        LOGGER.info(
            "Aligned audit_logs.actor_role check constraint with current UserRole values. allowedRoles={}",
            Arrays.toString(UserRole.values())
        );
    }

    private boolean auditLogsTableExists() {
        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = 'audit_logs'",
            Integer.class
        );

        return tableCount != null && tableCount > 0;
    }

    private String findAuditLogActorRoleCheckClause() {
        List<String> checkClauses = jdbcTemplate.query(
            """
                SELECT cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
                WHERE lower(tc.table_name) = 'audit_logs'
                  AND lower(tc.constraint_name) = 'audit_logs_actor_role_check'
            """,
            (resultSet, rowNum) -> resultSet.getString(1)
        );

        return checkClauses.stream().findFirst().orElse(null);
    }

    private boolean supportsCurrentRoles(String checkClause) {
        String normalizedClause = checkClause.toUpperCase(Locale.ROOT);
        return Arrays.stream(UserRole.values())
            .map(UserRole::name)
            .allMatch((role) -> normalizedClause.contains("'" + role + "'"));
    }

    private String expectedRoleValuesSql() {
        return Arrays.stream(UserRole.values())
            .map(UserRole::name)
            .map((role) -> "'" + role + "'")
            .collect(Collectors.joining(", "));
    }
}
