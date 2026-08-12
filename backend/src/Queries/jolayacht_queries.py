# jolayacht_queries.py - PostgreSQL queries for Jola Yacht schema

# =============================================================================
# EXPERIENCES
# =============================================================================

GET_ALL_EXPERIENCES = """
    SELECT id, title_es, title_en, description_es, description_en,
           highlights_es, highlights_en, price, duration_minutes,
           rating, review_count, images, max_guests, includes,
           category, is_active, created_at
    FROM experiences
    WHERE is_active = TRUE
    ORDER BY created_at DESC
"""

GET_EXPERIENCE_BY_ID = """
    SELECT id, title_es, title_en, description_es, description_en,
           highlights_es, highlights_en, price, duration_minutes,
           rating, review_count, images, max_guests, includes,
           category, is_active, created_at
    FROM experiences
    WHERE id = :id
"""

INSERT_EXPERIENCE = """
    INSERT INTO experiences (
        title_es, title_en, description_es, description_en,
        highlights_es, highlights_en, price, duration_minutes,
        images, max_guests, includes, category
    )
    VALUES (
        :title_es, :title_en, :description_es, :description_en,
        CAST(:highlights_es AS jsonb), CAST(:highlights_en AS jsonb),
        :price, :duration_minutes,
        CAST(:images AS jsonb), :max_guests,
        CAST(:includes AS jsonb), :category
    )
    RETURNING id, title_es, title_en, description_es, description_en,
              highlights_es, highlights_en, price, duration_minutes,
              rating, review_count, images, max_guests, includes,
              category, is_active, created_at
"""

UPDATE_EXPERIENCE = """
    UPDATE experiences SET
        title_es = :title_es,
        title_en = :title_en,
        description_es = :description_es,
        description_en = :description_en,
        highlights_es = CAST(:highlights_es AS jsonb),
        highlights_en = CAST(:highlights_en AS jsonb),
        price = :price,
        duration_minutes = :duration_minutes,
        images = CAST(:images AS jsonb),
        max_guests = :max_guests,
        includes = CAST(:includes AS jsonb),
        category = :category
    WHERE id = :id
    RETURNING id, title_es, title_en, description_es, description_en,
              highlights_es, highlights_en, price, duration_minutes,
              rating, review_count, images, max_guests, includes,
              category, is_active, created_at
"""

DELETE_EXPERIENCE = """
    UPDATE experiences SET is_active = FALSE WHERE id = :id
"""

# =============================================================================
# FLEET
# =============================================================================

GET_ALL_FLEET = """
    SELECT id, name, type, description_es, description_en,
           capacity, price_per_hour, amenities_es, amenities_en,
           specs, images, is_available, created_at
    FROM fleet
    WHERE is_available = TRUE
    ORDER BY created_at DESC
"""

GET_FLEET_BY_ID = """
    SELECT id, name, type, description_es, description_en,
           capacity, price_per_hour, amenities_es, amenities_en,
           specs, images, is_available, created_at
    FROM fleet
    WHERE id = :id
"""

INSERT_FLEET = """
    INSERT INTO fleet (
        name, type, description_es, description_en,
        capacity, price_per_hour,
        amenities_es, amenities_en, specs, images
    )
    VALUES (
        :name, :type, :description_es, :description_en,
        :capacity, :price_per_hour,
        CAST(:amenities_es AS jsonb), CAST(:amenities_en AS jsonb),
        CAST(:specs AS jsonb), CAST(:images AS jsonb)
    )
    RETURNING id, name, type, description_es, description_en,
              capacity, price_per_hour, amenities_es, amenities_en,
              specs, images, is_available, created_at
"""

UPDATE_FLEET = """
    UPDATE fleet SET
        name = :name,
        type = :type,
        description_es = :description_es,
        description_en = :description_en,
        capacity = :capacity,
        price_per_hour = :price_per_hour,
        amenities_es = CAST(:amenities_es AS jsonb),
        amenities_en = CAST(:amenities_en AS jsonb),
        specs = CAST(:specs AS jsonb),
        images = CAST(:images AS jsonb)
    WHERE id = :id
    RETURNING id, name, type, description_es, description_en,
              capacity, price_per_hour, amenities_es, amenities_en,
              specs, images, is_available, created_at
"""

DELETE_FLEET = """
    UPDATE fleet SET is_available = FALSE WHERE id = :id
"""

# =============================================================================
# REVIEWS
# =============================================================================

GET_ALL_REVIEWS = """
    SELECT id, customer_name, rating, comment_es, comment_en,
           avatar, experience_id, is_featured, created_at
    FROM reviews
    ORDER BY created_at DESC
"""

GET_FEATURED_REVIEWS = """
    SELECT id, customer_name, rating, comment_es, comment_en,
           avatar, experience_id, is_featured, created_at
    FROM reviews
    WHERE is_featured = TRUE
    ORDER BY created_at DESC
"""

INSERT_REVIEW = """
    INSERT INTO reviews (
        customer_name, rating, comment_es, comment_en,
        avatar, experience_id, is_featured
    )
    VALUES (
        :customer_name, :rating, :comment_es, :comment_en,
        :avatar, :experience_id, :is_featured
    )
    RETURNING id, customer_name, rating, comment_es, comment_en,
              avatar, experience_id, is_featured, created_at
"""

DELETE_REVIEW = """
    DELETE FROM reviews WHERE id = :id
"""

# =============================================================================
# FAQs
# =============================================================================

GET_ALL_FAQS = """
    SELECT id, question_es, question_en, answer_es, answer_en,
           "order", is_active
    FROM faqs
    WHERE is_active = TRUE
    ORDER BY "order" ASC
"""

INSERT_FAQ = """
    INSERT INTO faqs (question_es, question_en, answer_es, answer_en, "order")
    VALUES (:question_es, :question_en, :answer_es, :answer_en, :order)
    RETURNING id, question_es, question_en, answer_es, answer_en, "order", is_active
"""

UPDATE_FAQ = """
    UPDATE faqs SET
        question_es = :question_es,
        question_en = :question_en,
        answer_es = :answer_es,
        answer_en = :answer_en,
        "order" = :order
    WHERE id = :id
    RETURNING id, question_es, question_en, answer_es, answer_en, "order", is_active
"""

DELETE_FAQ = """
    UPDATE faqs SET is_active = FALSE WHERE id = :id
"""

# =============================================================================
# PROMOTIONS
# =============================================================================

GET_ALL_PROMOTIONS = """
    SELECT id, name_es, name_en, description_es, description_en,
           discount_type, discount_value, promo_code, season_type,
           holiday_name, start_date, end_date, applies_to, specific_items,
           min_guests, min_purchase, max_uses, current_uses, is_active,
           banner_image, badge_color, created_at
    FROM promotions
    ORDER BY created_at DESC
"""

GET_ACTIVE_PROMOTIONS_FOR_DATE = """
    SELECT id, name_es, name_en, description_es, description_en,
           discount_type, discount_value, promo_code, season_type,
           holiday_name, start_date, end_date, applies_to, specific_items,
           min_guests, min_purchase, max_uses, current_uses, is_active,
           banner_image, badge_color, created_at
    FROM promotions
    WHERE is_active = TRUE
      AND start_date <= CAST(:date AS date)
      AND end_date >= CAST(:date AS date)
    ORDER BY discount_value DESC
"""

GET_PROMOTION_BY_CODE = """
    SELECT id, name_es, name_en, description_es, description_en,
           discount_type, discount_value, promo_code, season_type,
           holiday_name, start_date, end_date, applies_to, specific_items,
           min_guests, min_purchase, max_uses, current_uses, is_active,
           banner_image, badge_color, created_at
    FROM promotions
    WHERE UPPER(promo_code) = UPPER(:code)
      AND is_active = TRUE
"""

GET_PROMOTION_BY_ID = """
    SELECT id, name_es, name_en, description_es, description_en,
           discount_type, discount_value, promo_code, season_type,
           holiday_name, start_date, end_date, applies_to, specific_items,
           min_guests, min_purchase, max_uses, current_uses, is_active,
           banner_image, badge_color, created_at
    FROM promotions
    WHERE id = :id
"""

INSERT_PROMOTION = """
    INSERT INTO promotions (
        name_es, name_en, description_es, description_en,
        discount_type, discount_value, promo_code, season_type,
        holiday_name, start_date, end_date, applies_to,
        specific_items, min_guests, min_purchase, max_uses,
        banner_image, badge_color
    )
    VALUES (
        :name_es, :name_en, :description_es, :description_en,
        :discount_type, :discount_value, :promo_code, :season_type,
        :holiday_name, CAST(:start_date AS date), CAST(:end_date AS date),
        :applies_to, CAST(:specific_items AS jsonb),
        :min_guests, :min_purchase, :max_uses, :banner_image, :badge_color
    )
    RETURNING *
"""

UPDATE_PROMOTION = """
    UPDATE promotions SET
        name_es = :name_es,
        name_en = :name_en,
        description_es = :description_es,
        description_en = :description_en,
        discount_type = :discount_type,
        discount_value = :discount_value,
        promo_code = :promo_code,
        season_type = :season_type,
        holiday_name = :holiday_name,
        start_date = CAST(:start_date AS date),
        end_date = CAST(:end_date AS date),
        applies_to = :applies_to,
        specific_items = CAST(:specific_items AS jsonb),
        min_guests = :min_guests,
        min_purchase = :min_purchase,
        max_uses = :max_uses,
        banner_image = :banner_image,
        badge_color = :badge_color
    WHERE id = :id
    RETURNING *
"""

DELETE_PROMOTION = """
    DELETE FROM promotions WHERE id = :id
"""

TOGGLE_PROMOTION = """
    UPDATE promotions SET is_active = NOT is_active WHERE id = :id
    RETURNING is_active
"""

INCREMENT_PROMOTION_USES = """
    UPDATE promotions SET current_uses = current_uses + 1 WHERE id = :id
"""

# =============================================================================
# RESERVATIONS
# =============================================================================

GET_ALL_RESERVATIONS = """
    SELECT r.id, r.experience_id, r.fleet_id,
           r.customer_name, r.customer_email, r.customer_phone,
           r.date, r.time_slot, r.guests,
           r.original_price, r.discount_amount, r.total_price,
           r.promo_code, r.promotion_id, r.add_ons,
           r.status, r.payment_status, r.payment_session_id,
           r.notes, r.created_at
    FROM reservations r
    ORDER BY r.created_at DESC
"""

GET_RESERVATION_BY_ID = """
    SELECT id, experience_id, fleet_id,
           customer_name, customer_email, customer_phone,
           date, time_slot, guests,
           original_price, discount_amount, total_price,
           promo_code, promotion_id, add_ons,
           status, payment_status, payment_session_id,
           notes, created_at
    FROM reservations
    WHERE id = :id
"""

GET_RESERVATION_BY_SESSION_ID = """
    SELECT id, experience_id, fleet_id,
           customer_name, customer_email, customer_phone,
           date, time_slot, guests,
           original_price, discount_amount, total_price,
           promo_code, promotion_id, add_ons,
           status, payment_status, payment_session_id,
           notes, created_at
    FROM reservations
    WHERE payment_session_id = :session_id
"""

GET_RESERVATIONS_BY_DATE = """
    SELECT id, experience_id, fleet_id,
           customer_name, customer_email, customer_phone,
           date, time_slot, guests,
           original_price, discount_amount, total_price,
           promo_code, promotion_id, add_ons,
           status, payment_status, payment_session_id,
           notes, created_at
    FROM reservations
    WHERE date = CAST(:date AS date)
      AND status <> 'cancelled'
    ORDER BY time_slot ASC
"""

INSERT_RESERVATION = """
    INSERT INTO reservations (
        experience_id, fleet_id,
        customer_name, customer_email, customer_phone,
        date, time_slot, guests,
        original_price, discount_amount, total_price,
        promo_code, promotion_id,
        add_ons, notes
    )
    VALUES (
        :experience_id, :fleet_id,
        :customer_name, :customer_email, :customer_phone,
        CAST(:date AS date), CAST(:time_slot AS time), :guests,
        :original_price, :discount_amount, :total_price,
        :promo_code, :promotion_id,
        CAST(:add_ons AS jsonb), :notes
    )
    RETURNING id, experience_id, fleet_id,
              customer_name, customer_email, customer_phone,
              date, time_slot, guests,
              original_price, discount_amount, total_price,
              promo_code, promotion_id, add_ons,
              status, payment_status, payment_session_id,
              notes, created_at
"""

UPDATE_RESERVATION_STATUS = """
    UPDATE reservations SET status = :status WHERE id = :id
    RETURNING id, status, payment_status
"""

UPDATE_RESERVATION_PAYMENT = """
    UPDATE reservations
    SET status = :status,
        payment_status = :payment_status,
        payment_session_id = :session_id
    WHERE id = :id
"""

MARK_RESERVATION_PAID = """
    UPDATE reservations
    SET status = 'confirmed', payment_status = 'paid'
    WHERE payment_session_id = :session_id
      AND payment_status <> 'paid'
"""

# =============================================================================
# AVAILABILITY
# =============================================================================

GET_BOOKED_SLOTS = """
    SELECT experience_id, fleet_id, time_slot
    FROM reservations
    WHERE date = CAST(:date AS date)
      AND status <> 'cancelled'
"""

# =============================================================================
# PAYMENT TRANSACTIONS
# =============================================================================

INSERT_PAYMENT_TRANSACTION = """
    INSERT INTO payment_transactions (
        session_id, reservation_id, amount, currency,
        status, payment_status, metadata
    )
    VALUES (
        :session_id, :reservation_id, :amount, :currency,
        :status, :payment_status, CAST(:metadata AS jsonb)
    )
    RETURNING id, session_id, reservation_id, amount, currency,
              status, payment_status, metadata, created_at
"""

GET_PAYMENT_TRANSACTION_BY_SESSION = """
    SELECT id, session_id, reservation_id, amount, currency,
           status, payment_status, metadata, created_at
    FROM payment_transactions
    WHERE session_id = :session_id
"""

UPDATE_PAYMENT_TRANSACTION = """
    UPDATE payment_transactions
    SET status = :status, payment_status = :payment_status
    WHERE session_id = :session_id
      AND payment_status <> 'paid'
"""

# =============================================================================
# ADMIN USERS
# =============================================================================

GET_ADMIN_BY_EMAIL = """
    SELECT id, email, password_hash, name, created_at
    FROM admin_users
    WHERE email = :email
"""

INSERT_ADMIN = """
    INSERT INTO admin_users (email, password_hash, name)
    VALUES (:email, :password_hash, :name)
    RETURNING id, email, name, created_at
"""

# =============================================================================
# STATS (Admin dashboard)
# =============================================================================

GET_STATS = """
    SELECT
        (SELECT COUNT(*) FROM reservations) AS total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') AS confirmed_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'pending') AS total_pending,
        (SELECT COUNT(*) FROM reservations WHERE payment_status = 'paid') AS total_paid,
        (SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE payment_status = 'paid') AS total_revenue,
        (SELECT COUNT(*) FROM experiences WHERE is_active = TRUE) AS total_experiences,
        (SELECT COUNT(*) FROM fleet WHERE is_available = TRUE) AS total_fleet,
        (SELECT COUNT(*) FROM reviews) AS total_reviews
"""
