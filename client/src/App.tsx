import { Routes, Route } from 'react-router-dom';
import SerenaChat from './pages/SerenaChat';
import Home from './pages/Home';
import PlansPage from './pages/PlansPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/Terms';
import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<SerenaChat />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/termos" element={<TermsPage />} />
      <Route path="/sobre" element={<AboutPage />} />
    </Routes>
  );
};

export default App;
