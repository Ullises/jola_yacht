import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Clock, Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '529981234567'; // Placeholder
const EMAIL = 'info@jolayacht.com';
const ADDRESS = 'Blvd. Kukulcan Km 5.8, Kukulcan Boulevard, Zona Hotelera, 77500 Cancún, Q.R.';

export const ContactSection = () => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success(
        language === 'es' 
          ? '¡Mensaje enviado! Te contactaremos pronto.' 
          : 'Message sent! We will contact you soon.'
      );
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'es' 
        ? '¡Hola! Me interesa reservar una experiencia con Jola Yacht.' 
        : 'Hello! I am interested in booking an experience with Jola Yacht.'
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section 
      id="contacto"
      data-testid="contact-section"
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">Contacto</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2C59] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('contact.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info & Map */}
          <div>
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* WhatsApp */}
              <button
                onClick={openWhatsApp}
                data-testid="whatsapp-btn"
                className="flex items-center gap-4 p-5 bg-[#25D366]/10 rounded-2xl hover:bg-[#25D366]/20 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F2C59]">{t('contact.whatsapp')}</p>
                  <p className="text-sm text-gray-600">+52 998 123 4567</p>
                </div>
              </button>

              {/* Email */}
              <a
                href={`mailto:${EMAIL}`}
                data-testid="email-link"
                className="flex items-center gap-4 p-5 bg-[#0F2C59]/10 rounded-2xl hover:bg-[#0F2C59]/20 transition-colors"
              >
                <div className="w-12 h-12 bg-[#0F2C59] rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F2C59]">{t('contact.email')}</p>
                  <p className="text-sm text-gray-600">{EMAIL}</p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-4 p-5 bg-[#FF7F50]/10 rounded-2xl">
                <div className="w-12 h-12 bg-[#FF7F50] rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F2C59]">{t('contact.ubicacion')}</p>
                  <p className="text-sm text-gray-600">Plaza Nautilus, Cancún</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-4 p-5 bg-[#10B981]/10 rounded-2xl">
                <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F2C59]">{t('contact.horario')}</p>
                  <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.6424089193825!2d-86.77044492393675!3d21.131881884093516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f4c2b6ae651cc63%3A0x94a62e8e92c7d1c7!2sPlaza%20Nautilus!5e0!3m2!1sen!2smx!4v1701234567890!5m2!1sen!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Jola Yacht Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#F8F9FA] rounded-3xl p-8 lg:p-10">
            <h3 className="text-2xl font-bold text-[#0F2C59] mb-6">
              {language === 'es' ? 'Envíanos un mensaje' : 'Send us a message'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.nombre')}
                </label>
                <Input
                  type="text"
                  data-testid="contact-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#0F2C59] focus:ring-[#0F2C59]/20"
                  placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.emailField')}
                </label>
                <Input
                  type="email"
                  data-testid="contact-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#0F2C59] focus:ring-[#0F2C59]/20"
                  placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.mensaje')}
                </label>
                <Textarea
                  data-testid="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full rounded-xl border-gray-200 focus:border-[#0F2C59] focus:ring-[#0F2C59]/20 resize-none"
                  placeholder={language === 'es' ? '¿En qué podemos ayudarte?' : 'How can we help you?'}
                />
              </div>

              <Button
                type="submit"
                data-testid="contact-submit"
                disabled={loading}
                className="w-full bg-[#0F2C59] hover:bg-[#0a1f3d] text-white font-semibold py-6 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {language === 'es' ? 'Enviando...' : 'Sending...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    {t('contact.enviar')}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
