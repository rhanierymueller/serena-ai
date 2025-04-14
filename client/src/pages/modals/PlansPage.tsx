import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import CreditCardForm, { CardFormData } from '../../components/CreditCardForm';

const PlansPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const creditCardFormRef = useRef<{ submit: () => void }>(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8 text-left">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#6DAEDB] hover:text-white underline transition-all"
          >
            ← {t('chat.goHome')}
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-4">{t('plansPage.title')}</h1>
        <p className="text-gray-400 mb-10">{t('plansPage.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{t('plansPage.free.title')}</h2>
            <p className="text-gray-400 mb-4">{t('plansPage.free.description')}</p>
            <span className="block text-2xl font-bold mb-4">{t('plansPage.free.price')}</span>
            <button
              onClick={() => navigate('/')}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl font-semibold transition"
            >
              {t('plansPage.free.button')}
            </button>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#6DAEDB] shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{t('plansPage.pro.title')}</h2>
            <p className="text-gray-400 mb-4">{t('plansPage.pro.description')}</p>
            <span className="block text-2xl font-bold mb-4">{t('plansPage.pro.price')}</span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl font-semibold transition"
            >
              {t('plansPage.pro.button')}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          title={t('plansPage.form.title')}
          description={
            <CreditCardForm ref={creditCardFormRef} onClose={() => setShowModal(false)} />
          }
          onCancel={() => setShowModal(false)}
          onConfirm={() => creditCardFormRef.current?.submit()}
          confirmText={t('plansPage.form.confirm')}
          cancelText={t('plansPage.form.cancel')}
          size="md"
        />
      )}
    </div>
  );
};

export default PlansPage;
