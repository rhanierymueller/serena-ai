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
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';
import { getUser } from '../services/userSession';
import { BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import MoodSelect from '../components/MoodSelect';

interface MoodEntry {
  mood: string;
  intensity: number;
  note?: string;
  createdAt: string;
}

const MoodTracker: React.FC = () => {
  const { t } = useI18n();
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
    const u = getUser();
    setUser(u);

    if (u?.id) {
      fetch(`${BASE_URL}/api/mood/${u.id}`)
        .then(res => res.json())
        .then(entries => {
          const parsed = entries.map((entry: MoodEntry) => ({
            ...entry,
            createdAt: new Date(entry.createdAt).toLocaleDateString(),
          }));
          setData(parsed);
        });
    }
  }, []);

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
        createdAt: new Date(entry.createdAt).toLocaleDateString(),
      }));
      setData(parsed);

      setMood('');
      setIntensity(3);
      setNote('');
      showToast('✅ Entrada registrada com sucesso!', 'success');
      chartRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar entrada 😢', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout backTo="/">
      <div className="px-6 py-10 text-white max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-[#6DAEDB] flex items-center gap-2">
          <HeartHandshake className="w-7 h-7" />
          {t('moodTracker.title')}
        </h1>
        <p className="text-[#AAB9C3] mb-6">{t('moodTracker.subtitle')}</p>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a3b47] space-y-4 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SmilePlus className="text-[#6DAEDB] w-4 h-4" />
              <label className="text-sm font-semibold text-[#AAB9C3]">
                {t('moodTracker.howDoYouFeel')}
              </label>
            </div>
            <MoodSelect
              value={mood}
              onChange={setMood}
              options={moodOptions}
              placeholder={t('moodTracker.select')}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="text-[#6DAEDB] w-4 h-4" />
              <label className="text-sm font-semibold text-[#AAB9C3]">
                {t('moodTracker.intensity')}: {intensity}
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={e => setIntensity(+e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('moodTracker.notePlaceholder')}
              className="w-full h-24 bg-[#111] text-white border border-[#2a3b47] rounded-lg p-2"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-bold py-2 px-4 rounded-xl transition w-full"
          >
            {loading ? t('moodTracker.saving') : t('moodTracker.save')}
          </button>
        </div>

        {user?.plan === 'pro' && data.length > 0 && (
          <div ref={chartRef} className="mt-10">
            <h2 className="text-xl font-bold text-[#6DAEDB] mb-4 flex items-center gap-2">
              <ChartIcon className="w-5 h-5" />
              {t('moodTracker.historyTitle')}
            </h2>
            <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#2a3b47] shadow">
              <LineChart width={500} height={250} data={data}>
                <XAxis
                  dataKey="createdAt"
                  tick={{ fontSize: 12, fill: '#AAB9C3' }}
                  tickFormatter={d => d.replaceAll('/', '-')}
                />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12, fill: '#AAB9C3' }} tickCount={5} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const entry = payload[0].payload;

                      const iconMap: Record<string, JSX.Element> = {
                        feliz: <Smile className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        triste: <Frown className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        ansioso: <AlertTriangle className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        calmo: <Feather className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        irritado: <Flame className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        cansado: <BatteryLow className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        motivado: <Bolt className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                        estressado: <Zap className="w-4 h-4 inline mr-1 text-[#6DAEDB]" />,
                      };

                      const moodKeyMap: Record<
                        | 'feliz'
                        | 'triste'
                        | 'ansioso'
                        | 'calmo'
                        | 'irritado'
                        | 'cansado'
                        | 'motivado'
                        | 'estressado',
                        string
                      > = {
                        feliz: 'happy',
                        triste: 'sad',
                        ansioso: 'anxious',
                        calmo: 'calm',
                        irritado: 'angry',
                        cansado: 'tired',
                        motivado: 'motivated',
                        estressado: 'stressed',
                      };

                      const icon = iconMap[entry.mood];
                      const moodKey =
                        moodKeyMap[entry.mood as keyof typeof moodKeyMap] || entry.mood;
                      const moodLabel = t(`moodTracker.moods.${moodKey}`);

                      return (
                        <div className="bg-[#1f2d36] text-white p-3 rounded-lg shadow-lg text-sm border border-[#2a3b47]">
                          <div className="flex items-center gap-2">
                            {icon}
                            <strong>{moodLabel}</strong>
                          </div>
                          <div>
                            {t('moodTracker.intensity')}: {entry.intensity}
                          </div>
                          <div>{label}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <CartesianGrid stroke="#2a3b47" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="#6DAEDB"
                  strokeWidth={2.5}
                  dot={{ stroke: '#6DAEDB', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MoodTracker;
