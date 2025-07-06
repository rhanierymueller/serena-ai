import React, { useEffect, useState } from 'react';
import LogoIcon from '/image/image.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Modal, Footer, Header, ParticlesBackground } from '../../components';
import { LoginModal, RegisterModal } from '../../pages';
import { TypingText } from './components/typing-text/TypingText';
import OnboardingModal from './components/onboarding-modal/OnboardingModal';
import { getUser, saveUser, clearUser } from '../../services/userSession';
import { checkAuth } from '../../services/userService';
import { BASE_URL } from '../../config';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboardingCompleted');
    }
    return false;
  });

  const [userName, setUserName] = useState<string | null>(
    () => getUser()?.name?.split(' ')[0] ?? null
  );
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    () => getUser()?.gender ?? 'other'
  );
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('activated') === 'true') {
      setShowLogin(true);
    }
  }, [location]);

  useEffect(() => {
    updateUserState();
  }, []);

  const updateUserState = async () => {
    try {
      const user = await checkAuth();

      if (user && user.active) {
        saveUser(user);
        setHasAcceptedTerms(user.acceptedTerms || false);

        if (user.name) {
          const [firstName] = user.name.split(' ');
          setUserName(firstName);
        }
        setGender(user.gender || 'other');
        return;
      }

      clearUser();
      setUserName(null);
      setGender('other');
      setHasAcceptedTerms(false);
    } catch (err) {
      console.error('Falha ao verificar login:', err);
      clearUser();
      setUserName(null);
      setGender('other');
      setHasAcceptedTerms(false);
    }
  };

  const handleTestClick = () => {
    if (!hasAcceptedTerms) {
      setShowDisclaimer(true);
    } else {
      navigate('/chat');
    }
  };

  const handleAcceptDisclaimer = async () => {
    setShowDisclaimer(false);
    setTransitioning(true);

    if (userName) {
      try {
        const storedUser = getUser();
        if (storedUser?.id) {
          await fetch(`${BASE_URL}/api/users/accept-terms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId: storedUser.id }),
          });
          setHasAcceptedTerms(true);
        }
      } catch (error) {
        console.error('Erro ao salvar aceitação dos termos:', error);
      }
    }

    setTimeout(() => navigate('/chat'), 600);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  const features = [
    {
      title: t('home.features.empathicChat.title'),
      description: t('home.features.empathicChat.description'),
      icon: '🤖',
      image: '/image/features/chat-empathic.jpg',
    },
    {
      title: t('home.features.moodTracking.title'),
      description: t('home.features.moodTracking.description'),
      icon: '📊',
      image: '/image/features/mood-tracking.jpg',
    },
    {
      title: t('home.features.breathingExercises.title'),
      description: t('home.features.breathingExercises.description'),
      icon: '🌬️',
      image: '/image/features/breathing-exercises.jpg',
    },
    {
      title: t('home.features.cognitiveRestructuring.title'),
      description: t('home.features.cognitiveRestructuring.description'),
      icon: '🧠',
      image: '/image/features/cognitive-restructuring.jpg',
    },
    {
      title: t('home.features.professionalArea.title'),
      description: t('home.features.professionalArea.description'),
      icon: '👨‍⚕️',
      image: '/image/features/professional-area.jpg',
    },
    {
      title: t('home.features.dailyMotivation.title'),
      description: t('home.features.dailyMotivation.description'),
      icon: '⭐',
      image: '/image/features/daily-motivation.jpg',
    },
  ];
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0d] animate-fadeOutToBlack pointer-events-none" />
      )}

      <Header fixed showMenu onLogoutSuccess={() => setUserName(null)} />

      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/20 via-black to-[#6DAEDB]/10" />
        <div className="absolute inset-0">
          <ParticlesBackground id="hero-particles" />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src={LogoIcon}
              alt="Avylia logo"
              className="h-16 w-16 md:h-20 md:w-20 select-none"
            />
            <div className="flex flex-col items-start">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                Avylia <span className="text-white/80">AI</span>
              </h1>
              <span className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-xs font-semibold text-white shadow-lg uppercase tracking-wider">
                Beta
              </span>
            </div>
          </div>
          <p className="text-lg md:text-xl text-[#AAB9C3] max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('header.subtitle')}
          </p>

          {userName && (
            <div className="mb-8 text-[#6DAEDB] text-xl md:text-2xl font-bold">
              <TypingText text={`${t('home.welcome')} ${userName}`} />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 items-center mb-12">
            {!userName ? (
              <>
                <button
                  onClick={handleTestClick}
                  className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('home.avyChat')}
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('register.title')}
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 backdrop-blur-sm"
                >
                  {t('login.title')}
                </button>
              </>
            ) : (
              <button
                onClick={handleTestClick}
                className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                {t('home.avyChat')}
              </button>
            )}
          </div>
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.style.background =
                          'linear-gradient(135deg, #6DAEDB, #4F91C3)';
                        target.parentElement.style.display = 'flex';
                        target.parentElement.style.alignItems = 'center';
                        target.parentElement.style.justifyContent = 'center';
                        target.parentElement.innerHTML = `<span style="font-size: 4rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${feature.icon}</span>`;
                      }
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section><section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-gray-400 mb-8">{t('home.cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white px-6 py-3 rounded-2xl text-base font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                {t('home.cta.startNow')}
              </button>
              <button
                onClick={handleTestClick}
                className="border-2 border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-2xl text-base font-semibold transition-all transform hover:scale-105 backdrop-blur-sm"
              >
                {t('home.cta.testFree')}
              </button>
            </div>
          </div>
        </div>
      </section>
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