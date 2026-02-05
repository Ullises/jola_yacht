# Jola Yacht - Tourism Booking Website PRD

## Project Overview
Luxury boat and water sports rental booking website for Jola Yacht in Cancun, Mexico.

## Original Problem Statement
Design and develop a modern, high-end tourism booking website inspired by Viator, GetYourGuide, and Airbnb Experiences with strong brand identity, prioritizing conversions, easy reservations, mobile responsiveness, and visual storytelling.

## User Personas
1. **Tourists** - Visitors to Cancun looking for water activities
2. **Couples** - Seeking romantic experiences like sunset cruises
3. **Families** - Looking for group-friendly activities
4. **Luxury Travelers** - Premium yacht rental customers
5. **Adventure Seekers** - Jet ski and snorkeling enthusiasts
6. **Event Groups** - Bachelor/bachelorette parties, celebrations

## Core Requirements
- [x] Responsive landing page with all sections
- [x] Multi-language support (Spanish/English)
- [x] Experience/Tour cards carousel (Viator-style)
- [x] Fleet showcase section
- [x] Customer reviews carousel
- [x] FAQ accordion
- [x] Contact section with Google Maps embed
- [x] WhatsApp integration (placeholder)
- [x] Booking flow with calendar and time slots
- [x] Stripe payment integration
- [x] Admin dashboard
- [ ] PayPal payment integration
- [ ] Email notifications

## What's Been Implemented (December 2025)

### Backend (FastAPI + MongoDB)
- MongoDB models: Experiences, Fleet, Reservations, Reviews, FAQs, PaymentTransactions, AdminUsers
- Public APIs: GET experiences, fleet, reviews, faqs, availability
- Reservation creation and management
- Stripe checkout session integration
- JWT admin authentication
- Data seeding endpoint

### Frontend (React + Tailwind + Shadcn UI)
- Sticky navigation with language toggle
- Hero section with brand imagery
- Experience cards with ratings, prices, booking CTAs
- Fleet showcase carousel
- Reviews carousel with avatars and ratings
- FAQ accordion component
- Contact section with form and Google Maps
- 3-step booking flow (Date → Guests → Contact Info)
- Payment success/cancel pages
- Admin login and dashboard (stats, reservations, experiences, fleet views)

### Design
- Color palette: Deep Ocean Navy (#0F2C59), Sunset Coral (#FF7F50), Emerald (#10B981)
- Typography: Playfair Display (headings), Manrope (body)
- Glassmorphism and hover animations
- Mobile-first responsive design

## Prioritized Backlog

### P0 - Critical (Blocking)
- None currently

### P1 - High Priority
- [ ] PayPal payment integration (user requested)
- [ ] Admin CRUD forms for adding/editing experiences and fleet
- [ ] Real WhatsApp Business number integration

### P2 - Medium Priority
- [ ] Email notification system (SendGrid/Resend)
- [ ] Dynamic pricing based on season
- [ ] Weather API integration
- [ ] Promo codes / discounts system

### P3 - Nice to Have
- [ ] User accounts with booking history
- [ ] Photo gallery with video reels
- [ ] Live chat assistant
- [ ] Analytics tracking integration
- [ ] Customer review submission form

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, React Router
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Payments**: Stripe (emergentintegrations library)
- **Auth**: JWT with bcrypt

## Admin Credentials
- Email: admin@jolayacht.com
- Password: JolaYacht2025!

## API Endpoints
```
Public:
GET  /api/experiences
GET  /api/experiences/{id}
GET  /api/fleet
GET  /api/fleet/{id}
GET  /api/reviews
GET  /api/reviews/featured
GET  /api/faqs
GET  /api/availability/{date}
POST /api/reservations
POST /api/checkout/session
GET  /api/checkout/status/{session_id}
POST /api/webhook/stripe

Admin (requires Bearer token):
POST /api/auth/login
GET  /api/admin/reservations
PUT  /api/admin/reservations/{id}/status
GET  /api/admin/stats
POST /api/admin/experiences
PUT  /api/admin/experiences/{id}
DELETE /api/admin/experiences/{id}
POST /api/admin/fleet
PUT  /api/admin/fleet/{id}
DELETE /api/admin/fleet/{id}
POST /api/admin/reviews
POST /api/admin/faqs
```

## Next Tasks
1. Implement PayPal checkout option
2. Add admin forms for creating/editing experiences and fleet
3. Connect real WhatsApp Business number
