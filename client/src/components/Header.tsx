import React, { useState } from 'react';
import {
  ArrowLeft,
  BadgeDollarSign,
  LogOut,
  NotebookPen,
  User,
  Wind,
  Menu,
  X,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import Select from './Select';
import Modal from './Modal';
import { getUser, clearUser } from '../services/userSession';

type Language = 'pt' | 'en' | 'es';

interface HeaderProps {
  title?: string;
  backTo?: string;
  fixed?: boolean;
  showMenu?: boolean;
  onLogoutSuccess?: () => void;
}

const languageOptions: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const Header: React.FC<HeaderProps> = ({
  title,
  backTo,
  fixed = false,
  showMenu = true,
  onLogoutSuccess,
}) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useI18n();
  const user = getUser();
  const userName = user?.name?.split(' ')[0];

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selfCareOpen, setSelfCareOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    onLogoutSuccess?.();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <div
        className={`z-30 flex items-center justify-between px-4 py-3 ${
          fixed
            ? 'fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-gray-700'
            : ''
        }`}
      >
        {backTo ? (
          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 text-sm text-white px-3 py-1 hover:bg-[#2C3E50] rounded-xl transition"
          >
            <ArrowLeft size={18} className="text-[#6DAEDB]" />
            <span>{t('home.disclaimer.back')}</span>
          </button>
        ) : (
          <div className="w-10" />
        )}

        {title && (
          <h2 className="text-sm font-medium text-white flex-1 text-center md:text-left truncate">
            {' '}
            {title}
          </h2>
        )}

        <div className="flex items-center gap-2">
          {/* Language selector mobile */}
          <Select
            value={language}
            onChange={setLanguage}
            options={languageOptions}
            className="md:hidden"
          />

          {showMenu && (
            <div className="hidden md:flex items-center gap-4 ml-4">
              {/* Self-Care Dropdown */}
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
              >
                <MessageSquare size={18} className="text-[#6DAEDB]" />
                <span>{t('header.chatTitle') || 'Chat'}</span>
              </button>
              <div
                className="relative"
                onMouseEnter={() => setSelfCareOpen(true)}
                onMouseLeave={() => setSelfCareOpen(false)}
              >
                <button className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition">
                  <Sparkles size={18} className="text-[#6DAEDB]" />
                  <span>{t('header.selfCare')}</span>
                </button>
                {selfCareOpen && (
                  <div className="absolute top-full left-0 bg-[#111] border border-[#2a3b47] rounded-xl shadow-xl flex flex-col z-50 w-56">
                    <button
                      onClick={() => navigate('/motivacional')}
                      className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                    >
                      <Sparkles size={16} className="text-[#6DAEDB]" />
                      {t('home.motivation')}
                    </button>
                    {userName && (
                      <>
                        <button
                          onClick={() => navigate('/mood-tracker')}
                          className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                        >
                          <NotebookPen size={16} className="text-[#6DAEDB]" />
                          {t('home.moodTracker')}
                        </button>
                        <button
                          onClick={() => navigate('/respiracao')}
                          className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                        >
                          <Wind size={16} className="text-[#6DAEDB]" />
                          {t('home.breathing')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Account Dropdown */}
              {userName && (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountOpen(true)}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <button className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition">
                    <User size={18} className="text-[#6DAEDB]" />
                    <span>{t('header.account')}</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute top-full left-0 bg-[#111] border border-[#2a3b47] rounded-xl shadow-xl flex flex-col z-50 w-56">
                      <button
                        onClick={() => navigate('/perfil')}
                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                      >
                        <User size={16} className="text-[#6DAEDB]" />
                        {t('home.myProfile')}
                      </button>
                      <button
                        onClick={() => navigate('/planos')}
                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                      >
                        <BadgeDollarSign size={16} className="text-[#6DAEDB]" />
                        {t('home.plans')}
                      </button>
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#2C3E50] text-white text-sm"
                      >
                        <LogOut size={16} className="text-[#6DAEDB]" />
                        {t('home.logout')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Select value={language} onChange={setLanguage} options={languageOptions} />
            </div>
          )}

          {showMenu && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2 rounded-md hover:bg-[#2C3E50] transition"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#111] border-t border-[#2a3b47] px-4 py-4 space-y-3">
          <button
            onClick={() => {
              navigate('/chat');
              setMenuOpen(false);
            }}
            className="block w-full text-left text-white py-2"
          >
            {t('chat.title') || 'Chat'}
          </button>
          <button
            onClick={() => {
              navigate('/motivacional');
              setMenuOpen(false);
            }}
            className="block w-full text-left text-white py-2"
          >
            {t('home.motivation')}
          </button>
          {userName && (
            <>
              <button
                onClick={() => {
                  navigate('/mood-tracker');
                  setMenuOpen(false);
                }}
                className="block w-full text-left text-white py-2"
              >
                {t('home.moodTracker')}
              </button>
              <button
                onClick={() => {
                  navigate('/respiracao');
                  setMenuOpen(false);
                }}
                className="block w-full text-left text-white py-2"
              >
                {t('home.breathing')}
              </button>
              <button
                onClick={() => {
                  navigate('/perfil');
                  setMenuOpen(false);
                }}
                className="block w-full text-left text-white py-2"
              >
                {t('home.myProfile')}
              </button>
            </>
          )}
          <button
            onClick={() => {
              navigate('/planos');
              setMenuOpen(false);
            }}
            className="block w-full text-left text-white py-2"
          >
            {t('home.plans')}
          </button>
          {userName && (
            <button
              onClick={() => {
                setShowLogoutModal(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left text-white py-2"
            >
              {t('home.logout')}
            </button>
          )}
        </div>
      )}

      {showLogoutModal && (
        <Modal
          title={t('home.logoutTitle')}
          description={t('home.logoutConfirm')}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
          cancelText={t('home.logoutCancel')}
          confirmText={t('home.logoutConfirmBtn')}
          size="sm"
        />
      )}
    </>
  );
};

export default Header;
