import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';
import { BASE_URL } from '../config';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push(t('register.validation.passwordMin'));
    if (!/[A-Z]/.test(password)) errors.push(t('register.validation.passwordUpper'));
    if (!/[a-z]/.test(password)) errors.push(t('register.validation.passwordLower'));
    if (!/[0-9]/.test(password)) errors.push(t('register.validation.passwordNumber'));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push(t('register.validation.passwordSymbol'));
    return errors;
  };

  const handleResetPassword = async () => {
    if (!token) {
      showToast('Token inválido.', 'error');
      return;
    }

    if (!password || !confirmPassword) {
      showToast(t('register.validation.passwordRequired'), 'error');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      passwordErrors.forEach(msg => showToast(msg, 'error'));
      return;
    }

    if (password !== confirmPassword) {
      showToast(t('register.validation.passwordMatch'), 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Erro desconhecido');
      }

      showToast(t('login.sent'), 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      showToast(error.message || t('errors.internalServerError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('login.forgotPasswordTitle')}</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-1">{t('register.password')}</label>
            <input
              type="password"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2"
              placeholder={t('register.password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">{t('register.confirmPassword')}</label>
            <input
              type="password"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2"
              placeholder={t('register.confirmPassword')}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className={`mt-4 w-full flex items-center justify-center gap-2 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-bold py-3 rounded-2xl transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : t('login.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
