import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  HeartHandshake,
  SmilePlus,
  Activity,
  LineChart as ChartIcon,
  Smile,
  Frown,
  AlertTriangle,
  Feather,
  Flame,
  BatteryLow,
  Bolt,
  Zap,
  Heart,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useI18n } from '../../i18n/I18nContext';
import { getUser } from '../../services/userSession';
import { checkAuth, fetchUserProfile } from '../../services/userService';
import { BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';
import MoodSelect from './components/mood-select/MoodSelect';
import { formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodEntry {
  mood: string;
  intensity: number;
  note?: string;
  createdAt: string;
}

const MoodTracker: React.FC = () => {
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [mood, setMood] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MoodEntry[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const moodOptions = [
    { value: 'feliz', label: t('moodTracker.moods.happy'), icon: <Smile className="w-4 h-4" /> },
    { value: 'triste', label: t('moodTracker.moods.sad'), icon: <Frown className="w-4 h-4" /> },
    {
      value: 'ansioso',
      label: t('moodTracker.moods.anxious'),
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    { value: 'calmo', label: t('moodTracker.moods.calm'), icon: <Feather className="w-4 h-4" /> },
    { value: 'irritado', label: t('moodTracker.moods.angry'), icon: <Flame className="w-4 h-4" /> },
    {
      value: 'cansado',
      label: t('moodTracker.moods.tired'),
      icon: <BatteryLow className="w-4 h-4" />,
    },
    {
      value: 'motivado',
      label: t('moodTracker.moods.motivated'),
      icon: <Bolt className="w-4 h-4" />,
    },
    {
      value: 'estressado',
      label: t('moodTracker.moods.stressed'),
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);

        if (userData?.id) {
          fetch(`${BASE_URL}/api/mood/${userData.id}`)
            .then(res => res.json())
            .then(entries => {
              const parsed = entries.map((entry: MoodEntry) => ({
                ...entry,
                createdAt: formatDate(new Date(entry.createdAt), language),
              }));
              setData(parsed);
            });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, [language]);

  const handleSubmit = async () => {
    if (!mood || !user?.id) return;
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/api/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, intensity, note, userId: user.id }),
      });

      const updated = await fetch(`${BASE_URL}/api/mood/${user.id}`).then(res => res.json());
      const parsed = updated.map((entry: MoodEntry) => ({
        ...entry,
        createdAt: formatDate(new Date(entry.createdAt), language),
      }));
      setData(parsed);
      setMood('');
      setIntensity(3);
      setNote('');
      showToast(t('moodTracker.entrySaved'), 'success');
      chartRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast(t('moodTracker.saveError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={t('moodTracker.title')} backTo="/" fixed /><div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/5 via-transparent to-[#4F91C3]/5" />
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-[#6DAEDB]/10 to-[#4F91C3]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-10 w-32 h-32 bg-gradient-to-br from-[#4F91C3]/10 to-[#6DAEDB]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-[#6DAEDB]/5 to-[#4F91C3]/5 rounded-full blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" />
      </div><div className="relative z-10 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 py-8"><motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart size={48} className="text-[#6DAEDB] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-2xl"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-6">
              {t('moodTracker.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#AAB9C3] max-w-4xl mx-auto leading-relaxed mb-8">
              {t('moodTracker.subtitle')}
            </p><div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#6DAEDB]/10 to-[#4F91C3]/10 px-4 py-2 rounded-full border border-[#6DAEDB]/20">
                <TrendingUp size={16} className="text-[#6DAEDB]" />
                <span className="text-[#E0ECF1]">Acompanhe sua jornada emocional</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#4F91C3]/10 to-[#6DAEDB]/10 px-4 py-2 rounded-full border border-[#4F91C3]/20">
                <HeartHandshake size={16} className="text-[#4F91C3]" />
                <span className="text-[#E0ECF1]">Registros diários de humor</span>
              </div>
            </div>
          </motion.div><motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#6DAEDB]/20 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-8 flex items-center justify-center gap-3">
                <SmilePlus size={32} className="text-[#6DAEDB]" />
                Como você está se sentindo hoje?
              </h2>
              <div className="space-y-8 overflow-visible"><div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10 overflow-visible pb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center text-black font-bold text-sm">
                      1
                    </span>
                    <label className="text-xl font-semibold text-white">
                      {t('moodTracker.howDoYouFeel')}
                    </label>
                  </div>
                  <MoodSelect
                    value={mood}
                    onChange={setMood}
                    options={moodOptions}
                    placeholder={t('moodTracker.select')}
                  />
                </div><AnimatePresence>
                  {mood && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center text-black font-bold text-sm">
                          2
                        </span>
                        <label className="text-xl font-semibold text-white">
                          {t('moodTracker.intensity')}:{' '}
                          <span className="text-[#6DAEDB] text-2xl font-bold">{intensity}</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={intensity}
                        onChange={e => setIntensity(+e.target.value)}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence><AnimatePresence>
                  {mood && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center text-black font-bold text-sm">
                          3
                        </span>
                        <label className="text-xl font-semibold text-white">
                          Notas adicionais (opcional)
                        </label>
                      </div>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder={t('moodTracker.notePlaceholder')}
                        className="w-full h-32 bg-gray-900/80 border border-[#6DAEDB]/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence><AnimatePresence>
                  {mood && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.3 }}
                    >
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-70"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t('moodTracker.saving')}
                          </div>
                        ) : (
                          t('moodTracker.save')
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>{data.length > 0 && (
            <motion.div
              ref={chartRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#6DAEDB]/20 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-8 flex items-center justify-center gap-3">
                  <ChartIcon size={32} className="text-[#6DAEDB]" />
                  {t('moodTracker.historyTitle')}
                </h2>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10">
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <XAxis
                          dataKey="createdAt"
                          tick={{ fontSize: 12, fill: '#AAB9C3' }}
                          tickFormatter={d => d.replaceAll('/', '-')}
                        />
                        <YAxis
                          domain={[1, 5]}
                          tick={{ fontSize: 12, fill: '#AAB9C3' }}
                          tickCount={5}
                        />
                        <CartesianGrid stroke="#2a3b47" strokeDasharray="3 3" />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const entry = payload[0].payload;
                              const iconMap: Record<string, JSX.Element> = {
                                feliz: <Smile className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                                triste: <Frown className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                                ansioso: (
                                  <AlertTriangle className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />
                                ),
                                calmo: <Feather className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                                irritado: <Flame className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                                cansado: (
                                  <BatteryLow className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />
                                ),
                                motivado: <Bolt className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                                estressado: <Zap className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                              };
                              const moodKeyMap = {
                                feliz: 'happy',
                                triste: 'sad',
                                ansioso: 'anxious',
                                calmo: 'calm',
                                irritado: 'angry',
                                cansado: 'tired',
                                motivado: 'motivated',
                                estressado: 'stressed',
                              } as const;
                              const icon = iconMap[entry.mood];
                              const moodKey =
                                moodKeyMap[entry.mood as keyof typeof moodKeyMap] || entry.mood;
                              const moodLabel = t(`moodTracker.moods.${moodKey}`);

                              return (
                                <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl text-sm border border-[#6DAEDB]/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    {icon}
                                    <strong className="text-[#6DAEDB]">{moodLabel}</strong>
                                  </div>
                                  <div className="text-[#AAB9C3]">
                                    {t('moodTracker.intensity')}:{' '}
                                    <span className="text-white font-semibold">
                                      {entry.intensity}
                                    </span>
                                  </div>
                                  <div className="text-[#AAB9C3] text-xs mt-1">{label}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="intensity"
                          stroke="#6DAEDB"
                          strokeWidth={3}
                          dot={{ stroke: '#6DAEDB', strokeWidth: 3, r: 6, fill: '#4F91C3' }}
                          activeDot={{ r: 8, stroke: '#6DAEDB', strokeWidth: 3, fill: '#6DAEDB' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer /><style
        dangerouslySetInnerHTML={{
          __html: `
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            background: linear-gradient(45deg, #6DAEDB, #4F91C3);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(109, 174, 219, 0.6);
          }
          .slider-thumb::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: linear-gradient(45deg, #6DAEDB, #4F91C3);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 15px rgba(109, 174, 219, 0.6);
          }
        `,
        }}
      />
    </div>
  );
};

export default MoodTracker;