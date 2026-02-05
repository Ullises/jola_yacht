import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, Ship, Users, Shield, MessageCircle, DollarSign } from 'lucide-react';

export const WhyUsSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Star,
      title: t('whyUs.service'),
      description: t('whyUs.serviceDesc'),
      color: '#FF7F50'
    },
    {
      icon: Ship,
      title: t('whyUs.fleet'),
      description: t('whyUs.fleetDesc'),
      color: '#0F2C59'
    },
    {
      icon: Users,
      title: t('whyUs.crew'),
      description: t('whyUs.crewDesc'),
      color: '#10B981'
    },
    {
      icon: Shield,
      title: t('whyUs.secure'),
      description: t('whyUs.secureDesc'),
      color: '#0F2C59'
    },
    {
      icon: MessageCircle,
      title: t('whyUs.multilingual'),
      description: t('whyUs.multilingualDesc'),
      color: '#FF7F50'
    },
    {
      icon: DollarSign,
      title: t('whyUs.transparent'),
      description: t('whyUs.transparentDesc'),
      color: '#10B981'
    }
  ];

  return (
    <section 
      id="por-que-nosotros"
      data-testid="why-us-section"
      className="py-20 bg-[#F8F9FA]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">Jola Yacht</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2C59] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('whyUs.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('whyUs.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              data-testid={`feature-card-${index}`}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
            >
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon 
                  className="w-8 h-8"
                  style={{ color: feature.color }}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#0F2C59] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
