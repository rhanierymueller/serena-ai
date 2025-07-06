import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { I18nProvider } from './i18n/I18nContext';
import { UserProvider } from './context/UserContext';
import { PageLayout } from './components';
import {
  Home,
  AboutPage,
  Contact,
  AvyliaChat,
  MoodTracker,
  BreathingPage,
  ReframeExpressPage,
  MotivationalSpin,
  ProfessionalArea,
  ProfilePage,
  PlansPage,
  PrivacyPage,
  Terms,
  ActivateAccount,
  ResetPassword,
} from './pages';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<AvyliaChat />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/privacidade" element={<PrivacyPage />} />
      <Route path="/sobre" element={<AboutPage />} />
      <Route path="/mood-tracker" element={<MoodTracker />} />
      <Route path="/respiracao" element={<BreathingPage />} />
      <Route path="/motivacional" element={<MotivationalSpin />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/activate/:token" element={<ActivateAccount />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profissional" element={<ProfessionalArea />} />
      <Route path="/reframe" element={<ReframeExpressPage />} />
    </Routes>
  );
};

export default App;