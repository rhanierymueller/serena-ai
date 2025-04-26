import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-[#111] text-gray-400 px-6 py-5 border-t border-gray-800 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between md:gap-4 text-center md:text-left">
        <div className="text-white font-semibold">Avylia AI</div>

        <div className="text-xs text-gray-500 flex flex-col md:flex-row md:items-center gap-2">
          <span>
            &copy; {new Date().getFullYear()} Avylia AI. {t('footer.copyright')}
          </span>
          <span className="hidden md:inline">|</span>
          <span>
            {t('footer.developedBy')}{' '}
            <a
              href="https://muellercode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white underline"
            >
              muellercode.com
            </a>
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-4 text-xs md:text-sm justify-center">
          <a href="/sobre" className="hover:text-white transition-colors">
            {t('footer.about')}
          </a>
          <a href="/termos" className="hover:text-white transition-colors">
            {t('footer.terms')}
          </a>
          <a href="/privacidade" className="hover:text-white transition-colors">
            {t('privacy.title')}
          </a>
          <a href="/contact" className="hover:text-white transition-colors">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
