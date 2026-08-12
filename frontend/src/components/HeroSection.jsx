import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_f2a5924b-a93c-4571-8a4d-3f1155f9659e/artifacts/0yncz6fn_Gemini_Generated_Image_ww70wzww70wzww70.png";

export const HeroSection = () => {
  const { t } = useLanguage();

  const scrollToExperiences = () => {
    const element = document.querySelector('#experiencias');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="inicio" 
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="animate-fade-in-up">
          {/* Tagline */}
          <p className="font-accent text-2xl md:text-3xl text-[#FF7F50] mb-4 drop-shadow-lg">
            Jola Yacht
          </p>

          {/* Main Title */}
          <h1 
            data-testid="hero-title"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p 
            data-testid="hero-subtitle"
            className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-10 drop-shadow-lg"
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToExperiences}
              data-testid="hero-cta-reservar"
              className="bg-[#FF7F50] hover:bg-[#e66a3d] text-white font-semibold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              {t('hero.cta1')}
            </Button>
            <Button
              onClick={scrollToExperiences}
              data-testid="hero-cta-tours"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#0F2C59] font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300"
            >
              {t('hero.cta2')}
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToExperiences}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Scroll to experiences"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default HeroSection;
