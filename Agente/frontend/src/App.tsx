import { useState } from "react";
import Login from "./components/Login";

import Navbar from "./components/Navbar";
import WhatsappConfig from "./components/WhatsappConfig";
import PromptConfig from "./components/PromptConfig";
import ChatTesteAgente from "./components/ChatTesteAgente";
import "./App.css";

// TabKey para as abas disponíveis
type TabKey = "whatsapp" | "prompt" | "agente";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tab, setTab] = useState<TabKey>("prompt");

  const handleLogin = (tk: string) => {
    setToken(tk);
    localStorage.setItem("token", tk);
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const getTabTitle = () => {
    switch (tab) {
      case "whatsapp": return "Configurar WhatsApp";
      case "prompt": return "Prompt do Assistente";
      case "agente": return "Teste do Agente";
      default: return "Painel";
    }
  };

  const getTabDescription = () => {
    switch (tab) {
      case "whatsapp": return "Configure a integração com WhatsApp";
      case "prompt": return "Defina o comportamento e personalidade do assistente";
      case "agente": return "Teste as conversações do seu bot";
      default: return "Bem-vindo ao painel administrativo";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navbar lateral */}
      <Navbar onLogout={handleLogout} tab={tab} onTabChange={setTab} />
      
      {/* Conteúdo principal */}
      <main className="md:ml-72 py-6 px-4 min-h-screen">
        {/* Header da página */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1790A7] to-[#1790A7]/60 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">{getTabTitle()}</h1>
          </div>
          <p className="text-gray-600 ml-8">{getTabDescription()}</p>
        </div>

        {/* Container do conteúdo */}
        <div className="flex-1 animate-slide-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 md:p-8 min-h-[600px] transition-all duration-300 hover:shadow-2xl">
            {tab === "whatsapp" && <WhatsappConfig />}
            {tab === "prompt" && <PromptConfig />}
            {tab === "agente" && <ChatTesteAgente />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in-delay">
          <p className="text-gray-500 text-sm">
            Naga IA v1.0 - Desenvolvido com ❤️ para automatizar suas conversações
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out 0.2s both; }
        .animate-fade-in-delay { animation: fade-in-delay 1s ease-out 0.4s both; }
      `}</style>
    </div>
  );
}

export default App;
