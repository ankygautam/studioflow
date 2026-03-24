INSERT INTO studios (
    id,
    created_at,
    updated_at,
    name,
    business_type,
    email,
    phone,
    address_line_1,
    address_line_2,
    city,
    province_or_state,
    postal_code,
    country,
    timezone,
    is_active
) VALUES (
    UUID '11111111-1111-1111-1111-111111111111',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'StudioFlow HQ',
    'SALON',
    'hello@studioflow.co',
    '(555) 555-0100',
    '101 Mercer Street',
    'Suite 5',
    'Edmonton',
    'Alberta',
    'T5J 0N3',
    'Canada',
    'America/Edmonton',
    TRUE
);

INSERT INTO users (
    id,
    created_at,
    updated_at,
    full_name,
    email,
    password_hash,
    role,
    is_active
) VALUES
(
    UUID '22222222-2222-2222-2222-222222222221',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Nina Hart',
    'nina@studioflow.co',
    'mock-hash',
    'STAFF',
    TRUE
),
(
    UUID '22222222-2222-2222-2222-222222222222',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Elena Cross',
    'elena@studioflow.co',
    'mock-hash',
    'STAFF',
    TRUE
),
(
    UUID '22222222-2222-2222-2222-222222222223',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Luis Cole',
    'luis@studioflow.co',
    'mock-hash',
    'STAFF',
    TRUE
);

INSERT INTO staff_profiles (
    id,
    created_at,
    updated_at,
    user_id,
    studio_id,
    display_name,
    job_title,
    phone,
    bio,
    avatar_url,
    status
) VALUES
(
    UUID '33333333-3333-3333-3333-333333333331',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '22222222-2222-2222-2222-222222222221',
    UUID '11111111-1111-1111-1111-111111111111',
    'Nina Hart',
    'Senior Tattoo Artist',
    '(555) 555-1001',
    'Fine line specialist with consult-led booking flow.',
    '',
    'ACTIVE'
),
(
    UUID '33333333-3333-3333-3333-333333333332',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '22222222-2222-2222-2222-222222222222',
    UUID '11111111-1111-1111-1111-111111111111',
    'Elena Cross',
    'Color Specialist',
    '(555) 555-1002',
    'Color, blowout, and beauty service lead.',
    '',
    'ACTIVE'
),
(
    UUID '33333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '22222222-2222-2222-2222-222222222223',
    UUID '11111111-1111-1111-1111-111111111111',
    'Luis Cole',
    'Lead Barber',
    '(555) 555-1003',
    'Classic barbering with high-tempo walk-in flow.',
    '',
    'ACTIVE'
);

INSERT INTO customer_profiles (
    id,
    created_at,
    updated_at,
    studio_id,
    full_name,
    email,
    phone,
    date_of_birth,
    notes,
    is_active
) VALUES
(
    UUID '44444444-4444-4444-4444-444444444441',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Maya Laurent',
    'maya@studioflow.co',
    '(555) 555-2001',
    DATE '1994-06-15',
    'Prefers direct follow-up by text.',
    TRUE
),
(
    UUID '44444444-4444-4444-4444-444444444442',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Amara Singh',
    'amara@studioflow.co',
    '(555) 555-2002',
    DATE '1991-11-03',
    'Needs jewelry placement approval before booking.',
    TRUE
),
(
    UUID '44444444-4444-4444-4444-444444444443',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Drew Foster',
    'drew@studioflow.co',
    '(555) 555-2003',
    DATE '1989-02-21',
    'Usually books barber package every 3 weeks.',
    TRUE
);

INSERT INTO services (
    id,
    created_at,
    updated_at,
    studio_id,
    name,
    category,
    description,
    duration_minutes,
    price,
    deposit_required,
    deposit_amount,
    is_active
) VALUES
(
    UUID '55555555-5555-5555-5555-555555555551',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Fine line consult',
    'TATTOO',
    'Reference review and stencil direction.',
    60,
    180.00,
    TRUE,
    50.00,
    TRUE
),
(
    UUID '55555555-5555-5555-5555-555555555552',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Luxury blowout',
    'BEAUTY',
    'Premium blowout and finish.',
    75,
    95.00,
    FALSE,
    0.00,
    TRUE
),
(
    UUID '55555555-5555-5555-5555-555555555553',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Fade + beard sculpt',
    'BARBER',
    'Classic barber service with sculpt and finish.',
    60,
    72.00,
    FALSE,
    0.00,
    TRUE
);

INSERT INTO appointments (
    id,
    created_at,
    updated_at,
    studio_id,
    customer_profile_id,
    staff_profile_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes,
    source
) VALUES
(
    UUID '66666666-6666-6666-6666-666666666661',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444441',
    UUID '33333333-3333-3333-3333-333333333331',
    UUID '55555555-5555-5555-5555-555555555551',
    CURRENT_DATE,
    TIME '10:30:00',
    TIME '11:30:00',
    'CONFIRMED',
    'Reference review and stencil direction.',
    'ADMIN_CREATED'
),
(
    UUID '66666666-6666-6666-6666-666666666662',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444442',
    UUID '33333333-3333-3333-3333-333333333332',
    UUID '55555555-5555-5555-5555-555555555552',
    CURRENT_DATE,
    TIME '12:00:00',
    TIME '13:15:00',
    'BOOKED',
    'Client requested a polished finish with added volume.',
    'ONLINE_BOOKING'
),
(
    UUID '66666666-6666-6666-6666-666666666663',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444443',
    UUID '33333333-3333-3333-3333-333333333333',
    UUID '55555555-5555-5555-5555-555555555553',
    CURRENT_DATE,
    TIME '14:00:00',
    TIME '15:00:00',
    'COMPLETED',
    'Hot towel finish included.',
    'STAFF_CREATED'
);

INSERT INTO payments (
    id,
    created_at,
    updated_at,
    appointment_id,
    amount,
    deposit_amount,
    payment_status,
    payment_method,
    transaction_reference,
    paid_at
) VALUES
(
    UUID '77777777-7777-7777-7777-777777777771',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '66666666-6666-6666-6666-666666666661',
    180.00,
    50.00,
    'PARTIAL',
    'CARD',
    'STF-001',
    CURRENT_TIMESTAMP
),
(
    UUID '77777777-7777-7777-7777-777777777772',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '66666666-6666-6666-6666-666666666662',
    95.00,
    0.00,
    'PENDING',
    NULL,
    'STF-002',
    NULL
),
(
    UUID '77777777-7777-7777-7777-777777777773',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '66666666-6666-6666-6666-666666666663',
    72.00,
    0.00,
    'PAID',
    'CASH',
    'STF-003',
    CURRENT_TIMESTAMP
);

INSERT INTO consent_form_templates (
    id,
    created_at,
    updated_at,
    studio_id,
    title,
    description,
    content,
    is_active
) VALUES
(
    UUID '88888888-8888-8888-8888-888888888881',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Tattoo release',
    'General waiver and aftercare acknowledgement for tattoo sessions.',
    'I confirm that I have reviewed the aftercare instructions and understand the service risks.',
    TRUE
),
(
    UUID '88888888-8888-8888-8888-888888888882',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Piercing consent',
    'Placement approval and jewelry handling notes.',
    'I consent to the selected piercing placement and understand the recommended aftercare process.',
    TRUE
),
(
    UUID '88888888-8888-8888-8888-888888888883',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '11111111-1111-1111-1111-111111111111',
    'Wellness intake acknowledgement',
    'Short intake form for wellness and massage bookings.',
    'I have shared relevant health information and approve the selected service plan.',
    TRUE
);

INSERT INTO consent_form_submissions (
    id,
    created_at,
    updated_at,
    template_id,
    studio_id,
    customer_profile_id,
    appointment_id,
    status,
    signed_at,
    signature_image_url
) VALUES
(
    UUID '99999999-9999-9999-9999-999999999991',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '88888888-8888-8888-8888-888888888881',
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444441',
    UUID '66666666-6666-6666-6666-666666666661',
    'SIGNED',
    CURRENT_TIMESTAMP,
    'https://studioflow.local/signatures/maya-laurent.png'
),
(
    UUID '99999999-9999-9999-9999-999999999992',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '88888888-8888-8888-8888-888888888882',
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444442',
    UUID '66666666-6666-6666-6666-666666666662',
    'PENDING',
    NULL,
    NULL
),
(
    UUID '99999999-9999-9999-9999-999999999993',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    UUID '88888888-8888-8888-8888-888888888883',
    UUID '11111111-1111-1111-1111-111111111111',
    UUID '44444444-4444-4444-4444-444444444443',
    NULL,
    'EXPIRED',
    NULL,
    NULL
);
