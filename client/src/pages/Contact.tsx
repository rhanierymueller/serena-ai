import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import PageLayout from '../components/PageLayout';
import Toast from '../components/Toast';
import * as yup from 'yup';

const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 500;

const schema = yup.object({
  email: yup
    .string()
    .required('register.validation.emailRequired')
    .email('register.validation.emailInvalid'),
});

const ContactPage: React.FC = () => {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await schema.validate({ email });
      setEmailError(null);
    } catch (err: any) {
      setEmailError(t(err.message));
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      setToast({ message: t('contact.successMessage'), type: 'success' });
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setToast({ message: t('contact.errorMessage'), type: 'error' });
    }

    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PageLayout backTo="/">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full bg-[#111] border border-gray-700 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6DAEDB] mb-6 text-center">
            {t('contact.title')}
          </h1>

          <p className="text-lg text-[#AAB9C3] text-center mb-10">{t('contact.subtitle')}</p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="text-[#AAB9C3] mb-1" htmlFor="name">
                {t('contact.name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                maxLength={MAX_NAME_LENGTH}
                className="bg-black border border-[#6DAEDB] rounded-lg px-4 py-2 text-white"
                placeholder={t('contact.namePlaceholder')}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[#AAB9C3] mb-1" htmlFor="email">
                {t('contact.email')}
              </label>
              <input
                type="text" // <- string normal para validação 100% yup
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-black border border-[#6DAEDB] rounded-lg px-4 py-2 text-white"
                placeholder={t('contact.emailPlaceholder')}
              />
              {emailError && <span className="text-red-500 text-sm mt-1">{emailError}</span>}
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="text-[#AAB9C3] mb-1" htmlFor="message">
                {t('contact.message')}
              </label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                rows={5}
                maxLength={MAX_MESSAGE_LENGTH}
                className="bg-black border border-[#6DAEDB] rounded-lg px-4 py-2 text-white resize-none"
                placeholder={t('contact.messagePlaceholder')}
              />
              <div className="text-right text-sm text-[#AAB9C3] mt-1">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-semibold px-6 py-3 rounded-2xl transition"
              >
                {t('contact.send')}
              </button>
            </div>
          </form>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </main>
    </PageLayout>
  );
};

export default ContactPage;
