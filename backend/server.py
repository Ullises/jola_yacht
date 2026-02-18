from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import base64
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'jola_yacht_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

# PayPal Config
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET', '')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')  # sandbox or live
PAYPAL_API_URL = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == 'sandbox' else "https://api-m.paypal.com"

# Create the main app
app = FastAPI(title="Jola Yacht API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ==================== MODELS ====================

class Experience(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_es: str
    title_en: str
    description_es: str
    description_en: str
    highlights_es: List[str] = []
    highlights_en: List[str] = []
    price: float
    duration_minutes: int
    rating: float = 5.0
    review_count: int = 0
    images: List[str] = []
    max_guests: int = 10
    includes: List[str] = []
    category: str = "water_activity"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class Fleet(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # yacht, jetski, waverunner
    description_es: str
    description_en: str
    capacity: int
    price_per_hour: float
    amenities_es: List[str] = []
    amenities_en: List[str] = []
    specs: Dict[str, str] = {}
    images: List[str] = []
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class TimeSlot(BaseModel):
    time: str
    available: bool = True

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    experience_id: Optional[str] = None
    fleet_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    date: str
    time_slot: str
    guests: int
    original_price: float = 0
    discount_amount: float = 0
    total_price: float
    promo_code: Optional[str] = None
    promotion_id: Optional[str] = None
    add_ons: List[str] = []
    status: str = "pending"  # pending, confirmed, cancelled, completed
    payment_status: str = "pending"  # pending, paid, refunded
    payment_session_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReservationCreate(BaseModel):
    experience_id: Optional[str] = None
    fleet_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    date: str
    time_slot: str
    guests: int
    promo_code: Optional[str] = None
    add_ons: List[str] = []
    notes: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    rating: int
    comment_es: str
    comment_en: str
    avatar: Optional[str] = None
    experience_id: Optional[str] = None
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    customer_name: str
    rating: int
    comment_es: str
    comment_en: str
    avatar: Optional[str] = None
    experience_id: Optional[str] = None
    is_featured: bool = False

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    reservation_id: str
    amount: float
    currency: str = "mxn"
    status: str = "initiated"
    payment_status: str = "pending"
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str = "Admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CheckoutRequest(BaseModel):
    reservation_id: str
    origin_url: str

class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_es: str
    question_en: str
    answer_es: str
    answer_en: str
    order: int = 0
    is_active: bool = True

class FAQCreate(BaseModel):
    question_es: str
    question_en: str
    answer_es: str
    answer_en: str
    order: int = 0

class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_es: str
    name_en: str
    description_es: str
    description_en: str
    discount_type: str = "percentage"  # percentage, fixed_amount
    discount_value: float  # percentage (0-100) or fixed amount in MXN
    promo_code: Optional[str] = None  # optional promo code
    season_type: str = "custom"  # holiday, seasonal, weekend, custom
    holiday_name: Optional[str] = None  # valentine, christmas, new_year, spring_break, summer, etc.
    start_date: str  # YYYY-MM-DD
    end_date: str  # YYYY-MM-DD
    applies_to: str = "all"  # all, experiences, fleet, specific
    specific_items: List[str] = []  # list of experience/fleet IDs if applies_to == "specific"
    min_guests: int = 1
    min_purchase: float = 0  # minimum purchase amount
    max_uses: Optional[int] = None  # max number of times this promo can be used
    current_uses: int = 0
    is_active: bool = True
    banner_image: Optional[str] = None
    badge_color: str = "#FF7F50"  # color for the promotion badge
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

# ==================== HELPERS ====================

def create_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    admin = await db.admins.find_one({"email": email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

async def get_active_promotions_for_date(date_str: str, item_type: str = None, item_id: str = None):
    """Get all active promotions that apply to a specific date and optionally an item"""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d') if not date_str else date_str
    
    query = {
        "is_active": True,
        "start_date": {"$lte": today},
        "end_date": {"$gte": today}
    }
    
    promotions = await db.promotions.find(query, {"_id": 0}).to_list(100)
    
    applicable = []
    for promo in promotions:
        # Check max uses
        if promo.get('max_uses') and promo.get('current_uses', 0) >= promo['max_uses']:
            continue
        
        # Check if applies to this item type
        applies_to = promo.get('applies_to', 'all')
        if applies_to == 'all':
            applicable.append(promo)
        elif applies_to == item_type:
            applicable.append(promo)
        elif applies_to == 'specific' and item_id in promo.get('specific_items', []):
            applicable.append(promo)
    
    return applicable

def calculate_discounted_price(original_price: float, promotion: dict) -> tuple:
    """Calculate discounted price based on promotion. Returns (discounted_price, discount_amount)"""
    discount_type = promotion.get('discount_type', 'percentage')
    discount_value = promotion.get('discount_value', 0)
    
    if discount_type == 'percentage':
        discount_amount = original_price * (discount_value / 100)
    else:  # fixed_amount
        discount_amount = min(discount_value, original_price)
    
    discounted_price = max(0, original_price - discount_amount)
    return (discounted_price, discount_amount)

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Jola Yacht API - Welcome!", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Experiences
@api_router.get("/experiences", response_model=List[Experience])
async def get_experiences():
    experiences = await db.experiences.find({"is_active": True}, {"_id": 0}).to_list(100)
    for exp in experiences:
        if isinstance(exp.get('created_at'), str):
            exp['created_at'] = datetime.fromisoformat(exp['created_at'])
    return experiences

@api_router.get("/experiences/{experience_id}", response_model=Experience)
async def get_experience(experience_id: str):
    exp = await db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    if isinstance(exp.get('created_at'), str):
        exp['created_at'] = datetime.fromisoformat(exp['created_at'])
    return exp

# Fleet
@api_router.get("/fleet", response_model=List[Fleet])
async def get_fleet():
    fleet = await db.fleet.find({"is_available": True}, {"_id": 0}).to_list(100)
    for item in fleet:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return fleet

@api_router.get("/fleet/{fleet_id}", response_model=Fleet)
async def get_fleet_item(fleet_id: str):
    item = await db.fleet.find_one({"id": fleet_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Fleet item not found")
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    return item

# Reviews
@api_router.get("/reviews", response_model=List[Review])
async def get_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    for rev in reviews:
        if isinstance(rev.get('created_at'), str):
            rev['created_at'] = datetime.fromisoformat(rev['created_at'])
    return reviews

@api_router.get("/reviews/featured", response_model=List[Review])
async def get_featured_reviews():
    reviews = await db.reviews.find({"is_featured": True}, {"_id": 0}).to_list(10)
    for rev in reviews:
        if isinstance(rev.get('created_at'), str):
            rev['created_at'] = datetime.fromisoformat(rev['created_at'])
    return reviews

# FAQs
@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return faqs

# Promotions (Public)
@api_router.get("/promotions/active")
async def get_active_promotions(date: Optional[str] = None):
    """Get all currently active promotions"""
    today = date or datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    promotions = await db.promotions.find({
        "is_active": True,
        "start_date": {"$lte": today},
        "end_date": {"$gte": today}
    }, {"_id": 0}).to_list(50)
    
    # Filter out maxed out promotions
    active = []
    for promo in promotions:
        if promo.get('max_uses') and promo.get('current_uses', 0) >= promo['max_uses']:
            continue
        active.append(promo)
    
    return active

@api_router.get("/promotions/check/{date}")
async def check_promotions_for_date(date: str, item_type: Optional[str] = None, item_id: Optional[str] = None):
    """Check what promotions apply for a specific date and optionally an item"""
    promotions = await get_active_promotions_for_date(date, item_type, item_id)
    return {"date": date, "promotions": promotions}

@api_router.post("/promotions/validate-code")
async def validate_promo_code(code: str, date: str, amount: float, guests: int = 1):
    """Validate a promo code and return discount info"""
    promo = await db.promotions.find_one({
        "promo_code": code.upper(),
        "is_active": True,
        "start_date": {"$lte": date},
        "end_date": {"$gte": date}
    }, {"_id": 0})
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")
    
    # Check max uses
    if promo.get('max_uses') and promo.get('current_uses', 0) >= promo['max_uses']:
        raise HTTPException(status_code=400, detail="This promo code has reached its maximum uses")
    
    # Check minimum requirements
    if guests < promo.get('min_guests', 1):
        raise HTTPException(status_code=400, detail=f"Minimum {promo['min_guests']} guests required")
    
    if amount < promo.get('min_purchase', 0):
        raise HTTPException(status_code=400, detail=f"Minimum purchase of ${promo['min_purchase']} MXN required")
    
    discounted_price, discount_amount = calculate_discounted_price(amount, promo)
    
    return {
        "valid": True,
        "promotion": promo,
        "original_price": amount,
        "discount_amount": discount_amount,
        "final_price": discounted_price
    }

# Availability
@api_router.get("/availability/{date}")
async def get_availability(date: str):
    """Get available time slots for a specific date"""
    # Get all reservations for this date
    reservations = await db.reservations.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time_slot": 1}
    ).to_list(100)
    
    booked_slots = [r["time_slot"] for r in reservations]
    
    # Define available time slots
    all_slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    
    slots = []
    for slot in all_slots:
        slots.append(TimeSlot(time=slot, available=slot not in booked_slots))
    
    return {"date": date, "slots": slots}

# Reservations
@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation: ReservationCreate):
    # Get experience or fleet pricing
    original_price = 0.0
    item_type = None
    item_id = None
    
    if reservation.experience_id:
        exp = await db.experiences.find_one({"id": reservation.experience_id}, {"_id": 0})
        if exp:
            original_price = exp["price"] * reservation.guests
            item_type = "experiences"
            item_id = reservation.experience_id
    elif reservation.fleet_id:
        fleet_item = await db.fleet.find_one({"id": reservation.fleet_id}, {"_id": 0})
        if fleet_item:
            original_price = fleet_item["price_per_hour"] * 2  # Default 2 hours
            item_type = "fleet"
            item_id = reservation.fleet_id
    
    # Apply promotion/promo code if provided
    total_price = original_price
    discount_amount = 0.0
    promotion_id = None
    
    if reservation.promo_code:
        promo = await db.promotions.find_one({
            "promo_code": reservation.promo_code.upper(),
            "is_active": True,
            "start_date": {"$lte": reservation.date},
            "end_date": {"$gte": reservation.date}
        }, {"_id": 0})
        
        if promo:
            # Check if promo applies to this item
            applies_to = promo.get('applies_to', 'all')
            can_apply = False
            
            if applies_to == 'all':
                can_apply = True
            elif applies_to == item_type:
                can_apply = True
            elif applies_to == 'specific' and item_id in promo.get('specific_items', []):
                can_apply = True
            
            if can_apply:
                # Check requirements
                if reservation.guests >= promo.get('min_guests', 1) and original_price >= promo.get('min_purchase', 0):
                    total_price, discount_amount = calculate_discounted_price(original_price, promo)
                    promotion_id = promo['id']
                    
                    # Increment usage count
                    await db.promotions.update_one(
                        {"id": promo['id']},
                        {"$inc": {"current_uses": 1}}
                    )
    else:
        # Check for automatic promotions (without promo code)
        auto_promos = await get_active_promotions_for_date(reservation.date, item_type, item_id)
        # Apply the best automatic promotion
        best_discount = 0
        for promo in auto_promos:
            if promo.get('promo_code'):  # Skip code-based promos
                continue
            if reservation.guests >= promo.get('min_guests', 1) and original_price >= promo.get('min_purchase', 0):
                _, discount = calculate_discounted_price(original_price, promo)
                if discount > best_discount:
                    best_discount = discount
                    total_price = original_price - discount
                    discount_amount = discount
                    promotion_id = promo['id']
    
    res_obj = Reservation(
        **reservation.model_dump(),
        original_price=original_price,
        discount_amount=discount_amount,
        total_price=total_price,
        promotion_id=promotion_id
    )
    
    doc = res_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reservations.insert_one(doc)
    return res_obj

@api_router.get("/reservations/{reservation_id}", response_model=Reservation)
async def get_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if isinstance(res.get('created_at'), str):
        res['created_at'] = datetime.fromisoformat(res['created_at'])
    return res

# Payment
@api_router.post("/checkout/session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    # Get reservation
    reservation = await db.reservations.find_one({"id": request.reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Setup Stripe
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = request.origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{host_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(reservation["total_price"]),
        currency="mxn",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "reservation_id": request.reservation_id,
            "customer_email": reservation["customer_email"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        reservation_id=request.reservation_id,
        amount=float(reservation["total_price"]),
        currency="mxn",
        status="initiated",
        payment_status="pending",
        metadata={"reservation_id": request.reservation_id}
    )
    
    tx_doc = transaction.model_dump()
    tx_doc['created_at'] = tx_doc['created_at'].isoformat()
    await db.payment_transactions.insert_one(tx_doc)
    
    # Update reservation with session ID
    await db.reservations.update_one(
        {"id": request.reservation_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and reservation if paid
    if status.payment_status == "paid":
        # Check if already processed
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx and tx.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            
            # Update reservation
            await db.reservations.update_one(
                {"payment_session_id": session_id},
                {"$set": {"status": "confirmed", "payment_status": "paid"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            
            await db.reservations.update_one(
                {"payment_session_id": session_id},
                {"$set": {"status": "confirmed", "payment_status": "paid"}}
            )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def admin_login(login: LoginRequest):
    admin = await db.admins.find_one({"email": login.email}, {"_id": 0})
    
    if not admin:
        # Create default admin if not exists
        default_email = os.environ.get('ADMIN_EMAIL', 'admin@jolayacht.com')
        default_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        if login.email == default_email and login.password == default_password:
            admin_user = AdminUser(
                email=default_email,
                password_hash=hash_password(default_password),
                name="Admin"
            )
            doc = admin_user.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.admins.insert_one(doc)
            
            token = create_token(login.email)
            return TokenResponse(access_token=token)
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(login.email)
    return TokenResponse(access_token=token)

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/experiences", response_model=Experience)
async def create_experience(exp: ExperienceCreate, admin=Depends(get_current_admin)):
    exp_obj = Experience(**exp.model_dump())
    doc = exp_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.experiences.insert_one(doc)
    return exp_obj

@api_router.put("/admin/experiences/{experience_id}", response_model=Experience)
async def update_experience(experience_id: str, exp: ExperienceCreate, admin=Depends(get_current_admin)):
    existing = await db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    update_data = exp.model_dump()
    await db.experiences.update_one({"id": experience_id}, {"$set": update_data})
    
    updated = await db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/admin/experiences/{experience_id}")
async def delete_experience(experience_id: str, admin=Depends(get_current_admin)):
    result = await db.experiences.delete_one({"id": experience_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"status": "deleted"}

@api_router.post("/admin/fleet", response_model=Fleet)
async def create_fleet(item: FleetCreate, admin=Depends(get_current_admin)):
    fleet_obj = Fleet(**item.model_dump())
    doc = fleet_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.fleet.insert_one(doc)
    return fleet_obj

@api_router.put("/admin/fleet/{fleet_id}", response_model=Fleet)
async def update_fleet(fleet_id: str, item: FleetCreate, admin=Depends(get_current_admin)):
    existing = await db.fleet.find_one({"id": fleet_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Fleet item not found")
    
    update_data = item.model_dump()
    await db.fleet.update_one({"id": fleet_id}, {"$set": update_data})
    
    updated = await db.fleet.find_one({"id": fleet_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/admin/fleet/{fleet_id}")
async def delete_fleet(fleet_id: str, admin=Depends(get_current_admin)):
    result = await db.fleet.delete_one({"id": fleet_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fleet item not found")
    return {"status": "deleted"}

@api_router.post("/admin/reviews", response_model=Review)
async def create_review(review: ReviewCreate, admin=Depends(get_current_admin)):
    review_obj = Review(**review.model_dump())
    doc = review_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    return review_obj

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "deleted"}

@api_router.post("/admin/faqs", response_model=FAQ)
async def create_faq(faq: FAQCreate, admin=Depends(get_current_admin)):
    faq_obj = FAQ(**faq.model_dump())
    doc = faq_obj.model_dump()
    await db.faqs.insert_one(doc)
    return faq_obj

@api_router.put("/admin/faqs/{faq_id}", response_model=FAQ)
async def update_faq(faq_id: str, faq: FAQCreate, admin=Depends(get_current_admin)):
    existing = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    update_data = faq.model_dump()
    await db.faqs.update_one({"id": faq_id}, {"$set": update_data})
    
    updated = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/faqs/{faq_id}")
async def delete_faq(faq_id: str, admin=Depends(get_current_admin)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"status": "deleted"}

@api_router.get("/admin/reservations", response_model=List[Reservation])
async def get_all_reservations(admin=Depends(get_current_admin)):
    reservations = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for res in reservations:
        if isinstance(res.get('created_at'), str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
    return reservations

@api_router.put("/admin/reservations/{reservation_id}/status")
async def update_reservation_status(reservation_id: str, status: str, admin=Depends(get_current_admin)):
    result = await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"status": "updated"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin=Depends(get_current_admin)):
    total_reservations = await db.reservations.count_documents({})
    confirmed_reservations = await db.reservations.count_documents({"status": "confirmed"})
    pending_reservations = await db.reservations.count_documents({"status": "pending"})
    
    # Calculate revenue
    paid_reservations = await db.reservations.find(
        {"payment_status": "paid"},
        {"_id": 0, "total_price": 1}
    ).to_list(1000)
    total_revenue = sum(r.get("total_price", 0) for r in paid_reservations)
    
    total_experiences = await db.experiences.count_documents({"is_active": True})
    total_fleet = await db.fleet.count_documents({"is_available": True})
    
    return {
        "total_reservations": total_reservations,
        "confirmed_reservations": confirmed_reservations,
        "pending_reservations": pending_reservations,
        "total_revenue": total_revenue,
        "total_experiences": total_experiences,
        "total_fleet": total_fleet
    }

# Admin Promotions
@api_router.get("/admin/promotions", response_model=List[Promotion])
async def get_all_promotions(admin=Depends(get_current_admin)):
    promotions = await db.promotions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for promo in promotions:
        if isinstance(promo.get('created_at'), str):
            promo['created_at'] = datetime.fromisoformat(promo['created_at'])
    return promotions

@api_router.post("/admin/promotions", response_model=Promotion)
async def create_promotion(promo: PromotionCreate, admin=Depends(get_current_admin)):
    promo_data = promo.model_dump()
    # Uppercase the promo code if provided
    if promo_data.get('promo_code'):
        promo_data['promo_code'] = promo_data['promo_code'].upper()
    
    promo_obj = Promotion(**promo_data)
    doc = promo_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.promotions.insert_one(doc)
    return promo_obj

@api_router.put("/admin/promotions/{promo_id}", response_model=Promotion)
async def update_promotion(promo_id: str, promo: PromotionCreate, admin=Depends(get_current_admin)):
    existing = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    update_data = promo.model_dump()
    if update_data.get('promo_code'):
        update_data['promo_code'] = update_data['promo_code'].upper()
    
    await db.promotions.update_one({"id": promo_id}, {"$set": update_data})
    
    updated = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/admin/promotions/{promo_id}")
async def delete_promotion(promo_id: str, admin=Depends(get_current_admin)):
    result = await db.promotions.delete_one({"id": promo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"status": "deleted"}

@api_router.put("/admin/promotions/{promo_id}/toggle")
async def toggle_promotion(promo_id: str, admin=Depends(get_current_admin)):
    promo = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    new_status = not promo.get('is_active', True)
    await db.promotions.update_one({"id": promo_id}, {"$set": {"is_active": new_status}})
    return {"status": "toggled", "is_active": new_status}

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    """Seed initial data for the application"""
    
    # Check if data already exists
    exp_count = await db.experiences.count_documents({})
    if exp_count > 0:
        return {"message": "Data already seeded"}
    
    # Seed Experiences
    experiences = [
        {
            "id": str(uuid.uuid4()),
            "title_es": "Aventura en Moto Acuática y Snorkel",
            "title_en": "Jet Ski & Snorkel Adventure",
            "description_es": "Vive la emoción de recorrer las aguas cristalinas de Cancún en moto acuática, seguido de una increíble sesión de snorkel en los arrecifes más hermosos del Caribe.",
            "description_en": "Experience the thrill of riding through Cancun's crystal-clear waters on a jet ski, followed by an amazing snorkeling session at the most beautiful Caribbean reefs.",
            "highlights_es": ["Cancelación gratuita", "2 horas de duración", "Equipo incluido", "Guía profesional"],
            "highlights_en": ["Free cancellation", "2 hours duration", "Equipment included", "Professional guide"],
            "price": 1750.0,
            "duration_minutes": 120,
            "rating": 4.8,
            "review_count": 50,
            "images": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"],
            "max_guests": 6,
            "includes": ["jet_ski", "snorkel_gear", "life_vest", "guide"],
            "category": "adventure",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title_es": "Paseo en Moto Acuática Costera",
            "title_en": "WaveRunner Coastal Tour",
            "description_es": "Descubre la costa de Cancún desde una perspectiva única. Navega por la Zona Hotelera y disfruta de vistas espectaculares del Mar Caribe.",
            "description_en": "Discover Cancun's coastline from a unique perspective. Navigate through the Hotel Zone and enjoy spectacular views of the Caribbean Sea.",
            "highlights_es": ["Cancelación gratuita", "30 minutos", "Fotos incluidas", "Chaleco salvavidas"],
            "highlights_en": ["Free cancellation", "30 minutes", "Photos included", "Life vest"],
            "price": 1750.0,
            "duration_minutes": 30,
            "rating": 4.8,
            "review_count": 50,
            "images": ["https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800"],
            "max_guests": 4,
            "includes": ["waverunner", "life_vest", "photos"],
            "category": "water_activity",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title_es": "Tour en Jetski por Manglares",
            "title_en": "Mangrove Jet Ski Tour",
            "description_es": "Explora los impresionantes manglares de Cancún en una emocionante aventura en jetski. Observa la vida silvestre local y disfruta de la naturaleza.",
            "description_en": "Explore Cancun's impressive mangroves on an exciting jet ski adventure. Observe local wildlife and enjoy nature.",
            "highlights_es": ["Cancelación gratuita", "2 horas", "Eco-tour", "Guía experto"],
            "highlights_en": ["Free cancellation", "2 hours", "Eco-tour", "Expert guide"],
            "price": 1750.0,
            "duration_minutes": 120,
            "rating": 4.8,
            "review_count": 50,
            "images": ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800"],
            "max_guests": 8,
            "includes": ["jet_ski", "guide", "refreshments"],
            "category": "eco_tour",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title_es": "Alquiler de Waverunners en Cancún",
            "title_en": "Cancun Waverunner Rentals",
            "description_es": "Renta una moto acuática y explora las aguas de Cancún a tu propio ritmo. Perfecto para familias y grupos de amigos.",
            "description_en": "Rent a waverunner and explore Cancun's waters at your own pace. Perfect for families and groups of friends.",
            "highlights_es": ["Cancelación gratuita", "2 horas", "Flexible", "Sin guía requerido"],
            "highlights_en": ["Free cancellation", "2 hours", "Flexible", "No guide required"],
            "price": 1750.0,
            "duration_minutes": 120,
            "rating": 4.8,
            "review_count": 50,
            "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
            "max_guests": 2,
            "includes": ["waverunner", "life_vest", "fuel"],
            "category": "rental",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title_es": "Crucero al Atardecer",
            "title_en": "Sunset Cruise",
            "description_es": "Disfruta de un romántico crucero al atardecer en nuestro lujoso yate. Incluye bebidas premium y aperitivos gourmet.",
            "description_en": "Enjoy a romantic sunset cruise on our luxury yacht. Includes premium drinks and gourmet appetizers.",
            "highlights_es": ["Bebidas incluidas", "3 horas", "Aperitivos gourmet", "Música en vivo"],
            "highlights_en": ["Drinks included", "3 hours", "Gourmet appetizers", "Live music"],
            "price": 3500.0,
            "duration_minutes": 180,
            "rating": 5.0,
            "review_count": 35,
            "images": ["https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800"],
            "max_guests": 12,
            "includes": ["yacht", "drinks", "food", "music"],
            "category": "luxury",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.experiences.insert_many(experiences)
    
    # Seed Fleet
    fleet_items = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sea Ray 40",
            "type": "yacht",
            "description_es": "Lujoso yate de 40 pies ideal para grupos y celebraciones especiales. Equipado con todas las comodidades.",
            "description_en": "Luxurious 40-foot yacht ideal for groups and special celebrations. Equipped with all amenities.",
            "capacity": 12,
            "price_per_hour": 5000.0,
            "amenities_es": ["Aire acondicionado", "Sistema de sonido", "Cocina", "Baño", "Área de sol"],
            "amenities_en": ["Air conditioning", "Sound system", "Kitchen", "Bathroom", "Sun deck"],
            "specs": {"length": "40 ft", "year": "2022", "engine": "Twin Mercury 350hp"},
            "images": ["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800"],
            "is_available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yamaha VX Cruiser",
            "type": "jetski",
            "description_es": "Moto acuática de alto rendimiento perfecta para aventuras en el mar. Fácil de manejar y muy divertida.",
            "description_en": "High-performance jet ski perfect for sea adventures. Easy to handle and lots of fun.",
            "capacity": 2,
            "price_per_hour": 1200.0,
            "amenities_es": ["GPS", "Compartimento impermeable", "Espejo retrovisor"],
            "amenities_en": ["GPS", "Waterproof compartment", "Rearview mirror"],
            "specs": {"engine": "1049cc", "year": "2023", "top_speed": "65 mph"},
            "images": ["https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800"],
            "is_available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sea-Doo GTX",
            "type": "waverunner",
            "description_es": "WaveRunner premium con sistema de audio integrado. La mejor opción para paseos costeros.",
            "description_en": "Premium WaveRunner with integrated audio system. The best choice for coastal rides.",
            "capacity": 3,
            "price_per_hour": 1500.0,
            "amenities_es": ["Sistema de audio Bluetooth", "Almacenamiento", "Freno inteligente"],
            "amenities_en": ["Bluetooth audio system", "Storage", "Intelligent brake"],
            "specs": {"engine": "1630cc", "year": "2023", "top_speed": "70 mph"},
            "images": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"],
            "is_available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.fleet.insert_many(fleet_items)
    
    # Seed Reviews
    reviews = [
        {
            "id": str(uuid.uuid4()),
            "customer_name": "Samantha Garza",
            "rating": 5,
            "comment_es": "Una experiencia inolvidable. El capitán y la tripulación ofrecieron excelente servicio. ¡Volveremos!",
            "comment_en": "An unforgettable experience. The captain and crew provided excellent service. We'll be back!",
            "avatar": "https://randomuser.me/api/portraits/women/44.jpg",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "customer_name": "Pedro Silva",
            "rating": 5,
            "comment_es": "Excelente experiencia vivida en familia. Los niños se divirtieron muchísimo con las motos acuáticas.",
            "comment_en": "Excellent family experience. The kids had a blast with the jet skis.",
            "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "customer_name": "Oscar Morales",
            "rating": 5,
            "comment_es": "Nos divertimos muchísimo en el Caribe mexicano. El tour de manglares fue espectacular.",
            "comment_en": "We had so much fun in the Mexican Caribbean. The mangrove tour was spectacular.",
            "avatar": "https://randomuser.me/api/portraits/men/45.jpg",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "customer_name": "María López",
            "rating": 5,
            "comment_es": "El crucero al atardecer fue mágico. Perfecto para nuestra luna de miel.",
            "comment_en": "The sunset cruise was magical. Perfect for our honeymoon.",
            "avatar": "https://randomuser.me/api/portraits/women/68.jpg",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.reviews.insert_many(reviews)
    
    # Seed FAQs
    faqs = [
        {
            "id": str(uuid.uuid4()),
            "question_es": "¿Qué está incluido en el alquiler?",
            "question_en": "What is included in the rental?",
            "answer_es": "Todos nuestros alquileres incluyen chaleco salvavidas, equipo de seguridad, briefing de seguridad y seguro básico. Los tours también incluyen guía profesional bilingüe.",
            "answer_en": "All our rentals include life vest, safety equipment, safety briefing, and basic insurance. Tours also include a bilingual professional guide.",
            "order": 1,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "question_es": "¿Cuál es la política de cancelación?",
            "question_en": "What is the cancellation policy?",
            "answer_es": "Ofrecemos cancelación gratuita hasta 24 horas antes de tu reserva. Cancelaciones con menos de 24 horas de anticipación tienen un cargo del 50%.",
            "answer_en": "We offer free cancellation up to 24 hours before your booking. Cancellations with less than 24 hours notice have a 50% charge.",
            "order": 2,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "question_es": "¿Cuáles son los requisitos de seguridad?",
            "question_en": "What are the safety requirements?",
            "answer_es": "Todos los participantes deben saber nadar. Los menores de 18 años deben estar acompañados por un adulto. Se requiere firmar un acuerdo de responsabilidad.",
            "answer_en": "All participants must know how to swim. Minors under 18 must be accompanied by an adult. A liability waiver must be signed.",
            "order": 3,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "question_es": "¿Qué pasa si el clima no es favorable?",
            "question_en": "What happens if the weather is unfavorable?",
            "answer_es": "En caso de mal clima, ofrecemos reprogramación gratuita o reembolso completo. Tu seguridad es nuestra prioridad.",
            "answer_en": "In case of bad weather, we offer free rescheduling or a full refund. Your safety is our priority.",
            "order": 4,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "question_es": "¿Cuál es la edad mínima para participar?",
            "question_en": "What is the minimum age to participate?",
            "answer_es": "Para conducir motos acuáticas se requiere tener al menos 18 años con licencia válida. Los pasajeros pueden ser de cualquier edad con chaleco salvavidas apropiado.",
            "answer_en": "To drive jet skis, you must be at least 18 years old with a valid license. Passengers can be of any age with an appropriate life vest.",
            "order": 5,
            "is_active": True
        }
    ]
    
    await db.faqs.insert_many(faqs)
    
    # Seed Promotions
    promotions = [
        {
            "id": str(uuid.uuid4()),
            "name_es": "San Valentín - Crucero Romántico",
            "name_en": "Valentine's Day - Romantic Cruise",
            "description_es": "Celebra el amor con un 20% de descuento en todos nuestros cruceros al atardecer durante febrero.",
            "description_en": "Celebrate love with 20% off all sunset cruises during February.",
            "discount_type": "percentage",
            "discount_value": 20,
            "promo_code": None,
            "season_type": "holiday",
            "holiday_name": "valentine",
            "start_date": "2025-02-01",
            "end_date": "2025-02-28",
            "applies_to": "all",
            "specific_items": [],
            "min_guests": 2,
            "min_purchase": 0,
            "max_uses": None,
            "current_uses": 0,
            "is_active": True,
            "badge_color": "#E91E63",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name_es": "Spring Break Fiesta",
            "name_en": "Spring Break Fiesta",
            "description_es": "¡Es temporada de Spring Break! 15% de descuento en todas las motos acuáticas.",
            "description_en": "It's Spring Break season! 15% off all jet skis.",
            "discount_type": "percentage",
            "discount_value": 15,
            "promo_code": "SPRING25",
            "season_type": "seasonal",
            "holiday_name": "spring_break",
            "start_date": "2025-03-01",
            "end_date": "2025-04-15",
            "applies_to": "fleet",
            "specific_items": [],
            "min_guests": 1,
            "min_purchase": 0,
            "max_uses": 100,
            "current_uses": 0,
            "is_active": True,
            "badge_color": "#4CAF50",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name_es": "Verano en Cancún",
            "name_en": "Cancun Summer",
            "description_es": "Temporada alta de verano - 10% de descuento en reservas de grupos de 4+",
            "description_en": "Summer high season - 10% off for groups of 4+",
            "discount_type": "percentage",
            "discount_value": 10,
            "promo_code": None,
            "season_type": "seasonal",
            "holiday_name": "summer",
            "start_date": "2025-06-01",
            "end_date": "2025-08-31",
            "applies_to": "all",
            "specific_items": [],
            "min_guests": 4,
            "min_purchase": 0,
            "max_uses": None,
            "current_uses": 0,
            "is_active": True,
            "badge_color": "#FF9800",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name_es": "Navidad y Año Nuevo",
            "name_en": "Christmas & New Year",
            "description_es": "Celebra las fiestas en el mar - $500 MXN de descuento en yates",
            "description_en": "Celebrate the holidays at sea - $500 MXN off yacht rentals",
            "discount_type": "fixed_amount",
            "discount_value": 500,
            "promo_code": "XMAS2025",
            "season_type": "holiday",
            "holiday_name": "christmas",
            "start_date": "2025-12-15",
            "end_date": "2026-01-06",
            "applies_to": "fleet",
            "specific_items": [],
            "min_guests": 1,
            "min_purchase": 3000,
            "max_uses": 50,
            "current_uses": 0,
            "is_active": True,
            "badge_color": "#C62828",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name_es": "Semana Santa Especial",
            "name_en": "Easter Week Special",
            "description_es": "Semana Santa en el Caribe - 25% de descuento en experiencias familiares",
            "description_en": "Easter Week in the Caribbean - 25% off family experiences",
            "discount_type": "percentage",
            "discount_value": 25,
            "promo_code": None,
            "season_type": "holiday",
            "holiday_name": "easter",
            "start_date": "2025-04-13",
            "end_date": "2025-04-20",
            "applies_to": "experiences",
            "specific_items": [],
            "min_guests": 3,
            "min_purchase": 0,
            "max_uses": None,
            "current_uses": 0,
            "is_active": True,
            "badge_color": "#9C27B0",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.promotions.insert_many(promotions)
    
    return {"message": "Data seeded successfully", "experiences": len(experiences), "fleet": len(fleet_items), "reviews": len(reviews), "faqs": len(faqs), "promotions": len(promotions)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
