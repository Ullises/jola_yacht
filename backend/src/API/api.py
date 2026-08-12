# api.py - Jola Yacht FastAPI application
import sys
import os
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import stripe
import json
import logging
import httpx
import base64
from fastapi import Request

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.config import DATABASE_URL
from Utils.jolayacht_exec import (
    # Auth
    hash_password, verify_password, create_token, verify_token,
    get_admin_by_email, create_admin,
    # Experiences
    get_all_experiences, get_experience_by_id,
    create_experience, update_experience, delete_experience,
    # Fleet
    get_all_fleet, get_fleet_by_id,
    create_fleet_item, update_fleet_item, delete_fleet_item,
    # Reviews
    get_all_reviews, get_featured_reviews, create_review, delete_review,
    # FAQs
    get_all_faqs, create_faq, update_faq, delete_faq,
    # Promotions
    get_all_promotions, get_active_promotions_for_date,
    validate_promo_code, calculate_discounted_price,
    create_promotion, update_promotion, delete_promotion, toggle_promotion,
    # Availability & Reservations
    get_availability,
    get_all_reservations, get_reservation_by_id,
    get_reservation_by_session_id, create_reservation,
    update_reservation_status, mark_reservation_paid,
    # Payments
    create_payment_transaction, update_payment_transaction,
    #Add this
    execute_update,
    # Stats & Email
    get_stats, send_booking_confirmation_email,
)

# =============================================================================
# APP SETUP
# =============================================================================

app = FastAPI(title="Jola Yacht API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# MODELS
# =============================================================================

# ---- Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- Experiences
class ExperienceCreate(BaseModel):
    title_es: str
    title_en: str
    description_es: str
    description_en: str
    highlights_es: List[str] = []
    highlights_en: List[str] = []
    price: float
    duration_minutes: int
    images: List[str] = []
    max_guests: int = 10
    includes: List[str] = []
    category: str = "water_activity"

# ---- Fleet
class FleetCreate(BaseModel):
    name: str
    type: str
    description_es: str
    description_en: str
    capacity: int
    price_per_hour: float
    amenities_es: List[str] = []
    amenities_en: List[str] = []
    specs: Dict[str, str] = {}
    images: List[str] = []

# ---- Reviews
class ReviewCreate(BaseModel):
    customer_name: str
    rating: int
    comment_es: str
    comment_en: str
    avatar: Optional[str] = None
    experience_id: Optional[str] = None
    is_featured: bool = False

# ---- FAQs
class FAQCreate(BaseModel):
    question_es: str
    question_en: str
    answer_es: str
    answer_en: str
    order: int = 0

# ---- Promotions
class PromotionCreate(BaseModel):
    name_es: str
    name_en: str
    description_es: str
    description_en: str
    discount_type: str = "percentage"
    discount_value: float
    promo_code: Optional[str] = None
    season_type: str = "custom"
    holiday_name: Optional[str] = None
    start_date: str
    end_date: str
    applies_to: str = "all"
    specific_items: List[str] = []
    min_guests: int = 1
    min_purchase: float = 0
    max_uses: Optional[int] = None
    banner_image: Optional[str] = None
    badge_color: str = "#FF7F50"

# ---- Reservations
class ReservationCreate(BaseModel):
    experience_id: Optional[str] = None
    fleet_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    date: str            # YYYY-MM-DD
    time_slot: str       # HH:MM
    guests: int = 1
    promo_code: Optional[str] = None
    add_ons: List[str] = []
    notes: Optional[str] = None

class ReservationStatusUpdate(BaseModel):
    status: str

# ---- Promo validation
class PromoValidateRequest(BaseModel):
    code: str
    date: str
    amount: float
    guests: int = 1

# ---- Stripe Checkout models
class CheckoutRequest(BaseModel):
    reservation_id: str
    origin_url: str

# ---- PayPal Checkout models
class PaypalCheckoutRequest(BaseModel):
    reservation_id: str
    origin_url: str

# =============================================================================
# AUTH DEPENDENCY
# =============================================================================

def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[len("Bearer "):]
    try:
        email = verify_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    admin = get_admin_by_email(email)
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

# =============================================================================
# PUBLIC ROUTES
# =============================================================================

@app.get("/")
async def root():
    return {"message": "Jola Yacht API is running", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    from sqlalchemy import create_engine, text
    try:
        eng = create_engine(DATABASE_URL, pool_pre_ping=True)
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "error": str(exc)})


# ---- Experiences
@app.get("/experiences")
async def list_experiences():
    try:
        data = get_all_experiences()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/experiences/{experience_id}")
async def get_experience(experience_id: str):
    exp = get_experience_by_id(experience_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"status": "success", "data": exp}


# ---- Fleet
@app.get("/fleet")
async def list_fleet():
    try:
        data = get_all_fleet()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/fleet/{fleet_id}")
async def get_fleet(fleet_id: str):
    item = get_fleet_by_id(fleet_id)
    if not item:
        raise HTTPException(status_code=404, detail="Fleet item not found")
    return {"status": "success", "data": item}


# ---- Reviews
@app.get("/reviews")
async def list_reviews():
    try:
        data = get_all_reviews()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/reviews/featured")
async def list_featured_reviews():
    try:
        data = get_featured_reviews()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- FAQs
@app.get("/faqs")
async def list_faqs():
    try:
        data = get_all_faqs()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- Promotions (public)
@app.get("/promotions/active")
async def list_active_promotions(date: Optional[str] = None):
    try:
        from datetime import date as dt_date
        d = date or dt_date.today().isoformat()
        data = get_active_promotions_for_date(d)
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/promotions/check/{date}")
async def check_promotions_for_date(
    date: str,
    item_type: Optional[str] = None,
    item_id: Optional[str] = None,
):
    try:
        data = get_active_promotions_for_date(date, item_type, item_id)
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/promotions/validate-code")
async def validate_promotion_code(body: PromoValidateRequest):
    try:
        promo = validate_promo_code(body.code, body.date, body.amount, body.guests)
        if not promo:
            return {"status": "invalid", "valid": False, "message": "Promo code not valid or expired"}
        _, discount_amount = calculate_discounted_price(body.amount, promo)
        final_price = max(0.0, body.amount - discount_amount)
        return {
            "status": "valid",
            "valid": True,
            "promotion": promo,
            "original_price": body.amount,
            "discount_amount": discount_amount,
            "final_price": final_price,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- Availability
@app.get("/availability/{date}")
async def check_availability(date: str):
    try:
        data = get_availability(date)
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- Reservations (public: create & get own)
@app.post("/reservations")
async def book_reservation(reservation: ReservationCreate):
    try:
        data = create_reservation(reservation.model_dump())
        return {"status": "success", "data": data}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        # Handle unique constraint violation (double booking)
        err = str(exc).lower()
        if "unique" in err or "duplicate" in err or "uq_reservation" in err:
            raise HTTPException(
                status_code=409,
                detail="That time slot is already booked for this asset and date",
            )
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str):
    res = get_reservation_by_id(reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"status": "success", "data": res}

# =============================================================================
# STRIPE ROUTES
# =============================================================================

@app.post("/checkout/session")
async def create_checkout_session(body: CheckoutRequest):
    stripe.api_key = os.environ.get("STRIPE_API_KEY")

    # Get reservation
    reservation = get_reservation_by_id(body.reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    success_url = f"{body.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{body.origin_url}/payment/cancel"

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "mxn",
                    "unit_amount": int(float(reservation["total_price"]) * 100),  # cents
                    "product_data": {
                        "name": "Jola Yacht Reservation",
                        "description": f'Reservation for {reservation["customer_name"]}',
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "reservation_id": body.reservation_id,
                "customer_email": reservation["customer_email"],
            },
        )

        # Save payment transaction
        create_payment_transaction(
            session_id=session.id,
            reservation_id=body.reservation_id,
            amount=float(reservation["total_price"]),
            currency="mxn",
            metadata={"reservation_id": body.reservation_id},
        )

        # Link session ID to reservation
        execute_update(
            "UPDATE reservations SET payment_session_id = :session_id WHERE id = :id",
            {"session_id": session.id, "id": body.reservation_id},
        )

        return {"url": session.url, "session_id": session.id}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    stripe.api_key = os.environ.get("STRIPE_API_KEY")

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        payment_status = session.payment_status  # "paid", "unpaid", "no_payment_required"

        if payment_status == "paid":
            update_payment_transaction(session_id, "completed", "paid")
            mark_reservation_paid(session_id)

        return {
            "status": session.status,
            "payment_status": payment_status,
            "amount_total": session.amount_total / 100 if session.amount_total else 0,
            "currency": session.currency,
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# PAYPAL ROUTES
# =============================================================================

PAYPAL_BASE = "https://api-m.paypal.com"


async def _paypal_access_token() -> str:
    """Fetch a short-lived PayPal OAuth2 access token."""
    client_id = os.environ.get("PAYPAL_CLIENT_ID", "")
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET", "")
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_BASE}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


@app.post("/checkout/paypal")
async def create_paypal_order(body: PaypalCheckoutRequest):
    reservation = get_reservation_by_id(body.reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    token = await _paypal_access_token()
    amount = "{:.2f}".format(float(reservation["total_price"]))

    return_url = (
        f"{body.origin_url}/payment/success"
        f"?paypal_order_id=PAYPAL_ORDER_ID"
        f"&reservation_id={body.reservation_id}"
    )
    cancel_url = f"{body.origin_url}/payment/cancel"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_BASE}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "MXN",
                        "value": amount,
                    },
                    "description": f"Jola Yacht – {reservation['customer_name']}",
                    "custom_id": body.reservation_id,
                }],
                "application_context": {
                    "return_url": return_url,
                    "cancel_url": cancel_url,
                    "brand_name": "Jola Yacht",
                    "user_action": "PAY_NOW",
                },
            },
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=400, detail=resp.text)
        data = resp.json()

    order_id = data["id"]
    approval_url = next(
        (link["href"] for link in data["links"] if link["rel"] == "approve"), None
    )
    if not approval_url:
        raise HTTPException(status_code=500, detail="PayPal did not return an approval URL")

    # Replace placeholder so the actual order_id is in the return_url
    approval_url_with_id = approval_url  # PayPal appends token= automatically

    create_payment_transaction(
        session_id=order_id,
        reservation_id=body.reservation_id,
        amount=float(reservation["total_price"]),
        currency="mxn",
        metadata={"reservation_id": body.reservation_id, "provider": "paypal"},
    )
    execute_update(
        "UPDATE reservations SET payment_session_id = :session_id WHERE id = :id",
        {"session_id": order_id, "id": body.reservation_id},
    )

    return {"approval_url": approval_url_with_id, "order_id": order_id}


@app.post("/checkout/paypal/capture/{order_id}")
async def capture_paypal_order(order_id: str):
    token = await _paypal_access_token()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_BASE}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=400, detail=resp.text)
        data = resp.json()

    if data.get("status") == "COMPLETED":
        update_payment_transaction(order_id, "completed", "paid")
        mark_reservation_paid(order_id)
        reservation = get_reservation_by_session_id(order_id)
        if reservation:
            send_booking_confirmation_email(reservation)

    return {"status": data.get("status"), "order_id": order_id}


@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    stripe.api_key = os.environ.get("STRIPE_API_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    body = await request.body()
    signature = request.headers.get("Stripe-Signature")

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            event = json.loads(body)  # dev fallback

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            sid = session["id"]

            if session.get("payment_status") == "paid":
                update_payment_transaction(sid, "completed", "paid")
                mark_reservation_paid(sid)

                reservation = get_reservation_by_session_id(sid)
                if reservation:
                    send_booking_confirmation_email(reservation)

        return {"status": "success"}

    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# AUTH ROUTES
# =============================================================================

@app.post("/auth/login", response_model=TokenResponse)
async def admin_login(body: LoginRequest):
    admin = get_admin_by_email(body.email)
    if not admin or not verify_password(body.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(body.email)
    return TokenResponse(access_token=token)


# =============================================================================
# ADMIN ROUTES
# =============================================================================

# ---- Experiences (admin)
@app.post("/admin/experiences")
async def admin_create_experience(
    exp: ExperienceCreate, admin=Depends(get_current_admin)
):
    try:
        data = create_experience(exp.model_dump())
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admin/experiences/{experience_id}")
async def admin_update_experience(
    experience_id: str, exp: ExperienceCreate, admin=Depends(get_current_admin)
):
    data = update_experience(experience_id, exp.model_dump())
    if not data:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"status": "success", "data": data}


@app.delete("/admin/experiences/{experience_id}")
async def admin_delete_experience(
    experience_id: str, admin=Depends(get_current_admin)
):
    if not delete_experience(experience_id):
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"status": "success", "message": "Experience deactivated"}


# ---- Fleet (admin)
@app.post("/admin/fleet")
async def admin_create_fleet(
    item: FleetCreate, admin=Depends(get_current_admin)
):
    try:
        data = create_fleet_item(item.model_dump())
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admin/fleet/{fleet_id}")
async def admin_update_fleet(
    fleet_id: str, item: FleetCreate, admin=Depends(get_current_admin)
):
    data = update_fleet_item(fleet_id, item.model_dump())
    if not data:
        raise HTTPException(status_code=404, detail="Fleet item not found")
    return {"status": "success", "data": data}


@app.delete("/admin/fleet/{fleet_id}")
async def admin_delete_fleet(
    fleet_id: str, admin=Depends(get_current_admin)
):
    if not delete_fleet_item(fleet_id):
        raise HTTPException(status_code=404, detail="Fleet item not found")
    return {"status": "success", "message": "Fleet item deactivated"}


# ---- Reviews (admin)
@app.post("/admin/reviews")
async def admin_create_review(
    review: ReviewCreate, admin=Depends(get_current_admin)
):
    try:
        data = create_review(review.model_dump())
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, admin=Depends(get_current_admin)):
    if not delete_review(review_id):
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "success", "message": "Review deleted"}


# ---- FAQs (admin)
@app.post("/admin/faqs")
async def admin_create_faq(faq: FAQCreate, admin=Depends(get_current_admin)):
    try:
        data = create_faq(faq.model_dump())
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admin/faqs/{faq_id}")
async def admin_update_faq(
    faq_id: str, faq: FAQCreate, admin=Depends(get_current_admin)
):
    data = update_faq(faq_id, faq.model_dump())
    if not data:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"status": "success", "data": data}


@app.delete("/admin/faqs/{faq_id}")
async def admin_delete_faq(faq_id: str, admin=Depends(get_current_admin)):
    if not delete_faq(faq_id):
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"status": "success", "message": "FAQ deactivated"}


# ---- Reservations (admin)
@app.get("/admin/reservations")
async def admin_list_reservations(admin=Depends(get_current_admin)):
    try:
        data = get_all_reservations()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admin/reservations/{reservation_id}/status")
async def admin_update_reservation_status(
    reservation_id: str,
    body: ReservationStatusUpdate,
    admin=Depends(get_current_admin),
):
    valid_statuses = {"pending", "confirmed", "cancelled", "completed"}
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )
    result = update_reservation_status(reservation_id, body.status)
    if not result:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"status": "success", "data": result}


# ---- Stats (admin)
@app.get("/admin/stats")
async def admin_get_stats(admin=Depends(get_current_admin)):
    try:
        data = get_stats()
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- Promotions (admin)
@app.get("/admin/promotions")
async def admin_list_promotions(admin=Depends(get_current_admin)):
    try:
        data = get_all_promotions()
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/admin/promotions")
async def admin_create_promotion(
    promo: PromotionCreate, admin=Depends(get_current_admin)
):
    try:
        data = create_promotion(promo.model_dump())
        return {"status": "success", "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admin/promotions/{promo_id}")
async def admin_update_promotion(
    promo_id: str, promo: PromotionCreate, admin=Depends(get_current_admin)
):
    data = update_promotion(promo_id, promo.model_dump())
    if not data:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"status": "success", "data": data}


@app.delete("/admin/promotions/{promo_id}")
async def admin_delete_promotion(promo_id: str, admin=Depends(get_current_admin)):
    if not delete_promotion(promo_id):
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"status": "success", "message": "Promotion deleted"}


@app.put("/admin/promotions/{promo_id}/toggle")
async def admin_toggle_promotion(promo_id: str, admin=Depends(get_current_admin)):
    is_active = toggle_promotion(promo_id)
    if is_active is None:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {
        "status": "success",
        "is_active": is_active,
        "message": "Promotion activated" if is_active else "Promotion deactivated",
    }


# ---- Payment confirmation webhook (simple internal)
@app.post("/internal/confirm-payment/{session_id}")
async def confirm_payment(session_id: str, admin=Depends(get_current_admin)):
    """
    Internal endpoint to manually mark a payment as paid and confirm reservation.
    Used as fallback when webhook is not available.
    """
    try:
        update_payment_transaction(session_id, "completed", "paid")
        mark_reservation_paid(session_id)
        reservation = get_reservation_by_session_id(session_id)
        if reservation:
            send_booking_confirmation_email(reservation)
        return {"status": "success", "message": "Payment confirmed and reservation updated"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---- Admin seed (create first admin user if none exists)
@app.post("/admin/seed-admin")
async def seed_admin(body: LoginRequest):
    """
    Create the first admin user. Should be called once during setup.
    Returns 409 if an admin with that email already exists.
    """
    existing = get_admin_by_email(body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Admin with this email already exists")
    try:
        admin = create_admin(body.email, body.password)
        return {"status": "success", "data": admin}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
