import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, Users, ChevronLeft, Star, CheckCircle, Minus, Plus, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// PayPal SVG Icon
const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.6c-.52 0-.968.386-1.05.904l-1.12 7.106a.544.544 0 0 1-.354.466z"/>
  </svg>
);

export const BookingPage = () => {
  const { experienceId, fleetId } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [date, setDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const isFleet = !!fleetId;
  const itemId = experienceId || fleetId;

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  useEffect(() => {
    if (date) {
      fetchAvailability(format(date, 'yyyy-MM-dd'));
    }
  }, [date]);

  const fetchItem = async () => {
    try {
      const endpoint = isFleet ? `${API}/fleet/${itemId}` : `${API}/experiences/${itemId}`;
      const response = await axios.get(endpoint);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error(language === 'es' ? 'Error al cargar datos' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (dateStr) => {
    try {
      const response = await axios.get(`${API}/availability/${dateStr}`);
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const calculateTotal = () => {
    if (!item) return 0;
    if (isFleet) {
      return item.price_per_hour * 2; // Default 2 hours
    }
    return item.price * guests;
  };

  const handleSubmit = async () => {
    if (!date || !timeSlot || !formData.name || !formData.email || !formData.phone) {
      toast.error(language === 'es' ? 'Por favor completa todos los campos' : 'Please complete all fields');
      return;
    }

    setSubmitting(true);

    try {
      // Create reservation
      const reservationData = {
        experience_id: isFleet ? null : itemId,
        fleet_id: isFleet ? itemId : null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        date: format(date, 'yyyy-MM-dd'),
        time_slot: timeSlot,
        guests: guests,
        notes: formData.notes
      };

      const resResponse = await axios.post(`${API}/reservations`, reservationData);
      const reservation = resResponse.data;

      // Create checkout session with selected payment method
      const checkoutResponse = await axios.post(`${API}/checkout/session`, {
        reservation_id: reservation.id,
        origin_url: window.location.origin,
        payment_method: paymentMethod
      });

      // Redirect to payment provider
      window.location.href = checkoutResponse.data.url;

    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(language === 'es' ? 'Error al crear reservación' : 'Error creating reservation');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2C59]"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {language === 'es' ? 'Experiencia no encontrada' : 'Experience not found'}
          </p>
          <Button onClick={() => navigate('/')}>
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          data-testid="back-btn"
          className="flex items-center gap-2 text-[#0F2C59] hover:text-[#FF7F50] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{language === 'es' ? 'Volver' : 'Back'}</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
              <h1 
                className="text-2xl md:text-3xl font-bold text-[#0F2C59] mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {t('booking.title')}
              </h1>
              <p className="text-gray-600 mb-8">
                {language === 'es' ? item.title_es : item.title_en || item.name}
              </p>

              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= s 
                          ? 'bg-[#0F2C59] text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-[#0F2C59]' : 'bg-gray-100'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Date & Time */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in-up" data-testid="step-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {t('booking.selectDate')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          data-testid="date-picker-trigger"
                          className={`w-full justify-start text-left h-14 rounded-xl border-gray-200 ${
                            !date && 'text-gray-400'
                          }`}
                        >
                          {date ? format(date, 'PPP', { locale: language === 'es' ? es : enUS }) : (language === 'es' ? 'Selecciona una fecha' : 'Pick a date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Clock className="w-4 h-4 inline mr-2" />
                        {t('booking.selectTime')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setTimeSlot(slot.time)}
                            disabled={!slot.available}
                            data-testid={`time-slot-${slot.time}`}
                            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                              timeSlot === slot.time
                                ? 'bg-[#0F2C59] text-white'
                                : slot.available
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!date || !timeSlot}
                    data-testid="step-1-continue"
                    className="w-full bg-[#0F2C59] hover:bg-[#0a1f3d] text-white py-6 rounded-full mt-6"
                  >
                    {t('booking.continuar')}
                  </Button>
                </div>
              )}

              {/* Step 2: Guests */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-up" data-testid="step-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Users className="w-4 h-4 inline mr-2" />
                      {t('booking.guests')}
                    </label>
                    <div className="flex items-center justify-center gap-6 py-6">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        data-testid="guests-minus"
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-4xl font-bold text-[#0F2C59] w-16 text-center">
                        {guests}
                      </span>
                      <button
                        onClick={() => setGuests(Math.min(item.max_guests || item.capacity || 10, guests + 1))}
                        data-testid="guests-plus"
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      {language === 'es' ? 'Máximo' : 'Maximum'}: {item.max_guests || item.capacity || 10} {language === 'es' ? 'personas' : 'people'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 py-6 rounded-full"
                    >
                      {language === 'es' ? 'Anterior' : 'Previous'}
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      data-testid="step-2-continue"
                      className="flex-1 bg-[#0F2C59] hover:bg-[#0a1f3d] text-white py-6 rounded-full"
                    >
                      {t('booking.continuar')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in-up" data-testid="step-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.nombre')}
                    </label>
                    <Input
                      type="text"
                      data-testid="booking-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-14 rounded-xl"
                      placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.email')}
                    </label>
                    <Input
                      type="email"
                      data-testid="booking-email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-14 rounded-xl"
                      placeholder="email@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.telefono')}
                    </label>
                    <Input
                      type="tel"
                      data-testid="booking-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="h-14 rounded-xl"
                      placeholder="+52 998 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.notas')} ({language === 'es' ? 'opcional' : 'optional'})
                    </label>
                    <Textarea
                      data-testid="booking-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="rounded-xl resize-none"
                      rows={3}
                      placeholder={language === 'es' ? 'Alguna solicitud especial...' : 'Any special request...'}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 py-6 rounded-full"
                    >
                      {language === 'es' ? 'Anterior' : 'Previous'}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      data-testid="submit-booking"
                      className="flex-1 bg-[#FF7F50] hover:bg-[#e66a3d] text-white py-6 rounded-full"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {language === 'es' ? 'Procesando...' : 'Processing...'}
                        </span>
                      ) : (
                        t('booking.pagar')
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-28">
              {/* Image */}
              <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                  alt={language === 'es' ? item.title_es : item.title_en || item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="font-bold text-[#0F2C59] text-lg mb-2">
                {language === 'es' ? item.title_es : item.title_en || item.name}
              </h3>

              {/* Rating */}
              {item.rating && (
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{item.rating}</span>
                  <span className="text-gray-500 text-sm">({item.review_count})</span>
                </div>
              )}

              {/* Booking Details */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{language === 'es' ? 'Fecha' : 'Date'}</span>
                    <span className="font-medium">{format(date, 'dd MMM yyyy', { locale: language === 'es' ? es : enUS })}</span>
                  </div>
                )}
                {timeSlot && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{language === 'es' ? 'Hora' : 'Time'}</span>
                    <span className="font-medium">{timeSlot}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('booking.guests')}</span>
                  <span className="font-medium">{guests}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#0F2C59]">{t('booking.total')}</span>
                  <span className="text-2xl font-bold text-[#0F2C59]">
                    ${calculateTotal().toLocaleString()} MXN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
