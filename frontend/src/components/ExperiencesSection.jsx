import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Star, Clock, CheckCircle, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const ExperiencesSection = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`${API}/experiences`);
      setExperiences(response.data.data);
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
    if (direction === 'left') {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentIndex(prev => Math.min(Math.max(0, experiences.length - 3), prev + 1));
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
          <div className="overflow-hidden px-3 -mx-3 py-4 -my-4">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
            {experiences.map((exp, index) => (
              <div key={exp.id} className="flex-none w-1/3 px-3">
              <div
                data-testid={`experience-card-${index}`}
                className="experience-card rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer h-full"
                onMouseEnter={() => setHoveredId(exp.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedExp(exp)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={exp.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                    alt={language === 'es' ? exp.title_es : exp.title_en}
                    className={`w-full h-full object-cover transition-transform duration-500 ${hoveredId === exp.id ? 'scale-110' : 'scale-100'}`}
                  />
                  {/* Hover Description Overlay */}
                  <div
                    className={`absolute inset-0 bg-[#0F2C59]/80 flex items-center justify-center p-4 transition-opacity duration-300 ${hoveredId === exp.id ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <p className="text-white text-sm text-center leading-relaxed line-clamp-5">
                      {language === 'es' ? exp.description_es : exp.description_en}
                    </p>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(exp.id);
                    }}
                    data-testid={`favorite-btn-${index}`}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all heart-icon z-10"
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
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Experience Detail Modal */}
      {selectedExp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedExp(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl">
              <img
                src={selectedExp.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                alt={language === 'es' ? selectedExp.title_es : selectedExp.title_en}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedExp(null)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all"
              >
                <X className="w-5 h-5 text-[#0F2C59]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-[#0F2C59]">{selectedExp.rating}</span>
                <span className="text-gray-500 text-sm">({selectedExp.review_count})</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[#0F2C59] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {language === 'es' ? selectedExp.title_es : selectedExp.title_en}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {language === 'es' ? selectedExp.description_es : selectedExp.description_en}
              </p>

              {/* Info pills */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 bg-blue-50 text-[#0F2C59] px-3 py-1.5 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {formatDuration(selectedExp.duration_minutes)}
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-[#0F2C59] px-3 py-1.5 rounded-full text-sm font-medium">
                  <Users className="w-4 h-4" />
                  {language === 'es' ? `Máx. ${selectedExp.max_guests} personas` : `Max. ${selectedExp.max_guests} guests`}
                </div>
              </div>

              {/* Highlights */}
              {(selectedExp.highlights_es?.length > 0 || selectedExp.highlights_en?.length > 0) && (
                <div className="mb-5">
                  <h4 className="font-semibold text-[#0F2C59] mb-2">
                    {language === 'es' ? 'Destacados' : 'Highlights'}
                  </h4>
                  <ul className="space-y-1.5">
                    {(language === 'es' ? selectedExp.highlights_es : selectedExp.highlights_en)?.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-sm text-gray-500">{t('experience.desde')}</span>
                  <p className="text-2xl font-bold text-[#0F2C59]">
                    ${selectedExp.price.toLocaleString()} <span className="text-sm font-normal">{t('experience.mxn')}</span>
                  </p>
                </div>
                <Button
                  onClick={() => { setSelectedExp(null); navigate(`/booking/${selectedExp.id}`); }}
                  className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white font-medium px-6 py-3 rounded-full"
                >
                  {t('experience.reservar')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExperiencesSection;
