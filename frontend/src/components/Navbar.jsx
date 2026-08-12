import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_f2a5924b-a93c-4571-8a4d-3f1155f9659e/artifacts/tf809sz8_ChatGPT%20Image%20Dec%204%2C%202025%2C%2009_48_36%20PM.png";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: t('nav.inicio') },
    { href: '#flota', label: t('nav.flota') },
    { href: '#experiencias', label: t('nav.experiencias') },
    { href: '#faq', label: t('nav.faqs') },
    { href: '#contacto', label: t('nav.contacto') },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo">
            <img 
              src={LOGO_URL} 
              alt="Jola Yacht" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                data-testid={`nav-${link.href.replace('#', '')}`}
                className={`font-medium transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-[#0F2C59] hover:text-[#FF7F50]' 
                    : 'text-white hover:text-[#FF7F50] drop-shadow-md'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all ${
                isScrolled 
                  ? 'text-[#0F2C59] hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </button>

            {/* CTA Button */}
            <Button
              onClick={() => scrollToSection('#experiencias')}
              data-testid="cta-reservar"
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              {t('nav.reservar')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-toggle"
            className={`lg:hidden p-2 rounded-lg ${
              isScrolled ? 'text-[#0F2C59]' : 'text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 bg-white rounded-2xl shadow-xl p-4 animate-fade-in-up">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-[#0F2C59] font-medium py-2 px-4 rounded-lg hover:bg-gray-100 text-left"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t pt-3 mt-2">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 text-[#0F2C59] py-2 px-4 rounded-lg hover:bg-gray-100 w-full"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'es' ? 'English' : 'Español'}</span>
                </button>
                <Button
                  onClick={() => scrollToSection('#experiencias')}
                  className="w-full mt-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-full"
                >
                  {t('nav.reservar')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
