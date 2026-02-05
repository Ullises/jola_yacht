import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Star, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ExperiencesSection = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`${API}/experiences`);
      setExperiences(response.data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ${t('experience.horas')}`;
    }
    return `${minutes} ${t('experience.minutos')}`;
  };

  const scrollContainer = (direction) => {
    const container = document.getElementById('experiences-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2C59]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="experiencias" 
      data-testid="experiences-section"
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">Experiencias</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2C59] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {language === 'es' ? 'Tours y Actividades' : 'Tours & Activities'}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Descubre nuestras experiencias más populares en el Caribe mexicano'
              : 'Discover our most popular experiences in the Mexican Caribbean'}
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollContainer('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="scroll-left"
          >
            <ChevronLeft className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollContainer('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="scroll-right"
          >
            <ChevronRight className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Cards Container */}
          <div 
            id="experiences-scroll"
            className="flex overflow-x-auto gap-6 pb-4 scroll-container snap-x snap-mandatory"
          >
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                data-testid={`experience-card-${index}`}
                className="flex-shrink-0 w-[300px] md:w-[320px] experience-card rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm snap-start"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={exp.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                    alt={language === 'es' ? exp.title_es : exp.title_en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(exp.id);
                    }}
                    data-testid={`favorite-btn-${index}`}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all heart-icon"
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.has(exp.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-[#0F2C59]">{exp.rating}</span>
                    <span className="text-gray-500 text-sm">({exp.review_count})</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-[#0F2C59] text-lg mb-2 line-clamp-2 min-h-[56px]">
                    {language === 'es' ? exp.title_es : exp.title_en}
                  </h3>

                  {/* Highlights */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2 flex-shrink-0" />
                      <span>{t('experience.cancelacion')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#0F2C59] mr-2 flex-shrink-0" />
                      <span>{formatDuration(exp.duration_minutes)}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500">{t('experience.desde')}</span>
                      <p className="text-xl font-bold text-[#0F2C59]">
                        ${exp.price.toLocaleString()} <span className="text-sm font-normal">{t('experience.mxn')}</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/booking/${exp.id}`)}
                      data-testid={`book-btn-${index}`}
                      className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white font-medium px-4 py-2 rounded-full text-sm"
                    >
                      {t('experience.reservar')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
