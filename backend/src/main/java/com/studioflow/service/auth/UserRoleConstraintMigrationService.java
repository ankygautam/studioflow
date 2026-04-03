package com.studioflow.service.auth;

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
public class UserRoleConstraintMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserRoleConstraintMigrationService.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignUsersRoleConstraint() {
        if (!usersTableExists()) {
            return;
        }

        String currentCheckClause = findUsersRoleCheckClause();
        if (currentCheckClause != null && currentCheckClause.toUpperCase(Locale.ROOT).contains("'OWNER'")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (" + expectedRoleValuesSql() + "))");

        LOGGER.info(
            "Aligned users.role check constraint with current UserRole values. allowedRoles={}",
            Arrays.toString(UserRole.values())
        );
    }

    private boolean usersTableExists() {
        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = 'users'",
            Integer.class
        );

        return tableCount != null && tableCount > 0;
    }

    private String findUsersRoleCheckClause() {
        List<String> checkClauses = jdbcTemplate.query(
            """
                SELECT cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
                WHERE lower(tc.table_name) = 'users'
                  AND lower(tc.constraint_name) = 'users_role_check'
            """,
            (resultSet, rowNum) -> resultSet.getString(1)
        );

        return checkClauses.stream().findFirst().orElse(null);
    }

    private String expectedRoleValuesSql() {
        return Arrays.stream(UserRole.values())
            .map(UserRole::name)
            .map((role) -> "'" + role + "'")
            .collect(Collectors.joining(", "));
    }
}
