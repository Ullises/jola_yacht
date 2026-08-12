"""
seed.py - Populate Jola Yacht PostgreSQL database with realistic demo data.
Run from the backend/ directory:
    python seed.py
"""

import os
import sys
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── path setup ────────────────────────────────────────────────────────────────
sys.path.append(str(Path(__file__).parent / "src"))

from config.config import DATABASE_URL, JWT_SECRET, JWT_ALGORITHM
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =============================================================================
# HELPERS
# =============================================================================

def run(query: str, params: dict = None):
    with engine.begin() as conn:
        result = conn.execute(text(query), params or {})
        try:
            return [dict(row._mapping) for row in result]
        except Exception:
            return []


def jdump(obj) -> str:
    """Serialize a Python object to a JSON string for JSONB columns."""
    return json.dumps(obj, ensure_ascii=False)


# =============================================================================
# 1. ADMIN USER
# =============================================================================

def seed_admin():
    print("  → Admin user...")
    existing = run("SELECT id FROM admin_users WHERE email = :e", {"e": "admin@jolayacht.com"})
    if existing:
        print("     already exists, skipping.")
        return

    hashed = pwd_ctx.hash("Admin1234!")
    run(
        """
        INSERT INTO admin_users (email, password_hash, name)
        VALUES (:email, :pw, :name)
        """,
        {"email": "admin@jolayacht.com", "pw": hashed, "name": "Jola Admin"},
    )
    print("     created  admin@jolayacht.com  /  Admin1234!")


# =============================================================================
# 2. EXPERIENCES
# =============================================================================

EXPERIENCES = [
    {
        "title_es": "Tour en Yate al Atardecer",
        "title_en": "Sunset Yacht Tour",
        "description_es": "Disfruta de un espectacular atardecer caribeño a bordo de nuestro yate de lujo. Incluye bebidas de bienvenida y música en vivo.",
        "description_en": "Enjoy a spectacular Caribbean sunset aboard our luxury yacht. Includes welcome drinks and live music.",
        "highlights_es": ["Bebidas de bienvenida incluidas", "Música en vivo", "Mejores vistas al atardecer", "Capitán y tripulación expertos"],
        "highlights_en": ["Welcome drinks included", "Live music", "Best sunset views", "Expert captain & crew"],
        "price": 120.00,
        "duration_minutes": 180,
        "images": [
            "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
            "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800"
        ],
        "max_guests": 12,
        "includes": ["Bebidas de bienvenida", "Snacks", "Equipo de snorkel", "Chaleco salvavidas"],
        "category": "yacht",
    },
    {
        "title_es": "Aventura en Moto Acuática",
        "title_en": "Jet Ski Adventure",
        "description_es": "Adrenalina pura en las aguas cristalinas del Caribe. Recorre la costa de Cancún a alta velocidad con nuestras modernas motos acuáticas.",
        "description_en": "Pure adrenaline in the crystal-clear Caribbean waters. Ride along the Cancún coastline at high speed on our modern jet skis.",
        "highlights_es": ["Equipo de última generación", "Guía experto incluido", "Ruta costera exclusiva", "Apto para principiantes"],
        "highlights_en": ["State-of-the-art equipment", "Expert guide included", "Exclusive coastal route", "Beginner friendly"],
        "price": 75.00,
        "duration_minutes": 60,
        "images": [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
            "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"
        ],
        "max_guests": 2,
        "includes": ["Chaleco salvavidas", "Guía experto", "Instrucción básica", "Seguro básico"],
        "category": "jetski",
    },
    {
        "title_es": "Tour a Isla Mujeres",
        "title_en": "Isla Mujeres Tour",
        "description_es": "Visita la hermosa Isla Mujeres en un cómodo catamarán. Disfruta de snorkel, playa y la vibrante cultura local.",
        "description_en": "Visit the beautiful Isla Mujeres on a comfortable catamaran. Enjoy snorkeling, beach time, and vibrant local culture.",
        "highlights_es": ["Snorkel en arrecife de coral", "Tiempo libre en playa", "Almuerzo incluido", "Guía bilingüe"],
        "highlights_en": ["Coral reef snorkeling", "Free time on the beach", "Lunch included", "Bilingual guide"],
        "price": 95.00,
        "duration_minutes": 480,
        "images": [
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800"
        ],
        "max_guests": 20,
        "includes": ["Almuerzo", "Equipo de snorkel", "Transporte de ida y vuelta", "Guía bilingüe"],
        "category": "tour",
    },
    {
        "title_es": "Pesca Deportiva",
        "title_en": "Sport Fishing",
        "description_es": "Una experiencia de pesca deportiva de clase mundial en las aguas profundas del Mar Caribe. Ideal para aficionados y expertos.",
        "description_en": "A world-class sport fishing experience in the deep waters of the Caribbean Sea. Ideal for enthusiasts and experts alike.",
        "highlights_es": ["Equipo de pesca profesional", "Carnada incluida", "Limpieza del pescado", "Nevera con bebidas"],
        "highlights_en": ["Professional fishing gear", "Bait included", "Fish cleaning service", "Cooler with drinks"],
        "price": 350.00,
        "duration_minutes": 480,
        "images": [
            "https://images.unsplash.com/photo-1545816250-0b4b9a0b8b8e?w=800",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
        ],
        "max_guests": 6,
        "includes": ["Equipo de pesca", "Carnada", "Bebidas", "Limpieza del pescado"],
        "category": "fishing",
    },
    {
        "title_es": "Fiesta en Yate",
        "title_en": "Yacht Party",
        "description_es": "Celebra tu evento especial a bordo de nuestro yate de lujo. Bodas, cumpleaños, eventos corporativos — lo hacemos memorable.",
        "description_en": "Celebrate your special event aboard our luxury yacht. Weddings, birthdays, corporate events — we make it unforgettable.",
        "highlights_es": ["Decoración personalizada", "Servicio de catering disponible", "Sistema de sonido profesional", "Fotografía opcional"],
        "highlights_en": ["Custom decoration", "Catering service available", "Professional sound system", "Optional photography"],
        "price": 500.00,
        "duration_minutes": 300,
        "images": [
            "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800",
            "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800"
        ],
        "max_guests": 30,
        "includes": ["Decoración básica", "Sistema de sonido", "Tripulación", "Seguridad"],
        "category": "event",
    },
]


def seed_experiences():
    print("  → Experiences...")
    existing = run("SELECT COUNT(*) as c FROM experiences")
    if existing[0]["c"] > 0:
        print(f"     {existing[0]['c']} already exist, skipping.")
        return

    for exp in EXPERIENCES:
        run(
            """
            INSERT INTO experiences (
                title_es, title_en, description_es, description_en,
                highlights_es, highlights_en, price, duration_minutes,
                images, max_guests, includes, category
            ) VALUES (
                :title_es, :title_en, :description_es, :description_en,
                CAST(:highlights_es AS jsonb), CAST(:highlights_en AS jsonb),
                :price, :duration_minutes,
                CAST(:images AS jsonb), :max_guests,
                CAST(:includes AS jsonb), :category
            )
            """,
            {
                **exp,
                "highlights_es": jdump(exp["highlights_es"]),
                "highlights_en": jdump(exp["highlights_en"]),
                "images":        jdump(exp["images"]),
                "includes":      jdump(exp["includes"]),
            },
        )
    print(f"     inserted {len(EXPERIENCES)} experiences.")


# =============================================================================
# 3. FLEET
# =============================================================================

FLEET = [
    {
        "name": "Jola Princess",
        "type": "yacht",
        "description_es": "Nuestro yate insignia de 45 pies. Lujo, comodidad y velocidad para hasta 12 pasajeros. Perfecto para tours privados y eventos especiales.",
        "description_en": "Our flagship 45-foot yacht. Luxury, comfort, and speed for up to 12 passengers. Perfect for private tours and special events.",
        "capacity": 12,
        "price_per_hour": 250.00,
        "amenities_es": ["Aire acondicionado", "Sala de estar", "Cocina equipada", "2 camarotes", "Baño privado", "Sistema de sonido"],
        "amenities_en": ["Air conditioning", "Living room", "Equipped kitchen", "2 cabins", "Private bathroom", "Sound system"],
        "specs": {
            "length_ft": 45,
            "engine": "Twin Volvo 370HP",
            "max_speed_knots": 28,
            "fuel_capacity_gal": 200,
            "year": 2019
        },
        "images": [
            "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
            "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800"
        ],
    },
    {
        "name": "Caribbean Star",
        "type": "catamaran",
        "description_es": "Catamarán espacioso de 38 pies ideal para grupos grandes. Estabilidad y confort excepcionales en cualquier condición marítima.",
        "description_en": "Spacious 38-foot catamaran ideal for large groups. Exceptional stability and comfort in any sea condition.",
        "capacity": 20,
        "price_per_hour": 180.00,
        "amenities_es": ["Cubierta amplia", "Área de snorkel", "Hamacas a bordo", "Nevera", "Sistema de música", "Toldo solar"],
        "amenities_en": ["Wide deck", "Snorkel area", "On-board hammocks", "Cooler", "Music system", "Sun canopy"],
        "specs": {
            "length_ft": 38,
            "engine": "2x Yamaha 150HP",
            "max_speed_knots": 18,
            "fuel_capacity_gal": 120,
            "year": 2020
        },
        "images": [
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800"
        ],
    },
    {
        "name": "Jet Ski Pro X1",
        "type": "jetski",
        "description_es": "Moto acuática Sea-Doo RXP-X 300 de alta performance. La más rápida de nuestra flota para máxima emoción.",
        "description_en": "High-performance Sea-Doo RXP-X 300 jet ski. The fastest in our fleet for maximum excitement.",
        "capacity": 2,
        "price_per_hour": 80.00,
        "amenities_es": ["300HP Rotax", "GPS integrado", "Modo sport/eco", "Chaleco incluido"],
        "amenities_en": ["300HP Rotax", "Integrated GPS", "Sport/eco mode", "Life jacket included"],
        "specs": {
            "model": "Sea-Doo RXP-X 300",
            "horsepower": 300,
            "max_speed_mph": 67,
            "year": 2022
        },
        "images": [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
            "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"
        ],
    },
    {
        "name": "Jet Ski Fun Ride",
        "type": "jetski",
        "description_es": "Moto acuática Yamaha WaveRunner ideal para principiantes y familias. Estable, segura y muy divertida.",
        "description_en": "Yamaha WaveRunner jet ski ideal for beginners and families. Stable, safe, and a lot of fun.",
        "capacity": 3,
        "price_per_hour": 65.00,
        "amenities_es": ["Motor 1.8L", "Asiento para 3 personas", "Modo principiante", "Chaleco incluido"],
        "amenities_en": ["1.8L Engine", "3-person seat", "Beginner mode", "Life jacket included"],
        "specs": {
            "model": "Yamaha WaveRunner EX Deluxe",
            "horsepower": 100,
            "max_speed_mph": 53,
            "year": 2021
        },
        "images": [
            "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
        ],
    },
]


def seed_fleet():
    print("  → Fleet...")
    existing = run("SELECT COUNT(*) as c FROM fleet")
    if existing[0]["c"] > 0:
        print(f"     {existing[0]['c']} already exist, skipping.")
        return

    for vessel in FLEET:
        run(
            """
            INSERT INTO fleet (
                name, type, description_es, description_en,
                capacity, price_per_hour,
                amenities_es, amenities_en, specs, images
            ) VALUES (
                :name, :type, :description_es, :description_en,
                :capacity, :price_per_hour,
                CAST(:amenities_es AS jsonb), CAST(:amenities_en AS jsonb),
                CAST(:specs AS jsonb), CAST(:images AS jsonb)
            )
            """,
            {
                **vessel,
                "amenities_es": jdump(vessel["amenities_es"]),
                "amenities_en": jdump(vessel["amenities_en"]),
                "specs":        jdump(vessel["specs"]),
                "images":       jdump(vessel["images"]),
            },
        )
    print(f"     inserted {len(FLEET)} fleet vessels.")


# =============================================================================
# 4. REVIEWS
# =============================================================================

REVIEWS = [
    {
        "author_name": "Sarah Johnson",
        "author_location": "Chicago, IL",
        "rating": 5,
        "comment_es": "¡Experiencia increíble! El equipo fue muy profesional y el yate era hermoso. Sin duda volveremos.",
        "comment_en": "Incredible experience! The team was very professional and the yacht was beautiful. We will definitely come back.",
        "experience_type": "Sunset Yacht Tour",
        "is_featured": True,
    },
    {
        "author_name": "Carlos Mendoza",
        "author_location": "Ciudad de México, MX",
        "rating": 5,
        "comment_es": "Las motos acuáticas fueron una experiencia única. El guía fue muy atento y nos aseguró en todo momento. ¡100% recomendado!",
        "comment_en": "The jet skis were a unique experience. The guide was very attentive and kept us safe at all times. 100% recommended!",
        "experience_type": "Jet Ski Adventure",
        "is_featured": True,
    },
    {
        "author_name": "Emily & Tom Rivera",
        "author_location": "Miami, FL",
        "rating": 5,
        "comment_es": "Celebramos nuestro aniversario en el yate y fue perfecto. El servicio superó todas nuestras expectativas.",
        "comment_en": "We celebrated our anniversary on the yacht and it was perfect. The service exceeded all our expectations.",
        "experience_type": "Yacht Party",
        "is_featured": True,
    },
    {
        "author_name": "Michael Chen",
        "author_location": "San Francisco, CA",
        "rating": 5,
        "comment_es": "El tour a Isla Mujeres fue fantástico. El guía bilingüe fue excelente y el almuerzo estaba delicioso.",
        "comment_en": "The Isla Mujeres tour was fantastic. The bilingual guide was excellent and the lunch was delicious.",
        "experience_type": "Isla Mujeres Tour",
        "is_featured": True,
    },
    {
        "author_name": "Lucia Fernández",
        "author_location": "Monterrey, MX",
        "rating": 5,
        "comment_es": "La pesca deportiva fue una aventura increíble. Capturamos varios peces y el capitán fue muy experto. ¡Volveremos pronto!",
        "comment_en": "Sport fishing was an incredible adventure. We caught several fish and the captain was very expert. We'll be back soon!",
        "experience_type": "Sport Fishing",
        "is_featured": False,
    },
    {
        "author_name": "James & Lisa Park",
        "author_location": "Toronto, Canada",
        "rating": 4,
        "comment_es": "Muy buena experiencia en general. El catamarán era cómodo y el personal muy amable. Algunas pequeñas mejoras posibles en la logística.",
        "comment_en": "Very good experience overall. The catamaran was comfortable and the staff very friendly. Some small logistical improvements possible.",
        "experience_type": "Isla Mujeres Tour",
        "is_featured": False,
    },
]


def seed_reviews():
    print("  → Reviews...")
    existing = run("SELECT COUNT(*) as c FROM reviews")
    if existing[0]["c"] > 0:
        print(f"     {existing[0]['c']} already exist, skipping.")
        return

    for rev in REVIEWS:
        run(
            """
            INSERT INTO reviews (
                author_name, author_location, rating,
                comment_es, comment_en, experience_type, is_featured
            ) VALUES (
                :author_name, :author_location, :rating,
                :comment_es, :comment_en, :experience_type, :is_featured
            )
            """,
            rev,
        )
    print(f"     inserted {len(REVIEWS)} reviews.")


# =============================================================================
# 5. FAQs
# =============================================================================

FAQS = [
    {
        "question_es": "¿Cuánto tiempo antes debo reservar?",
        "question_en": "How far in advance should I book?",
        "answer_es": "Recomendamos reservar con al menos 48 horas de anticipación. Para eventos especiales o temporada alta (diciembre–enero, Semana Santa), sugerimos reservar con 1–2 semanas de anticipación.",
        "answer_en": "We recommend booking at least 48 hours in advance. For special events or high season (December–January, Easter week), we suggest booking 1–2 weeks ahead.",
        "order": 1,
    },
    {
        "question_es": "¿Qué incluye el precio?",
        "question_en": "What is included in the price?",
        "answer_es": "El precio incluye tripulación profesional, combustible, equipo de seguridad y los artículos específicos de cada experiencia (bebidas, snorkel, almuerzo, etc.). Consulta los detalles de cada paquete.",
        "answer_en": "The price includes professional crew, fuel, safety equipment, and the specific items of each experience (drinks, snorkel gear, lunch, etc.). Check each package's details.",
        "order": 2,
    },
    {
        "question_es": "¿Qué pasa si el clima no es favorable?",
        "question_en": "What happens if the weather is unfavorable?",
        "answer_es": "La seguridad de nuestros clientes es nuestra prioridad. En caso de clima adverso, ofrecemos reprogramación sin costo adicional o reembolso completo.",
        "answer_en": "The safety of our customers is our priority. In case of adverse weather, we offer free rescheduling or a full refund.",
        "order": 3,
    },
    {
        "question_es": "¿Puedo llevar comida y bebidas propias?",
        "question_en": "Can I bring my own food and drinks?",
        "answer_es": "Sí, puedes traer alimentos y bebidas adicionales. También ofrecemos servicio de catering opcional para grupos grandes. Consulta por paquetes personalizados.",
        "answer_en": "Yes, you can bring additional food and drinks. We also offer optional catering service for large groups. Ask about custom packages.",
        "order": 4,
    },
    {
        "question_es": "¿Tienen actividades para niños?",
        "question_en": "Do you have activities for children?",
        "answer_es": "¡Sí! Varios de nuestros tours son aptos para familia. Los niños menores de 12 años tienen descuento especial. Las motos acuáticas requieren mínimo 18 años para conducir.",
        "answer_en": "Yes! Several of our tours are family-friendly. Children under 12 get a special discount. Jet skis require a minimum age of 18 to drive.",
        "order": 5,
    },
    {
        "question_es": "¿Cuál es la política de cancelación?",
        "question_en": "What is the cancellation policy?",
        "answer_es": "Cancelaciones con más de 48 horas de anticipación reciben reembolso completo. Cancelaciones entre 24–48 horas reciben el 50%. Menos de 24 horas no son reembolsables salvo por clima.",
        "answer_en": "Cancellations more than 48 hours in advance receive a full refund. Cancellations between 24–48 hours receive 50%. Less than 24 hours are non-refundable except for weather.",
        "order": 6,
    },
    {
        "question_es": "¿Dónde es el punto de salida?",
        "question_en": "Where is the departure point?",
        "answer_es": "Salimos desde Plaza Náutica, Cancún (Blvd. Kukulcán Km 4.5, Zona Hotelera). Hay estacionamiento disponible y fácil acceso desde los hoteles principales.",
        "answer_en": "We depart from Plaza Náutica, Cancún (Blvd. Kukulcán Km 4.5, Hotel Zone). Parking is available and easy access from the main hotels.",
        "order": 7,
    },
    {
        "question_es": "¿Ofrecen transporte desde el hotel?",
        "question_en": "Do you offer hotel pickup?",
        "answer_es": "Sí, ofrecemos servicio de transporte desde los principales hoteles de la Zona Hotelera de Cancún con costo adicional. Consulta disponibilidad al reservar.",
        "answer_en": "Yes, we offer transportation from the main hotels in the Cancún Hotel Zone for an additional fee. Check availability when booking.",
        "order": 8,
    },
]


def seed_faqs():
    print("  → FAQs...")
    existing = run("SELECT COUNT(*) as c FROM faqs")
    if existing[0]["c"] > 0:
        print(f"     {existing[0]['c']} already exist, skipping.")
        return

    for faq in FAQS:
        run(
            """
            INSERT INTO faqs (question_es, question_en, answer_es, answer_en, "order")
            VALUES (:question_es, :question_en, :answer_es, :answer_en, :order)
            """,
            faq,
        )
    print(f"     inserted {len(FAQS)} FAQs.")


# =============================================================================
# 6. PROMOTIONS
# =============================================================================

def seed_promotions():
    print("  → Promotions...")
    existing = run("SELECT COUNT(*) as c FROM promotions")
    if existing[0]["c"] > 0:
        print(f"     {existing[0]['c']} already exist, skipping.")
        return

    today = datetime.now(timezone.utc).date()

    promotions = [
        {
            "title_es": "Descuento de Temporada Alta",
            "title_en": "High Season Discount",
            "description_es": "¡10% de descuento durante la temporada alta! Válido en todas las experiencias.",
            "description_en": "10% off during high season! Valid on all experiences.",
            "discount_percentage": 10.0,
            "discount_amount": None,
            "season_type": "seasonal",
            "start_date": str(today),
            "end_date": str(today + timedelta(days=90)),
            "promo_code": None,
            "is_active": True,
            "applies_to": jdump(["all"]),
        },
        {
            "title_es": "Código Especial: JOLA20",
            "title_en": "Special Code: JOLA20",
            "description_es": "Usa el código JOLA20 y obtén 20% de descuento en cualquier reserva.",
            "description_en": "Use code JOLA20 and get 20% off any booking.",
            "discount_percentage": 20.0,
            "discount_amount": None,
            "season_type": "custom",
            "start_date": str(today),
            "end_date": str(today + timedelta(days=180)),
            "promo_code": "JOLA20",
            "is_active": True,
            "applies_to": jdump(["all"]),
        },
        {
            "title_es": "Oferta de Fin de Semana",
            "title_en": "Weekend Deal",
            "description_es": "$15 USD de descuento en reservas de fin de semana.",
            "description_en": "$15 USD off weekend bookings.",
            "discount_percentage": None,
            "discount_amount": 15.0,
            "season_type": "weekend",
            "start_date": str(today),
            "end_date": str(today + timedelta(days=365)),
            "promo_code": "WEEKEND15",
            "is_active": True,
            "applies_to": jdump(["all"]),
        },
    ]

    for promo in promotions:
        run(
            """
            INSERT INTO promotions (
                title_es, title_en, description_es, description_en,
                discount_percentage, discount_amount,
                season_type, start_date, end_date,
                promo_code, is_active, applies_to
            ) VALUES (
                :title_es, :title_en, :description_es, :description_en,
                :discount_percentage, :discount_amount,
                :season_type, :start_date, :end_date,
                :promo_code, :is_active, CAST(:applies_to AS jsonb)
            )
            """,
            promo,
        )
    print(f"     inserted {len(promotions)} promotions.")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("\n🌊  Jola Yacht — Database Seeder")
    print("=" * 40)

    seed_admin()
    seed_experiences()
    seed_fleet()
    seed_reviews()
    seed_faqs()
    seed_promotions()

    print("=" * 40)
    print("✅  Seed complete!\n")
    print("  Admin login:")
    print("    Email   : admin@jolayacht.com")
    print("    Password: Admin1234!\n")
    print("  Promo codes available:")
    print("    JOLA20     → 20% off any booking")
    print("    WEEKEND15  → $15 off weekend bookings\n")


if __name__ == "__main__":
    main()