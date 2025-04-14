import { Routes, Route } from 'react-router-dom';
import SerenaChat from './pages/SerenaChat';
import Home from './pages/Home';
import PlansPage from './pages/modals/PlansPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<SerenaChat />} />
      <Route path="/planos" element={<PlansPage />} />
    </Routes>
  );
};

export default App;
