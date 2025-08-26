
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TableProvider } from './contexts/TableContext';
import TableSessionPage from './pages/TableSessionPage';
import MenuPage from './pages/MenuPage';
import KitchenPanel from './pages/KitchenPanel';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <TableProvider>
        <Routes>
          <Route path="/m/:restaurantId/:tableId" element={<TableSessionPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/kitchen" element={<KitchenPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={
            <div className="min-h-screen bg-metria-black flex items-center justify-center">
              <div className="text-center">
                <h1 className="logo-metria text-6xl mb-4">MetrIA</h1>
                <p className="text-xl text-metria-white/70 mb-8">O maître digital que atende com inteligência e elegância</p>
                <div className="space-y-4">
                  <div>
                    <a href="/admin" className="btn-gold mr-4">Painel Admin</a>
                    <a href="/kitchen" className="btn-gold">Painel Cozinha</a>
                  </div>
                  <p className="text-sm text-metria-white/50">Escaneie o QR Code da mesa para acessar o cardápio</p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </TableProvider>
    </Router>
  );
}

export default App;
