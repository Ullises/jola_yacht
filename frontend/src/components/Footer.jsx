import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_f2a5924b-a93c-4571-8a4d-3f1155f9659e/artifacts/tf809sz8_ChatGPT%20Image%20Dec%204%2C%202025%2C%2009_48_36%20PM.png";

export const Footer = () => {
  const { language, t } = useLanguage();

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { href: '#inicio', label: language === 'es' ? 'Inicio' : 'Home' },
    { href: '#experiencias', label: language === 'es' ? 'Experiencias' : 'Experiences' },
    { href: '#flota', label: language === 'es' ? 'Flota' : 'Fleet' },
    { href: '#faq', label: 'FAQs' },
    { href: '#contacto', label: language === 'es' ? 'Contacto' : 'Contact' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer 
      data-testid="footer"
      className="bg-[#0F2C59] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <img 
              src={LOGO_URL} 
              alt="Jola Yacht" 
              className="h-20 w-auto mb-6"
            />
            <p className="text-white/70 leading-relaxed mb-6 max-w-md">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#FF7F50] transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.links')}</h4>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-[#FF7F50] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.contacto')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF7F50] flex-shrink-0 mt-1" />
                <span className="text-white/70 text-sm">
                  Blvd. Kukulcan Km 5.8, Zona Hotelera, 77500 Cancún, Q.R.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#FF7F50] flex-shrink-0" />
                <span className="text-white/70 text-sm">+52 998 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#FF7F50] flex-shrink-0" />
                <span className="text-white/70 text-sm">info@jolayacht.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Jola Yacht. {t('footer.derechos')}.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">
              {language === 'es' ? 'Privacidad' : 'Privacy'}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {language === 'es' ? 'Términos' : 'Terms'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
