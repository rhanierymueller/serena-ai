import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeDollarSign, LogOut, NotebookPen, User, Wind } from 'lucide-react';
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

  const handleLogout = () => {
    clearUser();
    onLogoutSuccess?.();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <div
        className={`z-30 flex items-center justify-between gap-4 px-4 py-3 ${
          fixed
            ? 'fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-gray-700'
            : ''
        }`}
      >
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
          >
            <ArrowLeft size={18} className="text-[#6DAEDB]" />
            <span>{t('home.disclaimer.back')}</span>
          </button>
        )}

        {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}

        {showMenu && (
          <div className="flex items-center gap-4 ml-auto">
            {userName && (
              <>
                <button
                  onClick={() => navigate('/mood-tracker')}
                  className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
                >
                  <NotebookPen size={18} className="text-[#6DAEDB]" />
                  <span>{t('home.moodTracker')}</span>
                </button>

                <button
                  onClick={() => navigate('/respiracao')}
                  className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
                >
                  <Wind size={18} className="text-[#6DAEDB]" />
                  <span>{t('home.breathing')}</span>
                </button>

                <button
                  onClick={() => navigate('/perfil')}
                  className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
                >
                  <User size={18} className="text-[#6DAEDB]" />
                  <span>{t('home.myProfile')}</span>
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/planos')}
              className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
            >
              <BadgeDollarSign size={18} className="text-[#6DAEDB]" />

              <span>{t('home.plans')}</span>
            </button>
            <Select value={language} onChange={setLanguage} options={languageOptions} />
            {userName && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-sm text-white px-4 py-2 hover:bg-[#2C3E50] rounded-xl transition"
              >
                <LogOut size={18} className="text-[#6DAEDB]" />
                <span>{t('home.logout')}</span>
              </button>
            )}
          </div>
        )}
      </div>

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
