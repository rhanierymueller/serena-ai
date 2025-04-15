import React, { useEffect, useRef, useState } from 'react';
import { getUser, saveUser } from '../services/userSession';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'test'>('info');
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      const updated = await res.json();
      saveUser(updated);
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao salvar perfil.');
      console.error(err);
    }
  };

  if (loading || !user) return <div className="text-white p-4">Carregando...</div>;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/image/ceu.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitMaskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${mouse.x}px ${mouse.y}px, white 0%, transparent 100%)`,
          transition: 'mask-image 0.2s ease, -webkit-mask-image 0.2s ease',
        }}
      />

      <div
        ref={blurRef}
        className="pointer-events-none absolute w-64 h-64 rounded-full z-10"
        style={{
          filter: 'blur(40px)',
          transform: `translate(${mouse.x - 128}px, ${mouse.y - 128}px)`,
          transition: 'transform 0.05s linear',
        }}
      />

      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-md font-semibold transition"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="z-20 bg-black/80 p-6 sm:p-8 rounded-2xl border border-gray-700 max-w-4xl w-full shadow-lg">
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
            Testes
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
            <h2 className="text-xl font-semibold mb-4">Aba de Testes</h2>
            <p className="text-sm">
              Aqui você pode experimentar novas funcionalidades ou visualizar dados em
              desenvolvimento.
            </p>
            <div className="mt-4">
              <pre className="bg-gray-800 p-4 rounded-md text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
