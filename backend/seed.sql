-- =============================================================================
-- 02-seed.sql — Jola Yacht initial seed data
-- Runs automatically via docker-entrypoint-initdb.d after 01-init.sql
-- Requires: pgcrypto extension (created in 01-init.sql)
-- =============================================================================


-- ─────────────────────────────────────────────
-- 1. Admin User  (password: Admin1234!)
-- ─────────────────────────────────────────────
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'admin@jolayacht.com',
  crypt('admin123', gen_salt('bf')),  -- ← matches ADMIN_PASSWORD in .env
  'Jola Admin'
)
ON CONFLICT (email) DO UPDATE
  SET password_hash = crypt('admin123', gen_salt('bf'));  -- ← forces update if user exists


-- ─────────────────────────────────────────────
-- 2. Experiences
-- ─────────────────────────────────────────────
INSERT INTO experiences
  (title_es, title_en, description_es, description_en,
   highlights_es, highlights_en, price, duration_minutes,
   images, max_guests, includes, category)
VALUES
  (
    'Tour en Yate al Atardecer',
    'Sunset Yacht Tour',
    'Disfruta de un espectacular atardecer caribeño a bordo de nuestro yate de lujo. Incluye bebidas de bienvenida y música en vivo.',
    'Enjoy a spectacular Caribbean sunset aboard our luxury yacht. Includes welcome drinks and live music.',
    '["Bebidas de bienvenida incluidas","Música en vivo","Mejores vistas al atardecer","Capitán y tripulación expertos"]',
    '["Welcome drinks included","Live music","Best sunset views","Expert captain & crew"]',
    120.00, 180,
    '["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800","https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800"]',
    12,
    '["Bebidas de bienvenida","Snacks","Equipo de snorkel","Chaleco salvavidas"]',
    'yacht'
  ),
  (
    'Aventura en Moto Acuática',
    'Jet Ski Adventure',
    'Adrenalina pura en las aguas cristalinas del Caribe. Recorre la costa de Cancún a alta velocidad con nuestras modernas motos acuáticas.',
    'Pure adrenaline in the crystal-clear Caribbean waters. Ride along the Cancún coastline at high speed on our modern jet skis.',
    '["Equipo de última generación","Guía experto incluido","Ruta costera exclusiva","Apto para principiantes"]',
    '["State-of-the-art equipment","Expert guide included","Exclusive coastal route","Beginner friendly"]',
    75.00, 60,
    '["https://vallartamagico.com.mx/wp-content/uploads/2022/04/jetski-vallarta-moto-acuatica.jpg"]',
    2,
    '["Chaleco salvavidas","Guía experto","Instrucción básica","Seguro básico"]',
    'jetski'
  ),
  (
    'Tour a Isla Mujeres',
    'Isla Mujeres Tour',
    'Visita la hermosa Isla Mujeres en un cómodo catamarán. Disfruta de snorkel, playa y la vibrante cultura local.',
    'Visit the beautiful Isla Mujeres on a comfortable catamaran. Enjoy snorkeling, beach time, and vibrant local culture.',
    '["Snorkel en arrecife de coral","Tiempo libre en playa","Almuerzo incluido","Guía bilingüe"]',
    '["Coral reef snorkeling","Free time on the beach","Lunch included","Bilingual guide"]',
    95.00, 480,
    '["https://www.civitatis.com/f/mexico/cancun/excursion-isla-mujeres-catamaran-589x392.jpg"]',
    20,
    '["Almuerzo","Equipo de snorkel","Transporte de ida y vuelta","Guía bilingüe"]',
    'tour'
  ),
  (
    'Pesca Deportiva',
    'Sport Fishing',
    'Una experiencia de pesca deportiva de clase mundial en las aguas profundas del Mar Caribe. Ideal para aficionados y expertos.',
    'A world-class sport fishing experience in the deep waters of the Caribbean Sea. Ideal for enthusiasts and experts alike.',
    '["Equipo de pesca profesional","Carnada incluida","Limpieza del pescado","Nevera con bebidas"]',
    '["Professional fishing gear","Bait included","Fish cleaning service","Cooler with drinks"]',
    350.00, 480,
    '["https://eplat.com/content/themes/base/images/cancun/activities/p120/a10555/6-consejos-para-disfrutar-los-tours-de-pesca-en-Cancun1.jpg?width=920&height=520&mode=crop&autorotate=true"]',
    6,
    '["Equipo de pesca","Carnada","Bebidas","Limpieza del pescado"]',
    'fishing'
  ),
  (
    'Fiesta en Yate',
    'Yacht Party',
    'Celebra tu evento especial a bordo de nuestro yate de lujo. Bodas, cumpleaños, eventos corporativos — lo hacemos memorable.',
    'Celebrate your special event aboard our luxury yacht. Weddings, birthdays, corporate events — we make it unforgettable.',
    '["Decoración personalizada","Servicio de catering disponible","Sistema de sonido profesional","Fotografía opcional"]',
    '["Custom decoration","Catering service available","Professional sound system","Optional photography"]',
    500.00, 300,
    '["https://anchorsbook.com/wp-content/uploads/2023/11/pic-5.png.webp"]',
    30,
    '["Decoración básica","Sistema de sonido","Tripulación","Seguridad"]',
    'event'
  );


-- ─────────────────────────────────────────────
-- 3. Fleet
-- ─────────────────────────────────────────────
INSERT INTO fleet
  (name, type, description_es, description_en,
   capacity, price_per_hour,
   amenities_es, amenities_en, specs, images)
VALUES
  (
    'Jola Princess', 'yacht',
    'Nuestro yate insignia de 45 pies. Lujo, comodidad y velocidad para hasta 12 pasajeros. Perfecto para tours privados y eventos especiales.',
    'Our flagship 45-foot yacht. Luxury, comfort, and speed for up to 12 passengers. Perfect for private tours and special events.',
    12, 250.00,
    '["Aire acondicionado","Sala de estar","Cocina equipada","2 camarotes","Baño privado","Sistema de sonido"]',
    '["Air conditioning","Living room","Equipped kitchen","2 cabins","Private bathroom","Sound system"]',
    '{"length_ft":45,"engine":"Twin Volvo 370HP","max_speed_knots":28,"fuel_capacity_gal":200,"year":2019}',
    '["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800","https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800"]'
  ),
  (
    'Caribbean Star', 'catamaran',
    'Catamarán espacioso de 38 pies ideal para grupos grandes. Estabilidad y confort excepcionales en cualquier condición marítima.',
    'Spacious 38-foot catamaran ideal for large groups. Exceptional stability and comfort in any sea condition.',
    20, 180.00,
    '["Cubierta amplia","Área de snorkel","Hamacas a bordo","Nevera","Sistema de música","Toldo solar"]',
    '["Wide deck","Snorkel area","On-board hammocks","Cooler","Music system","Sun canopy"]',
    '{"length_ft":38,"engine":"2x Yamaha 150HP","max_speed_knots":18,"fuel_capacity_gal":120,"year":2020}',
    '["https://img.getmyboat.com/images/0788324a-ef9c-4e73-b320-7b17f3e51a81/-processed.jpg?q=50&fit=crop&w=426&h=276&dpr=2","https://img.getmyboat.com/images/0788324a-ef9c-4e73-b320-7b17f3e51a81/-processed.jpg?q=50&fit=crop&w=426&h=276&dpr=2"]'
  ),
  (
    'Jet Ski Pro X1', 'jetski',
    'Moto acuática Sea-Doo RXP-X 300 de alta performance. La más rápida de nuestra flota para máxima emoción.',
    'High-performance Sea-Doo RXP-X 300 jet ski. The fastest in our fleet for maximum excitement.',
    2, 80.00,
    '["300HP Rotax","GPS integrado","Modo sport/eco","Chaleco incluido"]',
    '["300HP Rotax","Integrated GPS","Sport/eco mode","Life jacket included"]',
    '{"model":"Sea-Doo RXP-X 300","horsepower":300,"max_speed_mph":67,"year":2022}',
    '["https://www.personalwatercraft.com/blog/wp-content/uploads/2017/03/Gratis-X1-Shore-700x398.jpg","https://www.personalwatercraft.com/blog/wp-content/uploads/2017/03/Gratis-X1-Shore-700x398.jpg"]'
  ),
  (
    'Jet Ski Fun Ride', 'jetski',
    'Moto acuática Yamaha WaveRunner ideal para principiantes y familias. Estable, segura y muy divertida.',
    'Yamaha WaveRunner jet ski ideal for beginners and families. Stable, safe, and a lot of fun.',
    3, 65.00,
    '["Motor 1.8L","Asiento para 3 personas","Modo principiante","Chaleco incluido"]',
    '["1.8L Engine","3-person seat","Beginner mode","Life jacket included"]',
    '{"model":"Yamaha WaveRunner EX Deluxe","horsepower":100,"max_speed_mph":53,"year":2021}',
    '["https://www.langkawigotours.com/wp-content/uploads/2024/05/Jet-Ski-Fun-Ride-Langkawi-8.webp","https://www.langkawigotours.com/wp-content/uploads/2024/05/Jet-Ski-Fun-Ride-Langkawi-8.webp"]'
  );


-- ─────────────────────────────────────────────
-- 4. Reviews
--    Uses SELECT … FROM experiences to resolve
--    the experience_id foreign key by title.
-- ─────────────────────────────────────────────
-- Sarah Johnson
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'Sarah Johnson', 5,
  '¡Experiencia increíble! El equipo fue muy profesional y el yate era hermoso. Sin duda volveremos.',
  'Incredible experience! The team was very professional and the yacht was beautiful. We will definitely come back.',
  id, true,
  'https://randomuser.me/api/portraits/women/44.jpg'
FROM experiences WHERE title_en = 'Sunset Yacht Tour' LIMIT 1;

-- Carlos Mendoza
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'Carlos Mendoza', 5,
  'Las motos acuáticas fueron una experiencia única. El guía fue muy atento y nos aseguró en todo momento. ¡100% recomendado!',
  'The jet skis were a unique experience. The guide was very attentive and kept us safe at all times. 100% recommended!',
  id, true,
  'https://randomuser.me/api/portraits/men/73.jpg'
FROM experiences WHERE title_en = 'Jet Ski Adventure' LIMIT 1;

-- Emily & Tom Rivera
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'Emily', 5,
  'Celebramos nuestro aniversario en el yate y fue perfecto. El servicio superó todas nuestras expectativas.',
  'We celebrated our anniversary on the yacht and it was perfect. The service exceeded all our expectations.',
  id, true,
  'https://randomuser.me/api/portraits/women/68.jpg'
FROM experiences WHERE title_en = 'Yacht Party' LIMIT 1;

-- Michael Chen
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'Michael Chen', 5,
  'El tour a Isla Mujeres fue fantástico. El guía bilingüe fue excelente y el almuerzo estaba delicioso.',
  'The Isla Mujeres tour was fantastic. The bilingual guide was excellent and the lunch was delicious.',
  id, true,
  'https://randomuser.me/api/portraits/men/67.jpg'
FROM experiences WHERE title_en = 'Isla Mujeres Tour' LIMIT 1;

-- Lucia Fernández
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'Lucia Fernández', 5,
  'La pesca deportiva fue una aventura increíble. Capturamos varios peces y el capitán fue muy experto. ¡Volveremos pronto!',
  'Sport fishing was an incredible adventure. We caught several fish and the captain was very expert. We''ll be back soon!',
  id, false,
  'https://randomuser.me/api/portraits/women/20.jpg'
FROM experiences WHERE title_en = 'Sport Fishing' LIMIT 1;

-- James
INSERT INTO reviews (customer_name, rating, comment_es, comment_en, experience_id, is_featured, avatar)
SELECT
  'James', 4,
  'Muy buena experiencia en general. El catamarán era cómodo y el personal muy amable. Algunas pequeñas mejoras posibles en la logística.',
  'Very good experience overall. The catamaran was comfortable and the staff very friendly. Some small logistical improvements possible.',
  id, false,
  'https://randomuser.me/api/portraits/men/56.jpg'
FROM experiences WHERE title_en = 'Isla Mujeres Tour' LIMIT 1;


-- ─────────────────────────────────────────────
-- 5. FAQs
-- ─────────────────────────────────────────────
INSERT INTO faqs (question_es, question_en, answer_es, answer_en, "order")
VALUES
  (
    '¿Cuánto tiempo antes debo reservar?',
    'How far in advance should I book?',
    'Recomendamos reservar con al menos 48 horas de anticipación. Para eventos especiales o temporada alta (diciembre–enero, Semana Santa), sugerimos reservar con 1–2 semanas de anticipación.',
    'We recommend booking at least 48 hours in advance. For special events or high season (December–January, Easter week), we suggest booking 1–2 weeks ahead.',
    1
  ),
  (
    '¿Qué incluye el precio?',
    'What is included in the price?',
    'El precio incluye tripulación profesional, combustible, equipo de seguridad y los artículos específicos de cada experiencia (bebidas, snorkel, almuerzo, etc.). Consulta los detalles de cada paquete.',
    'The price includes professional crew, fuel, safety equipment, and the specific items of each experience (drinks, snorkel gear, lunch, etc.). Check each package''s details.',
    2
  ),
  (
    '¿Qué pasa si el clima no es favorable?',
    'What happens if the weather is unfavorable?',
    'La seguridad de nuestros clientes es nuestra prioridad. En caso de clima adverso, ofrecemos reprogramación sin costo adicional o reembolso completo.',
    'The safety of our customers is our priority. In case of adverse weather, we offer free rescheduling or a full refund.',
    3
  ),
  (
    '¿Puedo llevar comida y bebidas propias?',
    'Can I bring my own food and drinks?',
    'Sí, puedes traer alimentos y bebidas adicionales. También ofrecemos servicio de catering opcional para grupos grandes. Consulta por paquetes personalizados.',
    'Yes, you can bring additional food and drinks. We also offer optional catering service for large groups. Ask about custom packages.',
    4
  ),
  (
    '¿Tienen actividades para niños?',
    'Do you have activities for children?',
    '¡Sí! Varios de nuestros tours son aptos para familia. Los niños menores de 12 años tienen descuento especial. Las motos acuáticas requieren mínimo 18 años para conducir.',
    'Yes! Several of our tours are family-friendly. Children under 12 get a special discount. Jet skis require a minimum age of 18 to drive.',
    5
  ),
  (
    '¿Cuál es la política de cancelación?',
    'What is the cancellation policy?',
    'Cancelaciones con más de 48 horas de anticipación reciben reembolso completo. Cancelaciones entre 24–48 horas reciben el 50%. Menos de 24 horas no son reembolsables salvo por clima.',
    'Cancellations more than 48 hours in advance receive a full refund. Cancellations between 24–48 hours receive 50%. Less than 24 hours are non-refundable except for weather.',
    6
  ),
  (
    '¿Dónde es el punto de salida?',
    'Where is the departure point?',
    'Salimos desde Plaza Náutica, Cancún (Blvd. Kukulcán Km 4.5, Zona Hotelera). Hay estacionamiento disponible y fácil acceso desde los hoteles principales.',
    'We depart from Plaza Náutica, Cancún (Blvd. Kukulcán Km 4.5, Hotel Zone). Parking is available and easy access from the main hotels.',
    7
  ),
  (
    '¿Ofrecen transporte desde el hotel?',
    'Do you offer hotel pickup?',
    'Sí, ofrecemos servicio de transporte desde los principales hoteles de la Zona Hotelera de Cancún con costo adicional. Consulta disponibilidad al reservar.',
    'Yes, we offer transportation from the main hotels in the Cancún Hotel Zone for an additional fee. Check availability when booking.',
    8
  );


-- ─────────────────────────────────────────────
-- 6. Promotions
--    Correct columns: name_es/name_en, discount_type/discount_value, applies_to (varchar)
-- ─────────────────────────────────────────────
INSERT INTO promotions
  (name_es, name_en, description_es, description_en,
   discount_type, discount_value,
   promo_code, season_type, start_date, end_date,
   applies_to, is_active, badge_color)
VALUES
  (
    'Descuento de Temporada Alta',
    'High Season Discount',
    '¡10% de descuento durante la temporada alta! Válido en todas las experiencias.',
    '10% off during high season! Valid on all experiences.',
    'percentage', 10.00,
    NULL, 'seasonal', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days',
    'all', true, '#FF7F50'
  ),
  (
    'Código Especial: JOLA20',
    'Special Code: JOLA20',
    'Usa el código JOLA20 y obtén 20% de descuento en cualquier reserva.',
    'Use code JOLA20 and get 20% off any booking.',
    'percentage', 20.00,
    'JOLA20', 'custom', CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days',
    'all', true, '#4A90D9'
  ),
  (
    'Oferta de Fin de Semana',
    'Weekend Deal',
    '$15 USD de descuento en reservas de fin de semana.',
    '$15 USD off weekend bookings.',
    'fixed_amount', 15.00,
    'WEEKEND15', 'weekend', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days',
    'all', true, '#27AE60'
  );
