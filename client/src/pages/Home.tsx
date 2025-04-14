import React, { useEffect, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import Modal from '../components/Modal';
import Select from '../components/Select';
import Footer from '../components/Footer';
import RegisterModal from './modals/RegisterModal';
import { TypingText } from '../components/TypingText';
import { clearUser, getUser } from '../services/userSession';
import LoginModal from './modals/LoginModal';

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
  const [userName, setUserName] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [showLogin, setShowLogin] = useState(false);

  const { language, setLanguage, t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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

  const updateUserState = () => {
    const user = getUser();
    if (user) {
      const [firstName] = user.name.split(' ');
      setUserName(firstName);
      setGender(user.gender || 'other');
    }
  };

  return (
    <>
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0d] animate-fadeOutToBlack pointer-events-none" />
      )}

      <div
        ref={containerRef}
        className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden relative"
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/image/ceu.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            WebkitMaskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
            maskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
            transition: 'mask-image 0.2s ease, -webkit-mask-image 0.2s ease',
          }}
        />

        <div
          ref={blurRef}
          className="pointer-events-none absolute w-64 h-64 rounded-full z-10"
          style={{
            filter: 'blur(40px)',
            transform: `translate(${mouse.x - 128}px, ${mouse.y - 128}px)`,
            transition: 'transform 0.05s linear',
          }}
        />

        <div className="absolute top-0 right-0 p-4 z-20 flex items-center gap-4">
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

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Bot size={40} className="text-[#6DAEDB]" />{' '}
            <h1 className="text-4xl font-bold font-sans">{t('header.title')}</h1>
          </div>

          <p className="text-center text-lg md:text-xl text-[#AAB9C3] max-w-xl mb-6">
            {t('header.subtitle')}
          </p>

          {userName && (
            <div className="mt-4 mb-6 text-[#6DAEDB] text-xl md:text-2xl font-bold">
              <TypingText
                text={`${t(
                  `home.welcome${
                    gender === 'female' ? 'Female' : gender === 'male' ? 'Male' : 'Other'
                  }`
                )}, ${userName}!`}
              />
            </div>
          )}

          <div className="flex gap-4">
            {!userName ? (
              <>
                <button
                  onClick={handleTestClick}
                  className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-lg font-semibold transition-all"
                >
                  {t('home.testNow')}
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black  px-6 py-3 rounded-2xl text-lg font-semibold transition-all"
                >
                  {t('register.title')}
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black  px-6 py-3 rounded-2xl text-lg font-semibold transition-all"
                >
                  {t('login.title')}
                </button>
              </>
            ) : (
              <button
                onClick={handleTestClick}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-lg font-semibold transition-all"
              >
                {t('home.testNow')}
              </button>
            )}
          </div>
        </div>

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
    </>
  );
};

export default Home;
