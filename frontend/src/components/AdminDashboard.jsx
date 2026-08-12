import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, Ship, Compass, Calendar, 
  LogOut, Plus, Edit, Trash2, Users, DollarSign, TrendingUp,
  Menu, X, Save, Tag, Percent, Gift, Power
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Admin Login Component
export const AdminLogin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('admin_token', response.data.access_token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(language === 'es' ? 'Credenciales inválidas' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F2C59] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold text-[#0F2C59] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Admin Panel
          </h1>
          <p className="text-gray-600">Jola Yacht</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              data-testid="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
              placeholder="admin@jolayacht.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'es' ? 'Contraseña' : 'Password'}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                data-testid="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            data-testid="admin-login-btn"
            disabled={loading}
            className="w-full bg-[#0F2C59] hover:bg-[#0a1f3d] text-white py-6 rounded-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {language === 'es' ? 'Ingresando...' : 'Logging in...'}
              </span>
            ) : (
              language === 'es' ? 'Ingresar' : 'Login'
            )}
          </Button>
        </form>

      </div>
    </div>
  );
};

// Experience Form Component
const ExperienceForm = ({ experience, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title_es: experience?.title_es || '',
    title_en: experience?.title_en || '',
    description_es: experience?.description_es || '',
    description_en: experience?.description_en || '',
    price: experience?.price || 0,
    duration_minutes: experience?.duration_minutes || 60,
    max_guests: experience?.max_guests || 10,
    category: experience?.category || 'water_activity',
    images: experience?.images?.join('\n') || '',
    highlights_es: experience?.highlights_es?.join('\n') || '',
    highlights_en: experience?.highlights_en?.join('\n') || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes),
      max_guests: parseInt(formData.max_guests),
      images: formData.images.split('\n').filter(url => url.trim()),
      highlights_es: formData.highlights_es.split('\n').filter(h => h.trim()),
      highlights_en: formData.highlights_en.split('\n').filter(h => h.trim())
    };

    try {
      await onSave(data, experience?.id);
      toast.success(language === 'es' ? 'Experiencia guardada' : 'Experience saved');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al guardar' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Título (Español)' : 'Title (Spanish)'}</Label>
          <Input
            data-testid="exp-title-es"
            value={formData.title_es}
            onChange={(e) => setFormData({...formData, title_es: e.target.value})}
            required
            placeholder="Aventura en Moto Acuática"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Título (Inglés)' : 'Title (English)'}</Label>
          <Input
            data-testid="exp-title-en"
            value={formData.title_en}
            onChange={(e) => setFormData({...formData, title_en: e.target.value})}
            required
            placeholder="Jet Ski Adventure"
          />
        </div>
      </div>

      <div>
        <Label>{language === 'es' ? 'Descripción (Español)' : 'Description (Spanish)'}</Label>
        <Textarea
          data-testid="exp-desc-es"
          value={formData.description_es}
          onChange={(e) => setFormData({...formData, description_es: e.target.value})}
          required
          rows={3}
        />
      </div>

      <div>
        <Label>{language === 'es' ? 'Descripción (Inglés)' : 'Description (English)'}</Label>
        <Textarea
          data-testid="exp-desc-en"
          value={formData.description_en}
          onChange={(e) => setFormData({...formData, description_en: e.target.value})}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{language === 'es' ? 'Precio (MXN)' : 'Price (MXN)'}</Label>
          <Input
            data-testid="exp-price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Duración (min)' : 'Duration (min)'}</Label>
          <Input
            data-testid="exp-duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
            required
            min="1"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Máx. Huéspedes' : 'Max Guests'}</Label>
          <Input
            data-testid="exp-max-guests"
            type="number"
            value={formData.max_guests}
            onChange={(e) => setFormData({...formData, max_guests: e.target.value})}
            required
            min="1"
          />
        </div>
      </div>

      <div>
        <Label>{language === 'es' ? 'Categoría' : 'Category'}</Label>
        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
          <SelectTrigger data-testid="exp-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="water_activity">Water Activity</SelectItem>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="eco_tour">Eco Tour</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{language === 'es' ? 'URLs de Imágenes (una por línea)' : 'Image URLs (one per line)'}</Label>
        <Textarea
          data-testid="exp-images"
          value={formData.images}
          onChange={(e) => setFormData({...formData, images: e.target.value})}
          rows={2}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Destacados ES (uno por línea)' : 'Highlights ES (one per line)'}</Label>
          <Textarea
            data-testid="exp-highlights-es"
            value={formData.highlights_es}
            onChange={(e) => setFormData({...formData, highlights_es: e.target.value})}
            rows={3}
            placeholder="Cancelación gratuita&#10;2 horas&#10;Guía incluido"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Destacados EN (uno por línea)' : 'Highlights EN (one per line)'}</Label>
          <Textarea
            data-testid="exp-highlights-en"
            value={formData.highlights_en}
            onChange={(e) => setFormData({...formData, highlights_en: e.target.value})}
            rows={3}
            placeholder="Free cancellation&#10;2 hours&#10;Guide included"
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {language === 'es' ? 'Cancelar' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={saving} className="bg-[#0F2C59] hover:bg-[#0a1f3d]">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {language === 'es' ? 'Guardando...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {language === 'es' ? 'Guardar' : 'Save'}
            </span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Fleet Form Component
const FleetForm = ({ item, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    type: item?.type || 'jetski',
    description_es: item?.description_es || '',
    description_en: item?.description_en || '',
    capacity: item?.capacity || 2,
    price_per_hour: item?.price_per_hour || 0,
    images: item?.images?.join('\n') || '',
    amenities_es: item?.amenities_es?.join('\n') || '',
    amenities_en: item?.amenities_en?.join('\n') || '',
    specs: item?.specs ? Object.entries(item.specs).map(([k,v]) => `${k}:${v}`).join('\n') : ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse specs from "key:value" format
    const specsObj = {};
    formData.specs.split('\n').filter(s => s.trim()).forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        specsObj[key.trim()] = valueParts.join(':').trim();
      }
    });

    const data = {
      name: formData.name,
      type: formData.type,
      description_es: formData.description_es,
      description_en: formData.description_en,
      capacity: parseInt(formData.capacity),
      price_per_hour: parseFloat(formData.price_per_hour),
      images: formData.images.split('\n').filter(url => url.trim()),
      amenities_es: formData.amenities_es.split('\n').filter(a => a.trim()),
      amenities_en: formData.amenities_en.split('\n').filter(a => a.trim()),
      specs: specsObj
    };

    try {
      await onSave(data, item?.id);
      toast.success(language === 'es' ? 'Embarcación guardada' : 'Fleet item saved');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al guardar' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
          <Input
            data-testid="fleet-name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Sea Ray 40"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Tipo' : 'Type'}</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
            <SelectTrigger data-testid="fleet-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yacht">Yacht</SelectItem>
              <SelectItem value="jetski">Jet Ski</SelectItem>
              <SelectItem value="waverunner">WaveRunner</SelectItem>
              <SelectItem value="boat">Boat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>{language === 'es' ? 'Descripción (Español)' : 'Description (Spanish)'}</Label>
        <Textarea
          data-testid="fleet-desc-es"
          value={formData.description_es}
          onChange={(e) => setFormData({...formData, description_es: e.target.value})}
          required
          rows={3}
        />
      </div>

      <div>
        <Label>{language === 'es' ? 'Descripción (Inglés)' : 'Description (English)'}</Label>
        <Textarea
          data-testid="fleet-desc-en"
          value={formData.description_en}
          onChange={(e) => setFormData({...formData, description_en: e.target.value})}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Capacidad (personas)' : 'Capacity (people)'}</Label>
          <Input
            data-testid="fleet-capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            required
            min="1"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Precio por Hora (MXN)' : 'Price per Hour (MXN)'}</Label>
          <Input
            data-testid="fleet-price"
            type="number"
            value={formData.price_per_hour}
            onChange={(e) => setFormData({...formData, price_per_hour: e.target.value})}
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Label>{language === 'es' ? 'URLs de Imágenes (una por línea)' : 'Image URLs (one per line)'}</Label>
        <Textarea
          data-testid="fleet-images"
          value={formData.images}
          onChange={(e) => setFormData({...formData, images: e.target.value})}
          rows={2}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Amenidades ES (una por línea)' : 'Amenities ES (one per line)'}</Label>
          <Textarea
            data-testid="fleet-amenities-es"
            value={formData.amenities_es}
            onChange={(e) => setFormData({...formData, amenities_es: e.target.value})}
            rows={3}
            placeholder="Aire acondicionado&#10;Sistema de sonido&#10;Cocina"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Amenidades EN (una por línea)' : 'Amenities EN (one per line)'}</Label>
          <Textarea
            data-testid="fleet-amenities-en"
            value={formData.amenities_en}
            onChange={(e) => setFormData({...formData, amenities_en: e.target.value})}
            rows={3}
            placeholder="Air conditioning&#10;Sound system&#10;Kitchen"
          />
        </div>
      </div>

      <div>
        <Label>{language === 'es' ? 'Especificaciones (clave:valor por línea)' : 'Specs (key:value per line)'}</Label>
        <Textarea
          data-testid="fleet-specs"
          value={formData.specs}
          onChange={(e) => setFormData({...formData, specs: e.target.value})}
          rows={3}
          placeholder="length:40 ft&#10;year:2022&#10;engine:Twin Mercury 350hp"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {language === 'es' ? 'Cancelar' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={saving} className="bg-[#0F2C59] hover:bg-[#0a1f3d]">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {language === 'es' ? 'Guardando...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {language === 'es' ? 'Guardar' : 'Save'}
            </span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Promotion Form Component
const PromotionForm = ({ promotion, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    name_es: promotion?.name_es || '',
    name_en: promotion?.name_en || '',
    description_es: promotion?.description_es || '',
    description_en: promotion?.description_en || '',
    discount_type: promotion?.discount_type || 'percentage',
    discount_value: promotion?.discount_value || 10,
    promo_code: promotion?.promo_code || '',
    season_type: promotion?.season_type || 'custom',
    holiday_name: promotion?.holiday_name || '',
    start_date: promotion?.start_date || '',
    end_date: promotion?.end_date || '',
    applies_to: promotion?.applies_to || 'all',
    min_guests: promotion?.min_guests || 1,
    min_purchase: promotion?.min_purchase || 0,
    max_uses: promotion?.max_uses || '',
    badge_color: promotion?.badge_color || '#FF7F50'
  });
  const [saving, setSaving] = useState(false);

  const holidayOptions = [
    { value: 'valentine', label: language === 'es' ? 'San Valentín' : "Valentine's Day" },
    { value: 'easter', label: language === 'es' ? 'Semana Santa' : 'Easter' },
    { value: 'spring_break', label: 'Spring Break' },
    { value: 'summer', label: language === 'es' ? 'Verano' : 'Summer' },
    { value: 'halloween', label: 'Halloween' },
    { value: 'thanksgiving', label: language === 'es' ? 'Día de Gracias' : 'Thanksgiving' },
    { value: 'christmas', label: language === 'es' ? 'Navidad' : 'Christmas' },
    { value: 'new_year', label: language === 'es' ? 'Año Nuevo' : 'New Year' },
    { value: 'independence', label: language === 'es' ? 'Independencia' : 'Independence Day' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      min_guests: parseInt(formData.min_guests),
      min_purchase: parseFloat(formData.min_purchase),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      promo_code: formData.promo_code || null,
      holiday_name: formData.holiday_name || null
    };

    try {
      await onSave(data, promotion?.id);
      toast.success(language === 'es' ? 'Promoción guardada' : 'Promotion saved');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al guardar' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Nombre (Español)' : 'Name (Spanish)'}</Label>
          <Input
            data-testid="promo-name-es"
            value={formData.name_es}
            onChange={(e) => setFormData({...formData, name_es: e.target.value})}
            required
            placeholder="San Valentín Especial"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Nombre (Inglés)' : 'Name (English)'}</Label>
          <Input
            data-testid="promo-name-en"
            value={formData.name_en}
            onChange={(e) => setFormData({...formData, name_en: e.target.value})}
            required
            placeholder="Valentine's Special"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Descripción (Español)' : 'Description (Spanish)'}</Label>
          <Textarea
            value={formData.description_es}
            onChange={(e) => setFormData({...formData, description_es: e.target.value})}
            required
            rows={2}
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Descripción (Inglés)' : 'Description (English)'}</Label>
          <Textarea
            value={formData.description_en}
            onChange={(e) => setFormData({...formData, description_en: e.target.value})}
            required
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{language === 'es' ? 'Tipo de Descuento' : 'Discount Type'}</Label>
          <Select value={formData.discount_type} onValueChange={(v) => setFormData({...formData, discount_type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">{language === 'es' ? 'Porcentaje' : 'Percentage'}</SelectItem>
              <SelectItem value="fixed_amount">{language === 'es' ? 'Monto Fijo' : 'Fixed Amount'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{formData.discount_type === 'percentage' ? '%' : 'MXN'}</Label>
          <Input
            type="number"
            value={formData.discount_value}
            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
            required
            min="0"
            max={formData.discount_type === 'percentage' ? '100' : undefined}
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Código Promo (opcional)' : 'Promo Code (optional)'}</Label>
          <Input
            value={formData.promo_code}
            onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
            placeholder="SUMMER25"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Tipo de Temporada' : 'Season Type'}</Label>
          <Select value={formData.season_type} onValueChange={(v) => setFormData({...formData, season_type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="holiday">{language === 'es' ? 'Día Festivo' : 'Holiday'}</SelectItem>
              <SelectItem value="seasonal">{language === 'es' ? 'Temporada' : 'Seasonal'}</SelectItem>
              <SelectItem value="weekend">{language === 'es' ? 'Fin de Semana' : 'Weekend'}</SelectItem>
              <SelectItem value="custom">{language === 'es' ? 'Personalizado' : 'Custom'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'es' ? 'Festivo/Temporada' : 'Holiday/Season'}</Label>
          <Select value={formData.holiday_name || ''} onValueChange={(v) => setFormData({...formData, holiday_name: v})}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'es' ? 'Seleccionar...' : 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {holidayOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Fecha Inicio' : 'Start Date'}</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            required
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Fecha Fin' : 'End Date'}</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'es' ? 'Aplica a' : 'Applies To'}</Label>
          <Select value={formData.applies_to} onValueChange={(v) => setFormData({...formData, applies_to: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'es' ? 'Todo' : 'All'}</SelectItem>
              <SelectItem value="experiences">{language === 'es' ? 'Experiencias' : 'Experiences'}</SelectItem>
              <SelectItem value="fleet">{language === 'es' ? 'Flota' : 'Fleet'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'es' ? 'Color del Badge' : 'Badge Color'}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.badge_color}
              onChange={(e) => setFormData({...formData, badge_color: e.target.value})}
              className="w-16 h-10 p-1"
            />
            <Input
              value={formData.badge_color}
              onChange={(e) => setFormData({...formData, badge_color: e.target.value})}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{language === 'es' ? 'Mín. Huéspedes' : 'Min. Guests'}</Label>
          <Input
            type="number"
            value={formData.min_guests}
            onChange={(e) => setFormData({...formData, min_guests: e.target.value})}
            min="1"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Mín. Compra (MXN)' : 'Min. Purchase (MXN)'}</Label>
          <Input
            type="number"
            value={formData.min_purchase}
            onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
            min="0"
          />
        </div>
        <div>
          <Label>{language === 'es' ? 'Máx. Usos (vacío = ilimitado)' : 'Max. Uses (empty = unlimited)'}</Label>
          <Input
            type="number"
            value={formData.max_uses}
            onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
            min="1"
            placeholder="∞"
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {language === 'es' ? 'Cancelar' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={saving} className="bg-[#10B981] hover:bg-[#059669]">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {language === 'es' ? 'Guardando...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {language === 'es' ? 'Guardar' : 'Save'}
            </span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Admin Dashboard Component
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [reservations, setReservations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [fleetModalOpen, setFleetModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [editingFleet, setEditingFleet] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem('admin_token');

  const fetchData = useCallback(async () => { // ← wrap in useCallback
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, resRes, expRes, fleetRes, promoRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/reservations`, { headers }),
        axios.get(`${API}/experiences`),
        axios.get(`${API}/fleet`),
        axios.get(`${API}/admin/promotions`, { headers })
      ]);

      setStats(statsRes.data.data);
      setReservations(resRes.data.data);
      setExperiences(expRes.data.data);
      setFleet(fleetRes.data.data);
      setPromotions(promoRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]); // ← dependencies fetchData uses

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [fetchData, token, navigate]); // ← add all dependencies

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const updateReservationStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/reservations/${id}/status`, { status }, { headers });
      toast.success(language === 'es' ? 'Estado actualizado' : 'Status updated');
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar' : 'Update error');
    }
  };

  // Experience CRUD
  const saveExperience = async (data, id) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (id) {
      await axios.put(`${API}/admin/experiences/${id}`, data, { headers });
    } else {
      await axios.post(`${API}/admin/experiences`, data, { headers });
    }
    setExpModalOpen(false);
    setEditingExp(null);
    fetchData();
  };

  const deleteExperience = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/experiences/${id}`, { headers });
      toast.success(language === 'es' ? 'Experiencia eliminada' : 'Experience deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
    }
  };

  // Fleet CRUD
  const saveFleet = async (data, id) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (id) {
      await axios.put(`${API}/admin/fleet/${id}`, data, { headers });
    } else {
      await axios.post(`${API}/admin/fleet`, data, { headers });
    }
    setFleetModalOpen(false);
    setEditingFleet(null);
    fetchData();
  };

  const deleteFleet = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/fleet/${id}`, { headers });
      toast.success(language === 'es' ? 'Embarcación eliminada' : 'Fleet item deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
    }
  };

  // Promotion CRUD
  const savePromotion = async (data, id) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (id) {
      await axios.put(`${API}/admin/promotions/${id}`, data, { headers });
    } else {
      await axios.post(`${API}/admin/promotions`, data, { headers });
    }
    setPromoModalOpen(false);
    setEditingPromo(null);
    fetchData();
  };

  const deletePromotion = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/promotions/${id}`, { headers });
      toast.success(language === 'es' ? 'Promoción eliminada' : 'Promotion deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
    }
  };

  const togglePromotion = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/promotions/${id}/toggle`, {}, { headers });
      toast.success(language === 'es' ? 'Estado actualizado' : 'Status updated');
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar' : 'Error updating');
    }
  };

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: language === 'es' ? 'Resumen' : 'Overview' },
    { id: 'reservations', icon: Calendar, label: language === 'es' ? 'Reservaciones' : 'Reservations' },
    { id: 'experiences', icon: Compass, label: language === 'es' ? 'Experiencias' : 'Experiences' },
    { id: 'fleet', icon: Ship, label: language === 'es' ? 'Flota' : 'Fleet' },
    { id: 'promotions', icon: Tag, label: language === 'es' ? 'Promociones' : 'Promotions' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2C59]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0F2C59] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6">
          <h2 className="text-white text-xl font-bold">Jola Yacht</h2>
          <p className="text-white/60 text-sm">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              data-testid={`sidebar-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{language === 'es' ? 'Cerrar Sesión' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#0F2C59] text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-[#0F2C59]">
              {language === 'es' ? 'Resumen' : 'Overview'}
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-[#0F2C59]" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-[#0F2C59]">{stats.total_reservations || 0}</p>
                <p className="text-gray-500 text-sm">{language === 'es' ? 'Total Reservaciones' : 'Total Reservations'}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-[#FF7F50]" />
                </div>
                <p className="text-3xl font-bold text-[#0F2C59]">{stats.confirmed_reservations || 0}</p>
                <p className="text-gray-500 text-sm">{language === 'es' ? 'Confirmadas' : 'Confirmed'}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-[#10B981]" />
                </div>
                <p className="text-3xl font-bold text-[#0F2C59]">${(stats.total_revenue || 0).toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{language === 'es' ? 'Ingresos Totales' : 'Total Revenue'}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Compass className="w-8 h-8 text-[#0F2C59]" />
                </div>
                <p className="text-3xl font-bold text-[#0F2C59]">{stats.total_experiences || 0}</p>
                <p className="text-gray-500 text-sm">{language === 'es' ? 'Experiencias Activas' : 'Active Experiences'}</p>
              </div>
            </div>

            {/* Recent Reservations */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-[#0F2C59]">
                  {language === 'es' ? 'Reservaciones Recientes' : 'Recent Reservations'}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Cliente' : 'Customer'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Fecha' : 'Date'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Total' : 'Total'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Estado' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reservations.slice(0, 5).map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#0F2C59]">{res.customer_name}</p>
                          <p className="text-sm text-gray-500">{res.customer_email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{res.date} {res.time_slot}</td>
                        <td className="px-6 py-4 font-medium">${res.total_price?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(res.status)}>{res.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#0F2C59]">
              {language === 'es' ? 'Reservaciones' : 'Reservations'}
            </h1>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Cliente' : 'Customer'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Fecha' : 'Date'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Huéspedes' : 'Guests'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Total' : 'Total'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Estado' : 'Status'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'es' ? 'Acciones' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#0F2C59]">{res.customer_name}</p>
                          <p className="text-sm text-gray-500">{res.customer_email}</p>
                          <p className="text-sm text-gray-500">{res.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{res.date}<br />{res.time_slot}</td>
                        <td className="px-6 py-4 text-gray-600">{res.guests}</td>
                        <td className="px-6 py-4 font-medium">${res.total_price?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(res.status)}>{res.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Select onValueChange={(value) => updateReservationStatus(res.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder={language === 'es' ? 'Cambiar' : 'Change'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#0F2C59]">
                {language === 'es' ? 'Experiencias' : 'Experiences'}
              </h1>
              <Button
                onClick={() => { setEditingExp(null); setExpModalOpen(true); }}
                data-testid="add-experience-btn"
                className="bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nueva Experiencia' : 'New Experience'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={exp.images?.[0] || 'https://via.placeholder.com/400x200'} 
                      alt={exp.title_es}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingExp(exp); setExpModalOpen(true); }}
                        data-testid={`edit-exp-${exp.id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 text-[#0F2C59]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'experience', id: exp.id, name: exp.title_es })}
                        data-testid={`delete-exp-${exp.id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0F2C59] mb-2">{exp.title_es}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exp.description_es}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#0F2C59]">${exp.price?.toLocaleString()} MXN</span>
                      <Badge className={exp.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {exp.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Experience Modal */}
            <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingExp 
                      ? (language === 'es' ? 'Editar Experiencia' : 'Edit Experience')
                      : (language === 'es' ? 'Nueva Experiencia' : 'New Experience')
                    }
                  </DialogTitle>
                </DialogHeader>
                <ExperienceForm
                  experience={editingExp}
                  onSave={saveExperience}
                  onCancel={() => { setExpModalOpen(false); setEditingExp(null); }}
                  language={language}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#0F2C59]">
                {language === 'es' ? 'Flota' : 'Fleet'}
              </h1>
              <Button
                onClick={() => { setEditingFleet(null); setFleetModalOpen(true); }}
                data-testid="add-fleet-btn"
                className="bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nueva Embarcación' : 'New Vessel'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={item.images?.[0] || 'https://via.placeholder.com/400x200'} 
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingFleet(item); setFleetModalOpen(true); }}
                        data-testid={`edit-fleet-${item.id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 text-[#0F2C59]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'fleet', id: item.id, name: item.name })}
                        data-testid={`delete-fleet-${item.id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0F2C59] mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.type} • {item.capacity} personas</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#0F2C59]">${item.price_per_hour?.toLocaleString()}/hr</span>
                      <Badge className={item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fleet Modal */}
            <Dialog open={fleetModalOpen} onOpenChange={setFleetModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingFleet 
                      ? (language === 'es' ? 'Editar Embarcación' : 'Edit Vessel')
                      : (language === 'es' ? 'Nueva Embarcación' : 'New Vessel')
                    }
                  </DialogTitle>
                </DialogHeader>
                <FleetForm
                  item={editingFleet}
                  onSave={saveFleet}
                  onCancel={() => { setFleetModalOpen(false); setEditingFleet(null); }}
                  language={language}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#0F2C59]">
                {language === 'es' ? 'Promociones' : 'Promotions'}
              </h1>
              <Button
                onClick={() => { setEditingPromo(null); setPromoModalOpen(true); }}
                data-testid="add-promo-btn"
                className="bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nueva Promoción' : 'New Promotion'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                  <div className="p-5 border-b" style={{ borderColor: promo.badge_color + '30' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: promo.badge_color }}
                      >
                        {promo.discount_type === 'percentage' 
                          ? `${promo.discount_value}% OFF` 
                          : `$${promo.discount_value} OFF`
                        }
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePromotion(promo.id)}
                          className={`p-2 rounded-full transition-colors ${promo.is_active ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <Power className={`w-4 h-4 ${promo.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-[#0F2C59] text-lg mb-1">
                      {language === 'es' ? promo.name_es : promo.name_en}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {language === 'es' ? promo.description_es : promo.description_en}
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{language === 'es' ? 'Vigencia' : 'Valid'}</span>
                      <span className="font-medium">{promo.start_date} → {promo.end_date}</span>
                    </div>
                    {promo.promo_code && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{language === 'es' ? 'Código' : 'Code'}</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{promo.promo_code}</code>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{language === 'es' ? 'Aplica a' : 'Applies to'}</span>
                      <Badge className="bg-blue-100 text-blue-800">{promo.applies_to}</Badge>
                    </div>
                    {promo.max_uses && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{language === 'es' ? 'Usos' : 'Uses'}</span>
                        <span>{promo.current_uses || 0} / {promo.max_uses}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => { setEditingPromo(promo); setPromoModalOpen(true); }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === 'es' ? 'Editar' : 'Edit'}
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm({ type: 'promotion', id: promo.id, name: promo.name_es })}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promotion Modal */}
            <Dialog open={promoModalOpen} onOpenChange={setPromoModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPromo 
                      ? (language === 'es' ? 'Editar Promoción' : 'Edit Promotion')
                      : (language === 'es' ? 'Nueva Promoción' : 'New Promotion')
                    }
                  </DialogTitle>
                </DialogHeader>
                <PromotionForm
                  promotion={editingPromo}
                  onSave={savePromotion}
                  onCancel={() => { setPromoModalOpen(false); setEditingPromo(null); }}
                  language={language}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'es' ? 'Confirmar Eliminación' : 'Confirm Delete'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              {language === 'es' 
                ? `¿Estás seguro de eliminar "${deleteConfirm?.name}"?`
                : `Are you sure you want to delete "${deleteConfirm?.name}"?`
              }
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  if (deleteConfirm?.type === 'experience') {
                    deleteExperience(deleteConfirm.id);
                  } else if (deleteConfirm?.type === 'fleet') {
                    deleteFleet(deleteConfirm.id);
                  } else if (deleteConfirm?.type === 'promotion') {
                    deletePromotion(deleteConfirm.id);
                  }
                }}
              >
                {language === 'es' ? 'Eliminar' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;