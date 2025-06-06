import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlansPage from './pages/PlansPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/Terms';
import AboutPage from './pages/AboutPage';
import MoodTracker from './pages/MoodTracker';
import BreathingPage from './pages/BreathingPage';
import MotivationalSpin from './pages/MotivationalSpin';
import Contact from './pages/Contact';
import AvyliaChat from './pages/AvyliaChat';
import PrivacyPage from './pages/PrivacyPage';
import ActivateAccount from './pages/ActivateAccount';
import ResetPassword from './pages/ResetPassword';
import ProfessionalArea from './pages/ProfessionalArea';
import ReframeExpressPage from './pages/ReframeExpressPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<AvyliaChat />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/termos" element={<TermsPage />} />
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
