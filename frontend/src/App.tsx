import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TableProvider } from './contexts/TableContext';
import MenuPage from './pages/MenuPage';
import KitchenPanel from './pages/KitchenPanel';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <TableProvider>
        <Routes>
          <Route path="/m/:restaurantId/:tableId" element={<MenuPage />} />
          <Route path="/kitchen" element={<KitchenPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">MetrIA</h1>
                <p className="text-gray-600 mb-8">Sistema de Cardápio Digital com IA</p>
                <div className="space-x-4">
                  <a href="/admin" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                    Painel Admin
                  </a>
                  <a href="/kitchen" className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
                    Painel Cozinha
                  </a>
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
