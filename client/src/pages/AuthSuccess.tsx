import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser } from '../services/userSession';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        saveUser(parsed);
        console.log('✅ Usuário salvo localmente:', parsed);
      } catch (err) {
        console.error('❌ Erro ao parsear user:', err);
      }
    }

    navigate('/');
  }, []);

  return <p className="text-white text-center mt-20">Autenticando...</p>;
};

export default AuthSuccess;
