import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  CreditCard,
  Mail,
  Calendar,
  Phone,
  MapPin,
  Save,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { saveUser } from '../../services/userSession';
import { checkAuth } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { BASE_URL } from '../../config';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useUserTokens } from '../../hooks/useUserTokens';
import Modal from '../../components/modal/Modal';
import { formatPrice } from '../../utils/formatters';
import { getPublicConfig } from '../../services/configService';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  region?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { total, used } = useUserTokens();
  const [plans, setPlans] = useState<{ tokens: number; price: string }[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+55');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'plan'>('info');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t, language } = useI18n();
  const { showToast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await checkAuth();
        if (!userData) {
          navigate('/');
          return;
        }
        setUser(userData);
        if (userData.phone) {
          if (userData.phone.startsWith('+55')) {
            setPhoneCountryCode('+55');
            setPhoneNumber(userData.phone.replace('+55', '').trim());
          } else if (userData.phone.startsWith('+1')) {
            setPhoneCountryCode('+1');
            setPhoneNumber(userData.phone.replace('+1', '').trim());
          } else if (userData.phone.startsWith('+351')) {
            setPhoneCountryCode('+351');
            setPhoneNumber(userData.phone.replace('+351', '').trim());
          } else {

            const match = userData.phone.match(/^\+(\d{1,3})\s?(.*)$/);
            if (match) {
              setPhoneCountryCode(`+${match[1]}`);
              setPhoneNumber(match[2]);
            } else {
              setPhoneNumber(userData.phone);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        navigate('/');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const config = await getPublicConfig();

        const formattedPlans = config.plans.map(plan => {
          const priceToShow = language === 'pt' ? plan.priceBrl : plan.priceUsd;
          return {
            tokens: plan.tokens,
            price: formatPrice(priceToShow, language),
          };
        });

        setPlans(formattedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        const defaultPriceUsd2k = 9.99;
        const defaultPriceUsd5k = 19.99;
        const defaultPriceUsd10k = 29.99;
        const defaultPriceBrl2k = 49.9;
        const defaultPriceBrl5k = 99.0;
        const defaultPriceBrl10k = 149.9;
        const priceToShow2k = language === 'pt' ? defaultPriceBrl2k : defaultPriceUsd2k;
        const priceToShow5k = language === 'pt' ? defaultPriceBrl5k : defaultPriceUsd5k;
        const priceToShow10k = language === 'pt' ? defaultPriceBrl10k : defaultPriceUsd10k;
        setPlans([
          { tokens: 2000, price: formatPrice(priceToShow2k, language) },
          { tokens: 5000, price: formatPrice(priceToShow5k, language) },
          { tokens: 10000, price: formatPrice(priceToShow10k, language) },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [language]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (phoneCountryCode === '+55') {
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    } else if (phoneCountryCode === '+1') {
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (phoneCountryCode === '+351') {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    } else {
      if (digits.length <= 4) return digits;
      if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
    }
  };

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!user.name || user.name.trim().length < 2) {
      newErrors.name = t('profile.validation.nameRequired');
    }

    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = t('profile.validation.emailInvalid');
    }

    if (phoneNumber.trim()) {
      const phoneDigits = phoneNumber.replace(/\D/g, '');
      if (phoneCountryCode === '+55' && phoneDigits.length < 10) {
        newErrors.phone = t('profile.validation.phoneBrazilInvalid');
      } else if (phoneCountryCode === '+1' && phoneDigits.length < 10) {
        newErrors.phone = t('profile.validation.phoneUSInvalid');
      } else if (phoneCountryCode === '+351' && phoneDigits.length < 9) {
        newErrors.phone = t('profile.validation.phonePortugalInvalid');
      } else if (phoneDigits.length < 8) {
        newErrors.phone = t('profile.validation.phoneGenericInvalid');
      }
    }

    if (user.birthdate) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(user.birthdate)) {
        newErrors.birthdate = t('profile.validation.birthdateFormat');
      } else {
        const [day, month, year] = user.birthdate.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        if (date > today || year < 1900) {
          newErrors.birthdate = t('profile.validation.birthdateInvalid');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    let value = e.target.value;
    const name = e.target.name;

    if (name === 'phoneNumber') {
      const formattedNumber = formatPhoneNumber(value);
      setPhoneNumber(formattedNumber);
      const fullPhone = phoneNumber.trim() ? `${phoneCountryCode} ${formattedNumber}` : '';
      setUser({ ...user, phone: fullPhone });
    } else if (name === 'birthdate') {
      value = formatDate(value);
      setUser({ ...user, [name]: value });
    } else {
      setUser({ ...user, [name]: value });
    }

    if (errors[name as keyof FormErrors] || (name === 'phoneNumber' && errors.phone)) {
      setErrors({ ...errors, [name]: undefined, phone: undefined });
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryCode = e.target.value;
    setPhoneCountryCode(newCountryCode);

    const fullPhone = phoneNumber.trim() ? `${newCountryCode} ${phoneNumber}` : '';
    setUser({ ...user, phone: fullPhone });
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      console.error(t('profile.validation.invalidUserDelete'));
      return;
    }
    try {
      await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      saveUser(null);
      showToast(t('profile.accountDeletedSuccess'), 'success');
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      showToast(t('errors.internalServerError'), 'error');
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.error(t('profile.validation.invalidUser'));
      return;
    }

    const fullPhone = phoneNumber.trim() ? `${phoneCountryCode} ${phoneNumber}` : '';
    const userToSave = { ...user, phone: fullPhone };

    if (!validateForm()) {
      showToast(t('profile.validation.fixFormErrors'), 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userToSave),
      });

      const updated = await res.json();
      saveUser(updated);
      setUser(updated);
      showToast(t('profile.saveChangesSuccess'), 'success');
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      showToast(t('errors.internalServerError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header title={t('profile.title')} backTo="/" fixed />

        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/5 via-transparent to-[#4F91C3]/5" />
        </div>
        <div className="relative z-10 pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Loader2 size={48} className="text-[#6DAEDB] animate-spin" />
                </div>
                <p className="text-xl text-[#AAB9C3]">{t('profile.loading')}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={t('profile.title')} backTo="/" fixed /><div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/5 via-transparent to-[#4F91C3]/5" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#6DAEDB]/10 to-[#4F91C3]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-gradient-to-br from-[#4F91C3]/10 to-[#6DAEDB]/10 rounded-full blur-xl animate-pulse" />
      </div><div className="relative z-10 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8"><motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <User size={48} className="text-[#6DAEDB] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-2xl"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-6">
              {t('profile.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#AAB9C3] max-w-4xl mx-auto leading-relaxed">
              {t('profile.subtitle')}
            </p>
          </motion.div><motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#6DAEDB]/20"><div className="flex gap-2 mb-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-2 rounded-xl border border-[#6DAEDB]/10">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                    activeTab === 'info'
                      ? 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-white shadow-lg'
                      : 'text-[#AAB9C3] hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <User size={18} />
                  {t('profile.infoTab')}
                </button>
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                    activeTab === 'plan'
                      ? 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-white shadow-lg'
                      : 'text-[#AAB9C3] hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <CreditCard size={18} />
                  {t('profile.planTab')}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  ><div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10">
                      <h3 className="text-xl font-semibold text-[#6DAEDB] mb-6 flex items-center gap-2">
                        <User size={20} />
                        {t('profile.personalInfo')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.name')} *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={user.name || ''}
                            onChange={handleChange}
                            className={`w-full bg-gray-900/80 text-white border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all ${
                              errors.name ? 'border-red-500' : 'border-[#6DAEDB]/30'
                            }`}
                            placeholder={t('profile.placeholders.name')}
                          />
                          {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.email')}
                          </label>
                          <div className="relative">
                            <Mail size={20} className="absolute left-4 top-4 text-[#6DAEDB]" />
                            <input
                              type="email"
                              name="email"
                              value={user.email || ''}
                              disabled
                              className="w-full bg-gray-700/50 text-[#AAB9C3] border border-gray-600 rounded-xl p-4 pl-12 cursor-not-allowed"
                              placeholder={t('profile.placeholders.email')}
                            />
                          </div>
                          <p className="text-xs text-[#AAB9C3] mt-1">
                            {t('profile.helpText.emailReadonly')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.phone')}
                          </label>
                          <div className="flex gap-2"><div className="relative">
                              <select
                                value={phoneCountryCode}
                                onChange={handleCountryCodeChange}
                                className="bg-gray-900/80 text-white border border-[#6DAEDB]/30 rounded-xl p-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all appearance-none w-32"
                              >
                                <option value="+55">🇧🇷 +55</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+351">🇵🇹 +351</option>
                                <option value="+34">🇪🇸 +34</option>
                                <option value="+33">🇫🇷 +33</option>
                                <option value="+49">🇩🇪 +49</option>
                                <option value="+39">🇮🇹 +39</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+54">🇦🇷 +54</option>
                                <option value="+52">🇲🇽 +52</option>
                                <option value="+81">🇯🇵 +81</option>
                                <option value="+61">🇦🇺 +61</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-[#6DAEDB]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div><div className="flex-1 relative">
                              <Phone size={20} className="absolute left-4 top-4 text-[#6DAEDB]" />
                              <input
                                type="tel"
                                name="phoneNumber"
                                value={phoneNumber}
                                onChange={handleChange}
                                className={`w-full bg-gray-900/80 text-white border rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all ${
                                  errors.phone ? 'border-red-500' : 'border-[#6DAEDB]/30'
                                }`}
                                placeholder={
                                  phoneCountryCode === '+55'
                                    ? t('profile.placeholders.phoneBrazil')
                                    : phoneCountryCode === '+1'
                                      ? t('profile.placeholders.phoneUS')
                                      : phoneCountryCode === '+351'
                                        ? t('profile.placeholders.phonePortugal')
                                        : t('profile.placeholders.phoneNumber')
                                }
                                maxLength={15}
                              />
                            </div>
                          </div>
                          {errors.phone && (
                            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                          )}
                          {!errors.phone && (
                            <p className="text-xs text-[#AAB9C3] mt-1">
                              {t('profile.helpText.phoneInstruction')}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.birthdate')}
                          </label>
                          <div className="relative">
                            <Calendar size={20} className="absolute left-4 top-4 text-[#6DAEDB]" />
                            <input
                              type="text"
                              name="birthdate"
                              value={user.birthdate || ''}
                              onChange={handleChange}
                              className={`w-full bg-gray-900/80 text-white border rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all ${
                                errors.birthdate ? 'border-red-500' : 'border-[#6DAEDB]/30'
                              }`}
                              placeholder={t('profile.placeholders.birthdate')}
                              maxLength={10}
                            />
                          </div>
                          {errors.birthdate && (
                            <p className="text-red-400 text-sm mt-1">{errors.birthdate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.gender')}
                          </label>
                          <div className="relative">
                            <select
                              name="gender"
                              value={user.gender || ''}
                              onChange={handleChange}
                              className="w-full bg-gray-900/80 text-white border border-[#6DAEDB]/30 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all appearance-none"
                            >
                              <option value="">{t('profile.genderOptions.select')}</option>
                              <option value="male">{t('profile.genderOptions.male')}</option>
                              <option value="female">{t('profile.genderOptions.female')}</option>
                              <option value="other">{t('profile.genderOptions.other')}</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <svg
                                className="w-5 h-5 text-[#6DAEDB]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.region')}
                          </label>
                          <div className="relative">
                            <MapPin
                              size={20}
                              className="absolute left-4 top-4 text-[#6DAEDB] z-10"
                            />
                            <select
                              name="region"
                              value={user.region || ''}
                              onChange={handleChange}
                              className="w-full bg-gray-900/80 text-white border border-[#6DAEDB]/30 rounded-xl p-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all appearance-none"
                            >
                              <option value="">{t('profile.countries.select')}</option>
                              <option value="BR">{t('profile.countries.brazil')}</option>
                              <option value="AR">{t('profile.countries.argentina')}</option>
                              <option value="BO">{t('profile.countries.bolivia')}</option>
                              <option value="CL">{t('profile.countries.chile')}</option>
                              <option value="CO">{t('profile.countries.colombia')}</option>
                              <option value="EC">{t('profile.countries.ecuador')}</option>
                              <option value="GY">{t('profile.countries.guyana')}</option>
                              <option value="PY">{t('profile.countries.paraguay')}</option>
                              <option value="PE">{t('profile.countries.peru')}</option>
                              <option value="SR">{t('profile.countries.suriname')}</option>
                              <option value="UY">{t('profile.countries.uruguay')}</option>
                              <option value="VE">{t('profile.countries.venezuela')}</option>
                              <option value="US">{t('profile.countries.usa')}</option>
                              <option value="CA">{t('profile.countries.canada')}</option>
                              <option value="MX">{t('profile.countries.mexico')}</option>
                              <option value="PT">{t('profile.countries.portugal')}</option>
                              <option value="ES">{t('profile.countries.spain')}</option>
                              <option value="FR">{t('profile.countries.france')}</option>
                              <option value="DE">{t('profile.countries.germany')}</option>
                              <option value="IT">{t('profile.countries.italy')}</option>
                              <option value="GB">{t('profile.countries.uk')}</option>
                              <option value="JP">{t('profile.countries.japan')}</option>
                              <option value="AU">{t('profile.countries.australia')}</option>
                              <option value="OTHER">{t('profile.countries.other')}</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <svg
                                className="w-5 h-5 text-[#6DAEDB]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div><div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10">
                      <h3 className="text-xl font-semibold text-[#6DAEDB] mb-6 flex items-center gap-2">
                        <CreditCard size={20} />
                        {t('profile.accountInfo')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.plan')}
                          </label>
                          <input
                            type="text"
                            name="plan"
                            value={user.plan || t('profile.freePlan')}
                            disabled
                            className="w-full bg-gray-700/50 text-[#AAB9C3] border border-gray-600 rounded-xl p-4 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#E0ECF1] mb-2">
                            {t('profile.tokensAvailable')}
                          </label>
                          <div className="bg-gray-900/80 border border-[#6DAEDB]/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[#6DAEDB] font-semibold">{total - used}</span>
                              <span className="text-[#AAB9C3] text-sm">
                                {t('profile.helpText.tokenUsage')} {total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] h-2 rounded-full transition-all"
                                style={{
                                  width: `${total > 0 ? ((total - used) / total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div><div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            {t('profile.saving')}
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            {t('profile.saveChanges')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 border-2 border-red-500 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        {t('profile.deleteAccount')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'plan' && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-semibold text-[#6DAEDB] mb-4">
                        {t('profile.plans.thanks-for-the-suport')}
                      </h3>
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10 inline-block">
                        <p className="text-[#AAB9C3] text-lg">
                          {t('plansPage.youHave')}{' '}
                          <span className="text-[#6DAEDB] font-bold text-2xl">{total - used}</span>{' '}
                          {t('plansPage.tokensLeft')}
                        </p>
                        <p className="text-[#AAB9C3] text-sm mt-2">
                          ({total} {t('plansPage.tokens')} {t('plansPage.validFor')})
                        </p>
                      </div>
                    </div>

                    {loadingPlans ? (
                      <div className="text-center py-12">
                        <Loader2 size={32} className="text-[#6DAEDB] animate-spin mx-auto mb-4" />
                        <p className="text-[#AAB9C3]">{t('common.loading')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                          <motion.div
                            key={plan.tokens}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/20 text-center hover:border-[#6DAEDB]/40 transition-all hover:scale-105 shadow-lg"
                          >
                            <div className="text-3xl font-bold text-[#6DAEDB] mb-2">
                              {plan.tokens}
                            </div>
                            <div className="text-[#AAB9C3] text-sm mb-4">
                              {t('plansPage.tokens')}
                            </div>
                            <div className="text-xl font-semibold text-white mb-4">
                              {plan.price}
                            </div>
                            <div className="text-xs text-[#AAB9C3]">
                              {t('plansPage.tokenBasedUsage')}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="text-center">
                      <button
                        onClick={() => navigate('/planos')}
                        className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto"
                      >
                        <CreditCard size={18} />
                        {t('plansPage.buyNow')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />

      {showDeleteModal && (
        <Modal
          title={t('profile.confirmDeleteTitle')}
          description={
            <div className="space-y-2">
              <p>{t('profile.confirmDeleteText')}</p>
              <p className="text-yellow-400 font-medium">{t('profile.noRefundWarning')}</p>
            </div>
          }
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          confirmText={t('profile.confirmDeleteButton')}
          cancelText={t('profile.cancelButton')}
          size="sm"
        />
      )}
    </div>
  );
};

export default ProfilePage;