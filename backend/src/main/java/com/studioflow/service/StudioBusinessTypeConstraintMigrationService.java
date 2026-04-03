package com.studioflow.service;

import com.studioflow.enums.BusinessType;
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
public class StudioBusinessTypeConstraintMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(StudioBusinessTypeConstraintMigrationService.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignStudiosBusinessTypeConstraint() {
        if (!studiosTableExists()) {
            return;
        }

        String currentCheckClause = findStudiosBusinessTypeCheckClause();
        if (currentCheckClause != null && supportsCurrentBusinessTypes(currentCheckClause)) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE studios DROP CONSTRAINT IF EXISTS studios_business_type_check");
        jdbcTemplate.execute(
            "ALTER TABLE studios ADD CONSTRAINT studios_business_type_check CHECK (business_type IN (" + expectedBusinessTypeValuesSql() + "))"
        );

        LOGGER.info(
            "Aligned studios.business_type check constraint with current BusinessType values. allowedBusinessTypes={}",
            Arrays.toString(BusinessType.values())
        );
    }

    private boolean studiosTableExists() {
        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = 'studios'",
            Integer.class
        );

        return tableCount != null && tableCount > 0;
    }

    private String findStudiosBusinessTypeCheckClause() {
        List<String> checkClauses = jdbcTemplate.query(
            """
                SELECT cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
                WHERE lower(tc.table_name) = 'studios'
                  AND lower(tc.constraint_name) = 'studios_business_type_check'
            """,
            (resultSet, rowNum) -> resultSet.getString(1)
        );

        return checkClauses.stream().findFirst().orElse(null);
    }

    private boolean supportsCurrentBusinessTypes(String checkClause) {
        String normalizedClause = checkClause.toUpperCase(Locale.ROOT);
        return Arrays.stream(BusinessType.values())
            .map(BusinessType::name)
            .allMatch((businessType) -> normalizedClause.contains("'" + businessType + "'"));
    }

    private String expectedBusinessTypeValuesSql() {
        return Arrays.stream(BusinessType.values())
            .map(BusinessType::name)
            .map((businessType) -> "'" + businessType + "'")
            .collect(Collectors.joining(", "));
    }
}
