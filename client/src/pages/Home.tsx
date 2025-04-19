import React, { useEffect, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import Modal from '../components/Modal';
import Select from '../components/Select';
import Footer from '../components/Footer';
import RegisterModal from './modals/RegisterModal';
import LoginModal from './modals/LoginModal';
import { TypingText } from '../components/TypingText';
import { clearUser, getUser, saveUser } from '../services/userSession';
import { BASE_URL } from '../config';

type Language = 'pt' | 'en' | 'es';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const storedUser = getUser();
  const [userName, setUserName] = useState<string | null>(
    () => storedUser?.name.split(' ')[0] ?? null
  );
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    () => storedUser?.gender ?? 'other'
  );

  const { language, setLanguage, t } = useI18n();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    updateUserState();
  }, []);

  const handleRegisterSuccess = () => {
    updateUserState();
    setShowRegister(false);
  };

  const handleTestClick = () => setShowDisclaimer(true);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setTransitioning(true);
    setTimeout(() => navigate('/chat'), 600);
  };

  const updateUserState = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Não autenticado');

      const user = await res.json();
      console.log('[auth/me] usuário retornado:', user);

      saveUser(user);

      if (user.name) {
        const [firstName] = user.name.split(' ');
        setUserName(firstName);
      }

      setGender(user.gender || 'male');
    } catch (err) {
      console.error('Falha ao verificar login:', err);

      const stored = getUser();
      if (stored?.name) {
        const [firstName] = stored.name.split(' ');
        setUserName(firstName);
        setGender(stored.gender || 'male');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden relative">
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0d] animate-fadeOutToBlack pointer-events-none" />
      )}

      {/* Fundo animado fixo */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/image/ceu.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitMaskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          transition: 'mask-image 0.2s ease, -webkit-mask-image 0.2s ease',
        }}
      />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
        {userName && (
          <button
            onClick={() => navigate('/perfil')}
            className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            {t('home.myProfile')}
          </button>
        )}
        <button
          onClick={() => navigate('/planos')}
          className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          {t('home.plans')}
        </button>
        <Select value={language} onChange={setLanguage} options={languageOptions} />
        {userName && (
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            {t('home.logout')}
          </button>
        )}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center z-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Bot size={40} className="text-[#6DAEDB]" />
          <h1 className="text-4xl font-bold font-sans">{t('header.title')}</h1>
        </div>

        <p className="text-center text-lg md:text-xl text-[#AAB9C3] max-w-xl mb-6">
          {t('header.subtitle')}
        </p>

        {userName && (
          <div className="mt-4 mb-6 text-[#6DAEDB] text-xl md:text-2xl font-bold">
            <TypingText text={`${t('home.welcome')} ${userName}`} />
          </div>
        )}

        <div className="flex gap-4">
          {!userName ? (
            <>
              <button
                onClick={handleTestClick}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-3 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('home.testNow')}
              </button>

              <button
                onClick={() => setShowRegister(true)}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-3 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('register.title')}
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-3 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('login.title')}
              </button>
            </>
          ) : (
            <button
              onClick={handleTestClick}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-3 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
            >
              {t('home.testNow')}
            </button>
          )}
        </div>
      </main>

      <div className="z-10">
        <Footer />
      </div>

      {showDisclaimer && (
        <Modal
          title={t('home.disclaimer.title')}
          description={t('home.disclaimer.text')}
          onCancel={() => setShowDisclaimer(false)}
          onConfirm={handleAcceptDisclaimer}
          cancelText={t('home.disclaimer.back')}
          confirmText={t('home.disclaimer.understood')}
          size="md"
        />
      )}

      {showRegister && <RegisterModal onClose={handleRegisterSuccess} />}

      {showLogoutModal && (
        <Modal
          title={t('home.logoutTitle')}
          description={t('home.logoutConfirm')}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            clearUser();
            setUserName(null);
            setShowLogoutModal(false);
          }}
          cancelText={t('home.logoutCancel')}
          confirmText={t('home.logoutConfirmBtn')}
          size="sm"
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            updateUserState();
            setShowLogin(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
