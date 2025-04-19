import React, { useEffect, useState } from 'react';
import { getUser, saveUser } from '../services/userSession';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { BASE_URL } from '../config';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'test'>('info');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      const updated = await res.json();
      saveUser(updated);
      setUser(updated);
      navigate('/');
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  };

  if (loading || !user) return <div className="text-white p-4">Carregando...</div>;

  return (
    <PageLayout title="Meu Perfil" backTo="/">
      <div className="bg-black/80 p-6 sm:p-8 rounded-2xl border border-gray-700 max-w-4xl w-full min-w-[620px] sm:min-w-[600px] shadow-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Meu Perfil</h1>

        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 px-3 font-medium ${
              activeTab === 'info'
                ? 'text-[#6DAEDB] border-b-2 border-[#6DAEDB]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`pb-2 px-3 font-medium ${
              activeTab === 'test'
                ? 'text-[#6DAEDB] border-b-2 border-[#6DAEDB]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Meu plano
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Nome</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1">Gênero</label>
              <select
                name="gender"
                value={user.gender || ''}
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
              >
                <option value="">Selecionar</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Plano</label>
              <input
                type="text"
                name="plan"
                value={user.plan}
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
                disabled
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-xl font-semibold transition-all w-full"
            >
              Salvar Alterações
            </button>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => {
                  if (user.plan === 'free') return;
                  const updatedUser = { ...user, plan: 'free' };
                  setUser(updatedUser);
                }}
                className={`cursor-pointer p-6 rounded-2xl border shadow-md transition-all ${
                  user.plan === 'free'
                    ? 'border-[#6DAEDB] bg-[#111]'
                    : 'border-gray-700 bg-[#1a1a1a] hover:border-[#6DAEDB]'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-2">Plano Gratuito</h3>
                <p className="text-gray-400 mb-4">
                  Ideal para quem quer experimentar com recursos limitados.
                </p>
                <span className="block text-2xl font-bold mb-4">R$ 0/mês</span>
              </div>

              <div
                onClick={() => {
                  if (user.plan === 'pro') return;
                  const updatedUser = { ...user, plan: 'pro' };
                  //setUser(updatedUser);
                }}
                className={`cursor-pointer p-6 rounded-2xl border shadow-md transition-all ${
                  user.plan === 'Pro'
                    ? 'border-[#6DAEDB] bg-[#111]'
                    : 'border-gray-700 bg-[#1a1a1a] hover:border-[#6DAEDB]'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-2">Plano Pro</h3>
                <p className="text-gray-400 mb-4">
                  Acesso completo, respostas mais rápidas e suporte prioritário.
                </p>
                <span className="block text-2xl font-bold mb-4">R$ 29,90/mês</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
