import { Routes, Route } from 'react-router-dom';
import SerenaChat from './pages/SerenaChat';
import Home from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<SerenaChat />} />
    </Routes>
  );
};

export default App;
