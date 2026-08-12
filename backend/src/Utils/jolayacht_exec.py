# jolayacht_exec.py - Business logic and database helpers for Jola Yacht
import json
import sys
import os
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from passlib.context import CryptContext
from jose import jwt, JWTError

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.config import DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS
from Queries.jolayacht_queries import *

# ---- DB Engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ---- Password hashing
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---- Default available time slots (can be config-driven later)
DEFAULT_TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
]

# =============================================================================
# HELPERS
# =============================================================================

def execute_query(query: str, params: dict = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return list of row dicts."""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        columns = result.keys()
        rows = []
        for row in result.fetchall():
            row_dict = dict(zip(columns, row))
            # Coerce non-serialisable types
            for k, v in row_dict.items():
                if hasattr(v, "isoformat"):
                    row_dict[k] = v.isoformat()
                elif isinstance(v, (dict, list)):
                    pass  # already fine
            rows.append(row_dict)
        return rows


def execute_write(query: str, params: dict = None) -> List[Dict[str, Any]]:
    """Execute an INSERT/UPDATE/DELETE with RETURNING and return rows."""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        conn.commit()
        try:
            columns = result.keys()
            rows = []
            for row in result.fetchall():
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if hasattr(v, "isoformat"):
                        row_dict[k] = v.isoformat()
                rows.append(row_dict)
            return rows
        except Exception:
            return []


def execute_update(query: str, params: dict = None) -> int:
    """Execute an UPDATE/DELETE without RETURNING, return rowcount."""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        conn.commit()
        return result.rowcount


# =============================================================================
# AUTH
# =============================================================================

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_ctx.verify(password, hashed)


def create_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode({"sub": email, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str:
    """Returns email from token or raises ValueError."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except JWTError as exc:
        raise ValueError(str(exc))


def get_admin_by_email(email: str) -> Optional[Dict]:
    rows = execute_query(GET_ADMIN_BY_EMAIL, {"email": email})
    return rows[0] if rows else None


def create_admin(email: str, password: str, name: str = "Admin") -> Dict:
    rows = execute_write(INSERT_ADMIN, {
        "email": email,
        "password_hash": hash_password(password),
        "name": name,
    })
    return rows[0] if rows else {}


# =============================================================================
# EXPERIENCES
# =============================================================================

def get_all_experiences() -> List[Dict]:
    return execute_query(GET_ALL_EXPERIENCES)


def get_experience_by_id(exp_id: str) -> Optional[Dict]:
    rows = execute_query(GET_EXPERIENCE_BY_ID, {"id": exp_id})
    return rows[0] if rows else None


def create_experience(data: Dict) -> Dict:
    params = {
        "title_es": data["title_es"],
        "title_en": data["title_en"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "highlights_es": json.dumps(data.get("highlights_es", [])),
        "highlights_en": json.dumps(data.get("highlights_en", [])),
        "price": data["price"],
        "duration_minutes": data["duration_minutes"],
        "images": json.dumps(data.get("images", [])),
        "max_guests": data.get("max_guests", 10),
        "includes": json.dumps(data.get("includes", [])),
        "category": data.get("category", "water_activity"),
    }
    rows = execute_write(INSERT_EXPERIENCE, params)
    return rows[0] if rows else {}


def update_experience(exp_id: str, data: Dict) -> Optional[Dict]:
    params = {
        "id": exp_id,
        "title_es": data["title_es"],
        "title_en": data["title_en"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "highlights_es": json.dumps(data.get("highlights_es", [])),
        "highlights_en": json.dumps(data.get("highlights_en", [])),
        "price": data["price"],
        "duration_minutes": data["duration_minutes"],
        "images": json.dumps(data.get("images", [])),
        "max_guests": data.get("max_guests", 10),
        "includes": json.dumps(data.get("includes", [])),
        "category": data.get("category", "water_activity"),
    }
    rows = execute_write(UPDATE_EXPERIENCE, params)
    return rows[0] if rows else None


def delete_experience(exp_id: str) -> bool:
    count = execute_update(DELETE_EXPERIENCE, {"id": exp_id})
    return count > 0


# =============================================================================
# FLEET
# =============================================================================

def get_all_fleet() -> List[Dict]:
    return execute_query(GET_ALL_FLEET)


def get_fleet_by_id(fleet_id: str) -> Optional[Dict]:
    rows = execute_query(GET_FLEET_BY_ID, {"id": fleet_id})
    return rows[0] if rows else None


def create_fleet_item(data: Dict) -> Dict:
    params = {
        "name": data["name"],
        "type": data["type"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "capacity": data["capacity"],
        "price_per_hour": data["price_per_hour"],
        "amenities_es": json.dumps(data.get("amenities_es", [])),
        "amenities_en": json.dumps(data.get("amenities_en", [])),
        "specs": json.dumps(data.get("specs", {})),
        "images": json.dumps(data.get("images", [])),
    }
    rows = execute_write(INSERT_FLEET, params)
    return rows[0] if rows else {}


def update_fleet_item(fleet_id: str, data: Dict) -> Optional[Dict]:
    params = {
        "id": fleet_id,
        "name": data["name"],
        "type": data["type"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "capacity": data["capacity"],
        "price_per_hour": data["price_per_hour"],
        "amenities_es": json.dumps(data.get("amenities_es", [])),
        "amenities_en": json.dumps(data.get("amenities_en", [])),
        "specs": json.dumps(data.get("specs", {})),
        "images": json.dumps(data.get("images", [])),
    }
    rows = execute_write(UPDATE_FLEET, params)
    return rows[0] if rows else None


def delete_fleet_item(fleet_id: str) -> bool:
    count = execute_update(DELETE_FLEET, {"id": fleet_id})
    return count > 0


# =============================================================================
# REVIEWS
# =============================================================================

def get_all_reviews() -> List[Dict]:
    return execute_query(GET_ALL_REVIEWS)


def get_featured_reviews() -> List[Dict]:
    return execute_query(GET_FEATURED_REVIEWS)


def create_review(data: Dict) -> Dict:
    params = {
        "customer_name": data["customer_name"],
        "rating": data["rating"],
        "comment_es": data["comment_es"],
        "comment_en": data["comment_en"],
        "avatar": data.get("avatar"),
        "experience_id": data.get("experience_id"),
        "is_featured": data.get("is_featured", False),
    }
    rows = execute_write(INSERT_REVIEW, params)
    return rows[0] if rows else {}


def delete_review(review_id: str) -> bool:
    count = execute_update(DELETE_REVIEW, {"id": review_id})
    return count > 0


# =============================================================================
# FAQs
# =============================================================================

def get_all_faqs() -> List[Dict]:
    return execute_query(GET_ALL_FAQS)


def create_faq(data: Dict) -> Dict:
    params = {
        "question_es": data["question_es"],
        "question_en": data["question_en"],
        "answer_es": data["answer_es"],
        "answer_en": data["answer_en"],
        "order": data.get("order", 0),
    }
    rows = execute_write(INSERT_FAQ, params)
    return rows[0] if rows else {}


def update_faq(faq_id: str, data: Dict) -> Optional[Dict]:
    params = {
        "id": faq_id,
        "question_es": data["question_es"],
        "question_en": data["question_en"],
        "answer_es": data["answer_es"],
        "answer_en": data["answer_en"],
        "order": data.get("order", 0),
    }
    rows = execute_write(UPDATE_FAQ, params)
    return rows[0] if rows else None


def delete_faq(faq_id: str) -> bool:
    count = execute_update(DELETE_FAQ, {"id": faq_id})
    return count > 0


# =============================================================================
# PROMOTIONS
# =============================================================================

def get_all_promotions() -> List[Dict]:
    return execute_query(GET_ALL_PROMOTIONS)


def get_active_promotions_for_date(
    date_str: str,
    item_type: Optional[str] = None,
    item_id: Optional[str] = None,
) -> List[Dict]:
    promos = execute_query(GET_ACTIVE_PROMOTIONS_FOR_DATE, {"date": date_str})
    applicable = []
    for p in promos:
        applies_to = p.get("applies_to", "all")
        if applies_to == "all":
            applicable.append(p)
        elif applies_to == "experiences" and item_type == "experience":
            applicable.append(p)
        elif applies_to == "fleet" and item_type == "fleet":
            applicable.append(p)
        elif applies_to == "specific" and item_id:
            specific = p.get("specific_items", [])
            if isinstance(specific, str):
                specific = json.loads(specific)
            if item_id in specific:
                applicable.append(p)
    return applicable


def validate_promo_code(
    code: str, date_str: str, amount: float, guests: int = 1
) -> Optional[Dict]:
    rows = execute_query(GET_PROMOTION_BY_CODE, {"code": code.upper()})
    if not rows:
        return None
    p = rows[0]
    # Check date range
    start = p.get("start_date", "")
    end = p.get("end_date", "")
    if isinstance(start, str) and isinstance(end, str):
        if not (start <= date_str <= end):
            return None
    # Check min_guests / min_purchase
    if guests < p.get("min_guests", 1):
        return None
    if amount < float(p.get("min_purchase", 0)):
        return None
    # Check max uses
    max_uses = p.get("max_uses")
    if max_uses is not None and p.get("current_uses", 0) >= max_uses:
        return None
    return p


def calculate_discounted_price(original_price: float, promo: Dict):
    """Returns (final_price, discount_amount)."""
    dtype = promo.get("discount_type", "percentage")
    value = float(promo.get("discount_value", 0))
    if dtype == "percentage":
        discount_amount = round(original_price * value / 100, 2)
    else:
        discount_amount = min(value, original_price)
    final_price = max(0.0, round(original_price - discount_amount, 2))
    return final_price, discount_amount


def create_promotion(data: Dict) -> Dict:
    params = {
        "name_es": data["name_es"],
        "name_en": data["name_en"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "discount_type": data.get("discount_type", "percentage"),
        "discount_value": data["discount_value"],
        "promo_code": data.get("promo_code"),
        "season_type": data.get("season_type", "custom"),
        "holiday_name": data.get("holiday_name"),
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "applies_to": data.get("applies_to", "all"),
        "specific_items": json.dumps(data.get("specific_items", [])),
        "min_guests": data.get("min_guests", 1),
        "min_purchase": data.get("min_purchase", 0),
        "max_uses": data.get("max_uses"),
        "banner_image": data.get("banner_image"),
        "badge_color": data.get("badge_color", "#FF7F50"),
    }
    rows = execute_write(INSERT_PROMOTION, params)
    return rows[0] if rows else {}


def update_promotion(promo_id: str, data: Dict) -> Optional[Dict]:
    params = {
        "id": promo_id,
        "name_es": data["name_es"],
        "name_en": data["name_en"],
        "description_es": data["description_es"],
        "description_en": data["description_en"],
        "discount_type": data.get("discount_type", "percentage"),
        "discount_value": data["discount_value"],
        "promo_code": data.get("promo_code"),
        "season_type": data.get("season_type", "custom"),
        "holiday_name": data.get("holiday_name"),
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "applies_to": data.get("applies_to", "all"),
        "specific_items": json.dumps(data.get("specific_items", [])),
        "min_guests": data.get("min_guests", 1),
        "min_purchase": data.get("min_purchase", 0),
        "max_uses": data.get("max_uses"),
        "banner_image": data.get("banner_image"),
        "badge_color": data.get("badge_color", "#FF7F50"),
    }
    rows = execute_write(UPDATE_PROMOTION, params)
    return rows[0] if rows else None


def delete_promotion(promo_id: str) -> bool:
    count = execute_update(DELETE_PROMOTION, {"id": promo_id})
    return count > 0


def toggle_promotion(promo_id: str) -> Optional[bool]:
    rows = execute_write(TOGGLE_PROMOTION, {"id": promo_id})
    if rows:
        return rows[0].get("is_active")
    return None


# =============================================================================
# AVAILABILITY
# =============================================================================

def get_availability(date_str: str) -> Dict:
    """Returns time slots grouped by experience_id and fleet_id with availability."""
    booked = execute_query(GET_BOOKED_SLOTS, {"date": date_str})

    # Build sets of booked slots per asset
    experience_booked: Dict[str, set] = {}
    fleet_booked: Dict[str, set] = {}
    for row in booked:
        t = str(row.get("time_slot", ""))[:5]  # HH:MM
        if row.get("experience_id"):
            eid = str(row["experience_id"])
            experience_booked.setdefault(eid, set()).add(t)
        if row.get("fleet_id"):
            fid = str(row["fleet_id"])
            fleet_booked.setdefault(fid, set()).add(t)

    # Experiences
    experiences = execute_query(GET_ALL_EXPERIENCES)
    exp_availability = {}
    for exp in experiences:
        eid = str(exp["id"])
        booked_set = experience_booked.get(eid, set())
        exp_availability[eid] = [
            {"time": t, "available": t not in booked_set}
            for t in DEFAULT_TIME_SLOTS
        ]

    # Fleet
    fleet_items = execute_query(GET_ALL_FLEET)
    fleet_availability = {}
    for item in fleet_items:
        fid = str(item["id"])
        booked_set = fleet_booked.get(fid, set())
        fleet_availability[fid] = [
            {"time": t, "available": t not in booked_set}
            for t in DEFAULT_TIME_SLOTS
        ]

    return {
        "date": date_str,
        "experiences": exp_availability,
        "fleet": fleet_availability,
    }


# =============================================================================
# RESERVATIONS
# =============================================================================

def get_all_reservations() -> List[Dict]:
    return execute_query(GET_ALL_RESERVATIONS)


def get_reservation_by_id(res_id: str) -> Optional[Dict]:
    rows = execute_query(GET_RESERVATION_BY_ID, {"id": res_id})
    return rows[0] if rows else None


def get_reservation_by_session_id(session_id: str) -> Optional[Dict]:
    rows = execute_query(GET_RESERVATION_BY_SESSION_ID, {"session_id": session_id})
    return rows[0] if rows else None


def create_reservation(data: Dict) -> Dict:
    experience_id = data.get("experience_id")
    fleet_id = data.get("fleet_id")

    if not experience_id and not fleet_id:
        raise ValueError("Reservation must reference an experience or fleet item")
    if experience_id and fleet_id:
        raise ValueError("Reservation must reference only one of experience or fleet")

    # Resolve pricing
    original_price = 0.0
    if experience_id:
        exp = get_experience_by_id(experience_id)
        if not exp:
            raise ValueError(f"Experience {experience_id} not found")
        original_price = float(exp["price"]) * data.get("guests", 1)
    elif fleet_id:
        fleet = get_fleet_by_id(fleet_id)
        if not fleet:
            raise ValueError(f"Fleet item {fleet_id} not found")
        original_price = float(fleet["price_per_hour"])

    discount_amount = 0.0
    promotion_id = None
    promo_code = data.get("promo_code")

    if promo_code:
        promo = validate_promo_code(
            promo_code,
            data["date"],
            original_price,
            data.get("guests", 1),
        )
        if promo:
            _, discount_amount = calculate_discounted_price(original_price, promo)
            promotion_id = str(promo["id"])
            # Increment usage counter
            execute_update(INCREMENT_PROMOTION_USES, {"id": promo["id"]})

    total_price = max(0.0, original_price - discount_amount)

    params = {
        "experience_id": experience_id,
        "fleet_id": fleet_id,
        "customer_name": data["customer_name"],
        "customer_email": data["customer_email"],
        "customer_phone": data["customer_phone"],
        "date": data["date"],
        "time_slot": data["time_slot"],
        "guests": data.get("guests", 1),
        "original_price": original_price,
        "discount_amount": discount_amount,
        "total_price": total_price,
        "promo_code": promo_code,
        "promotion_id": promotion_id,
        "add_ons": json.dumps(data.get("add_ons", [])),
        "notes": data.get("notes"),
    }
    rows = execute_write(INSERT_RESERVATION, params)
    return rows[0] if rows else {}


def update_reservation_status(res_id: str, status: str) -> Optional[Dict]:
    rows = execute_write(UPDATE_RESERVATION_STATUS, {"id": res_id, "status": status})
    return rows[0] if rows else None


def mark_reservation_paid(session_id: str) -> None:
    execute_update(MARK_RESERVATION_PAID, {"session_id": session_id})


# =============================================================================
# PAYMENT TRANSACTIONS
# =============================================================================

def create_payment_transaction(
    session_id: str,
    reservation_id: str,
    amount: float,
    currency: str = "mxn",
    metadata: Dict = None,
) -> Dict:
    params = {
        "session_id": session_id,
        "reservation_id": reservation_id,
        "amount": amount,
        "currency": currency,
        "status": "initiated",
        "payment_status": "pending",
        "metadata": json.dumps(metadata or {}),
    }
    rows = execute_write(INSERT_PAYMENT_TRANSACTION, params)
    return rows[0] if rows else {}


def update_payment_transaction(session_id: str, status: str, payment_status: str) -> None:
    execute_update(UPDATE_PAYMENT_TRANSACTION, {
        "session_id": session_id,
        "status": status,
        "payment_status": payment_status,
    })


# =============================================================================
# STATS
# =============================================================================

def get_stats() -> Dict:
    rows = execute_query(GET_STATS)
    return rows[0] if rows else {}


# =============================================================================
# EMAIL (optional, requires SMTP config)
# =============================================================================

def send_booking_confirmation_email(reservation: Dict) -> bool:
    """Send booking confirmation via SMTP. Returns True if sent."""
    import smtplib
    from email.message import EmailMessage
    from config.config import (
        SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
        SMTP_FROM_EMAIL, SMTP_USE_TLS, SMTP_USE_SSL,
    )

    if not SMTP_HOST or not SMTP_FROM_EMAIL:
        return False

    customer_email = reservation.get("customer_email")
    if not customer_email:
        return False

    subject = "Jola Yacht - Booking Confirmation"
    body = (
        "Your booking has been confirmed.\n\n"
        f"Reservation ID: {reservation.get('id', '')}\n"
        f"Date: {reservation.get('date', '')}\n"
        f"Time: {reservation.get('time_slot', '')}\n"
        f"Guests: {reservation.get('guests', '')}\n"
        f"Total: MXN {reservation.get('total_price', '')}\n\n"
        "Thank you for choosing Jola Yacht."
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = customer_email
    msg.set_content(body)

    try:
        if SMTP_USE_SSL:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            if SMTP_USE_TLS:
                server.starttls()
        if SMTP_USERNAME:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False
