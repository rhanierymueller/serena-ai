import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Toast from '../../components/toast/Toast';
import { Mail, User, MessageCircle, Send, AlertTriangle } from 'lucide-react';
import { BASE_URL } from '../../config';
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

    const res = await fetch(`${BASE_URL}/api/contact`, {
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
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20"><section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Mail className="h-8 w-8 text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('contact.title')}
              </h1>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
          </div>
        </section><section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col">
                  <label
                    className="flex items-center gap-2 text-white mb-3 font-medium"
                    htmlFor="name"
                  >
                    <User className="h-4 w-4 text-[#6DAEDB]" />
                    {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                    maxLength={MAX_NAME_LENGTH}
                    className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                    placeholder={t('contact.namePlaceholder')}
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    className="flex items-center gap-2 text-white mb-3 font-medium"
                    htmlFor="email"
                  >
                    <Mail className="h-4 w-4 text-[#6DAEDB]" />
                    {t('contact.email')}
                  </label>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                  {emailError && (
                    <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {emailError}
                    </span>
                  )}
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label
                    className="flex items-center gap-2 text-white mb-3 font-medium"
                    htmlFor="message"
                  >
                    <MessageCircle className="h-4 w-4 text-[#6DAEDB]" />
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    rows={5}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">
                      {message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                    <div className="w-20 bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(message.length / MAX_MESSAGE_LENGTH) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-center mt-6">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-semibold px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                    {t('contact.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ContactPage;