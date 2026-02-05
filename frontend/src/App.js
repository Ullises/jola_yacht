import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageProvider } from "./context/LanguageContext";

// Components
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ExperiencesSection } from "./components/ExperiencesSection";
import { WhyUsSection } from "./components/WhyUsSection";
import { FleetSection } from "./components/FleetSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { FAQSection } from "./components/FAQSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { BookingPage } from "./components/BookingPage";
import { PaymentSuccess, PaymentCancel } from "./components/PaymentPages";
import { AdminLogin, AdminDashboard } from "./components/AdminDashboard";

// Landing Page
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ExperiencesSection />
        <WhyUsSection />
        <FleetSection />
        <ReviewsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Booking Routes */}
            <Route path="/booking/:experienceId" element={
              <>
                <Navbar />
                <BookingPage />
              </>
            } />
            <Route path="/booking/fleet/:fleetId" element={
              <>
                <Navbar />
                <BookingPage />
              </>
            } />
            
            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </LanguageProvider>
  );
}

export default App;
