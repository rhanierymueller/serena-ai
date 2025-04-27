import React, { useEffect, useState } from 'react';
import LogoIcon from '/image/image.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import RegisterModal from './modals/RegisterModal';
import LoginModal from './modals/LoginModal';
import { TypingText } from '../components/TypingText';
import { getUser, saveUser } from '../services/userSession';
import { BASE_URL } from '../config';
import Header from '../components/Header';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const storedUser = getUser();
  const [userName, setUserName] = useState<string | null>(
    () => storedUser?.name?.split(' ')[0] ?? null
  );
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    () => storedUser?.gender ?? 'other'
  );

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('activated') === 'true') {
      setShowLogin(true);
    }
  }, [location]);

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

  const updateUserState = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (!res.ok) throw new Error('Não autenticado');

      const user = await res.json();

      if (!user.active) throw new Error('Conta não ativada');

      saveUser(user);

      if (user.name) {
        const [firstName] = user.name.split(' ');
        setUserName(firstName);
      }
      setGender(user.gender || 'male');
    } catch (err) {
      console.error('Falha ao verificar login:', err);
      setUserName(null);
      setGender('other');
    }
  };

  const handleTestClick = () => setShowDisclaimer(true);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setTransitioning(true);
    setTimeout(() => navigate('/chat'), 600);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden relative">
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0d] animate-fadeOutToBlack pointer-events-none" />
      )}

      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/image/ceu.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitMaskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          transition: 'mask-image 0.2s ease, -webkit-mask-image 0.2s ease',
        }}
      />

      <Header fixed showMenu onLogoutSuccess={() => setUserName(null)} />

      <main className="flex-1 flex flex-col items-center justify-center z-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <img
            src={LogoIcon}
            alt="Avylia logo"
            className="h-16 w-16 md:h-24 md:w-24 select-none pointer-events-none"
          />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Avylia <span className="text-white/80">AI</span>
          </h1>
        </div>
        <p className="text-center text-lg md:text-xl text-[#AAB9C3] max-w-xl mb-6">
          {t('header.subtitle')}
        </p>

        {userName && (
          <div className="mt-4 mb-6 text-[#6DAEDB] text-xl md:text-2xl font-bold">
            <TypingText text={`${t('home.welcome')} ${userName}`} />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          {!userName ? (
            <>
              <button
                onClick={handleTestClick}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('home.avyChat')}
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('register.title')}
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
              >
                {t('login.title')}
              </button>
            </>
          ) : (
            <button
              onClick={handleTestClick}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-2xl text-sm md:text-lg font-semibold whitespace-nowrap transition-all"
            >
              {t('home.avyChat')}
            </button>
          )}
        </div>
      </main>

      <Footer />

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
