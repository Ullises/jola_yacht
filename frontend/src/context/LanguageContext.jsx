import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  es: {
    // Navigation
    nav: {
      inicio: 'Inicio',
      flota: 'Flota',
      experiencias: 'Experiencias',
      faqs: 'FAQs',
      contacto: 'Contacto',
      reservar: 'Reservar Ahora',
      admin: 'Admin'
    },
    // Hero
    hero: {
      title: 'Renta de yates y motos acuáticas',
      subtitle: 'Vive una experiencia de lujo, aventura y diversión en el Caribe. Ideal para familias, parejas y grupos.',
      cta1: 'Reservar Experiencia',
      cta2: 'Ver Tours'
    },
    // Experience Cards
    experience: {
      desde: 'Desde',
      mxn: 'MXN',
      cancelacion: 'Cancelación gratuita',
      duracion: 'Duración',
      horas: 'horas',
      minutos: 'min',
      reservar: 'Reservar',
      verMas: 'Ver más'
    },
    // Why Choose Us
    whyUs: {
      title: '¿Por qué elegirnos?',
      subtitle: 'Tu aventura en el Caribe mexicano comienza aquí',
      service: 'Servicio 5 Estrellas',
      serviceDesc: 'Atención personalizada y de primera clase',
      fleet: 'Flota de Lujo',
      fleetDesc: 'Embarcaciones modernas y bien mantenidas',
      crew: 'Tripulación Profesional',
      crewDesc: 'Capitanes certificados y experimentados',
      secure: 'Reserva Segura',
      secureDesc: 'Pagos encriptados y políticas claras',
      multilingual: 'Soporte Multilingüe',
      multilingualDesc: 'Atención en español e inglés',
      transparent: 'Precios Transparentes',
      transparentDesc: 'Sin cargos ocultos ni sorpresas'
    },
    // Fleet
    fleet: {
      title: 'Nuestra Flota',
      subtitle: 'Embarcaciones de primera clase para tu aventura',
      capacity: 'Capacidad',
      personas: 'personas',
      porHora: 'por hora',
      reservar: 'Reservar'
    },
    // Reviews
    reviews: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Experiencias reales de viajeros satisfechos'
    },
    // FAQ
    faq: {
      title: 'Preguntas Frecuentes',
      subtitle: 'Todo lo que necesitas saber'
    },
    // Contact
    contact: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte',
      whatsapp: 'WhatsApp',
      email: 'Correo',
      ubicacion: 'Ubicación',
      horario: 'Horario',
      horarioText: 'Lunes - Domingo: 9:00 AM - 6:00 PM',
      nombre: 'Nombre',
      emailField: 'Email',
      mensaje: 'Mensaje',
      enviar: 'Enviar Mensaje'
    },
    // Booking
    booking: {
      title: 'Reservar',
      selectDate: 'Selecciona fecha',
      selectTime: 'Selecciona hora',
      guests: 'Huéspedes',
      adultos: 'Adultos',
      ninos: 'Niños',
      total: 'Total',
      continuar: 'Continuar',
      confirmar: 'Confirmar Reserva',
      pagar: 'Pagar Ahora',
      nombre: 'Nombre completo',
      email: 'Correo electrónico',
      telefono: 'Teléfono',
      notas: 'Notas adicionales'
    },
    // Footer
    footer: {
      description: 'Tu destino para experiencias acuáticas de lujo en Cancún',
      links: 'Enlaces',
      contacto: 'Contacto',
      derechos: 'Todos los derechos reservados'
    },
    // Payment
    payment: {
      success: '¡Pago Exitoso!',
      successMsg: 'Tu reserva ha sido confirmada. Recibirás un correo con los detalles.',
      cancel: 'Pago Cancelado',
      cancelMsg: 'El proceso de pago fue cancelado. Puedes intentarlo de nuevo.',
      volver: 'Volver al Inicio'
    }
  },
  en: {
    // Navigation
    nav: {
      inicio: 'Home',
      flota: 'Fleet',
      experiencias: 'Experiences',
      faqs: 'FAQs',
      contacto: 'Contact',
      reservar: 'Book Now',
      admin: 'Admin'
    },
    // Hero
    hero: {
      title: 'Yacht & Jet Ski Rentals',
      subtitle: 'Experience luxury, adventure, and fun in the Caribbean. Perfect for families, couples, and groups.',
      cta1: 'Book Experience',
      cta2: 'View Tours'
    },
    // Experience Cards
    experience: {
      desde: 'From',
      mxn: 'MXN',
      cancelacion: 'Free cancellation',
      duracion: 'Duration',
      horas: 'hours',
      minutos: 'min',
      reservar: 'Book',
      verMas: 'See more'
    },
    // Why Choose Us
    whyUs: {
      title: 'Why Choose Us?',
      subtitle: 'Your Caribbean adventure starts here',
      service: '5 Star Service',
      serviceDesc: 'Personalized first-class attention',
      fleet: 'Luxury Fleet',
      fleetDesc: 'Modern and well-maintained vessels',
      crew: 'Professional Crew',
      crewDesc: 'Certified and experienced captains',
      secure: 'Secure Booking',
      secureDesc: 'Encrypted payments and clear policies',
      multilingual: 'Multilingual Support',
      multilingualDesc: 'Service in Spanish and English',
      transparent: 'Transparent Pricing',
      transparentDesc: 'No hidden fees or surprises'
    },
    // Fleet
    fleet: {
      title: 'Our Fleet',
      subtitle: 'First-class vessels for your adventure',
      capacity: 'Capacity',
      personas: 'people',
      porHora: 'per hour',
      reservar: 'Book'
    },
    // Reviews
    reviews: {
      title: 'What Our Customers Say',
      subtitle: 'Real experiences from satisfied travelers'
    },
    // FAQ
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know'
    },
    // Contact
    contact: {
      title: 'Contact Us',
      subtitle: 'We are here to help you',
      whatsapp: 'WhatsApp',
      email: 'Email',
      ubicacion: 'Location',
      horario: 'Hours',
      horarioText: 'Monday - Sunday: 9:00 AM - 6:00 PM',
      nombre: 'Name',
      emailField: 'Email',
      mensaje: 'Message',
      enviar: 'Send Message'
    },
    // Booking
    booking: {
      title: 'Book Now',
      selectDate: 'Select date',
      selectTime: 'Select time',
      guests: 'Guests',
      adultos: 'Adults',
      ninos: 'Children',
      total: 'Total',
      continuar: 'Continue',
      confirmar: 'Confirm Booking',
      pagar: 'Pay Now',
      nombre: 'Full name',
      email: 'Email address',
      telefono: 'Phone',
      notas: 'Additional notes'
    },
    // Footer
    footer: {
      description: 'Your destination for luxury water experiences in Cancun',
      links: 'Links',
      contacto: 'Contact',
      derechos: 'All rights reserved'
    },
    // Payment
    payment: {
      success: 'Payment Successful!',
      successMsg: 'Your booking has been confirmed. You will receive an email with the details.',
      cancel: 'Payment Cancelled',
      cancelMsg: 'The payment process was cancelled. You can try again.',
      volver: 'Back to Home'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('jola-language');
    return saved || 'es';
  });

  useEffect(() => {
    localStorage.setItem('jola-language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
