import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ReviewsSection = () => {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/featured`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollContainer = (direction) => {
    const container = document.getElementById('reviews-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section 
      id="reviews"
      data-testid="reviews-section"
      className="py-20 bg-[#0F2C59]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">Testimonios</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('reviews.title')}
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollContainer('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="reviews-scroll-left"
          >
            <ChevronLeft className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollContainer('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hidden md:flex"
            data-testid="reviews-scroll-right"
          >
            <ChevronRight className="w-6 h-6 text-[#0F2C59]" />
          </button>

          {/* Cards Container */}
          <div 
            id="reviews-scroll"
            className="flex overflow-x-auto gap-6 pb-4 scroll-container snap-x snap-mandatory"
          >
            {loading ? (
              <div className="flex justify-center items-center w-full h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  key={review.id}
                  data-testid={`review-card-${index}`}
                  className="flex-shrink-0 w-[350px] md:w-[400px] bg-white rounded-2xl p-8 shadow-xl snap-start"
                >
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-[#FF7F50]/30 mb-4" />

                  {/* Review Text */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 min-h-[100px]">
                    "{language === 'es' ? review.comment_es : review.comment_en}"
                  </p>

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer_name)}&background=0F2C59&color=fff`}
                      alt={review.customer_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#FF7F50]"
                    />
                    <div>
                      <h4 className="font-semibold text-[#0F2C59]">{review.customer_name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white text-center w-full py-8">
                {language === 'es' ? 'No hay reseñas disponibles' : 'No reviews available'}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">5.0</p>
            <p className="text-white/70 mt-2">{language === 'es' ? 'Calificación' : 'Rating'}</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">500+</p>
            <p className="text-white/70 mt-2">{language === 'es' ? 'Clientes Felices' : 'Happy Customers'}</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">10+</p>
            <p className="text-white/70 mt-2">{language === 'es' ? 'Años de Experiencia' : 'Years Experience'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
