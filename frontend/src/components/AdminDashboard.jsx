import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, Ship, Compass, MessageSquare, Calendar, Settings, 
  LogOut, Plus, Edit, Trash2, Eye, Users, DollarSign, TrendingUp,
  Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Admin Login Component
export const AdminLogin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
            <Input
              type="password"
              data-testid="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl"
              placeholder="••••••••"
            />
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

        <p className="text-center text-sm text-gray-500 mt-6">
          {language === 'es' ? 'Credenciales por defecto:' : 'Default credentials:'}<br />
          admin@jolayacht.com / JolaYacht2025!
        </p>
      </div>
    </div>
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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, resRes, expRes, fleetRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/reservations`, { headers }),
        axios.get(`${API}/experiences`),
        axios.get(`${API}/fleet`)
      ]);

      setStats(statsRes.data);
      setReservations(resRes.data);
      setExperiences(expRes.data);
      setFleet(fleetRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const updateReservationStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/reservations/${id}/status?status=${status}`, {}, { headers });
      toast.success(language === 'es' ? 'Estado actualizado' : 'Status updated');
      fetchData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar' : 'Update error');
    }
  };

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: language === 'es' ? 'Resumen' : 'Overview' },
    { id: 'reservations', icon: Calendar, label: language === 'es' ? 'Reservaciones' : 'Reservations' },
    { id: 'experiences', icon: Compass, label: language === 'es' ? 'Experiencias' : 'Experiences' },
    { id: 'fleet', icon: Ship, label: language === 'es' ? 'Flota' : 'Fleet' },
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
                    {reservations.slice(0, 5).map((res, index) => (
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
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <img 
                    src={exp.images?.[0] || 'https://via.placeholder.com/400x200'} 
                    alt={exp.title_es}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0F2C59] mb-2">{exp.title_es}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exp.description_es}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#0F2C59]">${exp.price.toLocaleString()} MXN</span>
                      <Badge className="bg-green-100 text-green-800">{exp.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#0F2C59]">
                {language === 'es' ? 'Flota' : 'Fleet'}
              </h1>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/400x200'} 
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0F2C59] mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.type} • {item.capacity} personas</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#0F2C59]">${item.price_per_hour.toLocaleString()}/hr</span>
                      <Badge className={item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
