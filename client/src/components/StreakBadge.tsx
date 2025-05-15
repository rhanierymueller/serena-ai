import React, { useEffect, useState } from 'react';
import { getUser } from '../services/userSession';
import { BASE_URL } from '../config';
import { Flame } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useUser } from '../context/UserContext';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(date1: string, date2: string) {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor((d1 - d2) / 86400000);
}

export default function StreakBadge() {
  const [streak, setStreak] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useI18n();
  const { user } = useUser();

  useEffect(() => {
    const today = getTodayStr();

    if (user?.id) {
      fetch(`${BASE_URL}/api/users/${user.id}/streak`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          let streakCount = data.streakCount || 1;
          let lastDayStr = data.streakLastDay ? data.streakLastDay.slice(0, 10) : null;
          if (lastDayStr !== today) {
            fetch(`${BASE_URL}/api/users/${user.id}/streak`, {
              method: 'POST',
              credentials: 'include',
            })
              .then(res => res.json())
              .then(data2 => setStreak(data2.streakCount || 1));
          } else {
            setStreak(streakCount);
          }
        })
        .catch(() => setStreak(1));
    } else {
      setStreak(1);
    }
  }, [user]);

  if (!user?.id) return null;

  return (
    <span
      className="flex items-center gap-1 ml-2 px-2 py-1 rounded-lg bg-transparent text-[#6DAEDB] font-semibold text-sm relative select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={-1}
    >
      <Flame size={16} className="text-[#6DAEDB]" />
      {streak}d
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 whitespace-nowrap">
          {streak === 1
            ? t('onboarding.streak_first_day')
            : t('onboarding.streak_n_days', { count: streak })}
        </div>
      )}
    </span>
  );
}
