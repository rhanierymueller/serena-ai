import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-[#111] text-gray-400 px-6 py-3 border-t border-gray-800 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div className="text-white font-semibold">Serena AI</div>

        <div className="text-xs text-gray-600 text-center md:text-left">
          &copy; {new Date().getFullYear()} Serena AI. {t('footer.copyright')}
        </div>

        <div className="flex gap-4 text-xs md:text-sm justify-center md:justify-end">
          <a href="#" className="hover:text-white transition-colors">
            {t('footer.about')}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t('footer.terms')}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
