import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface HeaderProps {
  title?: string;
  backTo?: string;
  fixed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, backTo, fixed = false }) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div
      className={`z-30 flex items-center gap-4 px-4 py-3 ${
        fixed
          ? 'fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-gray-700'
          : ''
      }`}
    >
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="flex items-center gap-2 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-md font-semibold transition"
      >
        <ArrowLeft size={18} />
        {t('home.disclaimer.back')}
      </button>

      {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
    </div>
  );
};

export default Header;
