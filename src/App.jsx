import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ConferenciaForm from './components/ConferenciaForm';
import ConferenciasList from './components/ConferenciasList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard onNovaConferencia={() => window.location.href = '/nova'} />} />
          <Route path="nova" element={<ConferenciaForm onSuccess={() => window.location.href = '/'} />} />
          <Route path="conferencias" element={<ConferenciasList titulo="Todas as Conferências" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
