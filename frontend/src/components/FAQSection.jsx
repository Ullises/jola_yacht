import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const FAQSection = () => {
  const { language, t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${API}/faqs`);
      setFaqs(response.data.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="faq"
      data-testid="faq-section"
      className="py-20 bg-[#F8F9FA]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-2xl text-[#FF7F50] mb-2">FAQ</p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2C59] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t('faq.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2C59]"></div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                data-testid={`faq-item-${index}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-semibold text-[#0F2C59] pr-4">
                    {language === 'es' ? faq.question_es : faq.question_en}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {language === 'es' ? faq.answer_es : faq.answer_en}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
