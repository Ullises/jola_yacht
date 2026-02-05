import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const FleetSection = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      const response = await axios.get(`${API}/fleet`);
      setFleet(response.data);
    } catch (error) {
      console.error('Error fetching fleet:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollContainer = (direction) => {
    const container = document.getElementById('fleet-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      yacht: { es: 'Yate', en: 'Yacht' },
      jetski: { es: 'Moto Acuática', en: 'Jet Ski' },
      waverunner: { es: 'WaveRunner', en: 'WaveRunner' }
    };
    return labels[type]?.[language] || type;
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
      id="flota" 
      data-testid="fleet-section"
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">Flota</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2C59] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('fleet.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('fleet.subtitle')}
          </p>
        </div>

        {/* Fleet Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollContainer('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="fleet-scroll-left"
          >
            <ChevronLeft className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollContainer('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="fleet-scroll-right"
          >
            <ChevronRight className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Cards Container */}
          <div 
            id="fleet-scroll"
            className="flex overflow-x-auto gap-8 pb-4 scroll-container snap-x snap-mandatory"
          >
            {fleet.map((item, index) => (
              <div
                key={item.id}
                data-testid={`fleet-card-${index}`}
                className="flex-shrink-0 w-[350px] md:w-[400px] rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 snap-start group"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-[#0F2C59] px-4 py-1 rounded-full text-sm font-medium shadow-md">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-2xl font-bold text-[#0F2C59] mb-2">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {language === 'es' ? item.description_es : item.description_en}
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#0F2C59]" />
                      <span>{item.capacity} {t('fleet.personas')}</span>
                    </div>
                    {item.specs?.length && (
                      <span>• {item.specs.length}</span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500">{t('experience.desde')}</span>
                      <p className="text-2xl font-bold text-[#0F2C59]">
                        ${item.price_per_hour.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ml-1">{t('fleet.porHora')}</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/booking/fleet/${item.id}`)}
                      data-testid={`fleet-book-btn-${index}`}
                      className="bg-[#FF7F50] hover:bg-[#e66a3d] text-white font-medium px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {t('fleet.reservar')}
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

export default FleetSection;
