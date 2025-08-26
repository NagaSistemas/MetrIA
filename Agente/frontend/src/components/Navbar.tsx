import { useState } from "react";
import { FaUserCircle, FaWhatsapp, FaEdit, FaBars, FaComments, FaSignOutAlt } from "react-icons/fa";

type TabKey = "whatsapp" | "prompt" | "agente";

type Props = {
  onLogout: () => void;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function Navbar({ onLogout, tab, onTabChange }: Props) {
  const [open, setOpen] = useState(false);
  const [menuMobile, setMenuMobile] = useState(false);

  const menus = [
    { key: "prompt", label: "Prompt do Assistente", icon: <FaEdit />, description: "Configurar comportamento" },
    { key: "whatsapp", label: "Configurar WhatsApp", icon: <FaWhatsapp />, description: "Integração WhatsApp" },
    { key: "agente", label: "Teste do Agente", icon: <FaComments />, description: "Testar conversações" },
  ];

  return (
    <>
      {/* Botão Hamburguer: apenas mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-[#1790A7] to-[#1790A7]/80 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        onClick={() => setMenuMobile(true)}
        aria-label="Abrir menu"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#000000] shadow-2xl z-40
        flex flex-col
        transition-all duration-300 ease-in-out
        ${menuMobile ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
        border-r border-[#1790A7]/20
      `}>
        {/* Logo e Título */}
        <div className="flex items-center gap-4 px-6 pt-8 pb-6 border-b border-[#1790A7]/30">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg overflow-hidden">
            <img src="/Naga.png" alt="Naga IA" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Naga IA</h1>
            <p className="text-[#1790A7]/80 text-sm font-medium">Painel Admin</p>
          </div>
        </div>

        {/* Menu Principal */}
        <div className="flex-1 flex flex-col justify-between">
          <nav className="flex flex-col px-4 py-6 space-y-2">
            {menus.map((item, index) => (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange(item.key as TabKey);
                  setMenuMobile(false);
                }}
                className={`group flex items-center gap-4 w-full px-4 py-4 rounded-xl text-left font-medium transition-all duration-300 transform hover:scale-[1.02] animate-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                  tab === item.key
                    ? "bg-[#1790A7] text-white shadow-lg"
                    : "bg-white/10 text-[#1790A7] group-hover:bg-[#1790A7]/20 group-hover:text-white"
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold transition-colors duration-300 ${
                    tab === item.key ? "text-white" : "text-white/90 group-hover:text-white"
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${
                    tab === item.key ? "text-white/70" : "text-white/50 group-hover:text-white/70"
                  }`}>
                    {item.description}
                  </div>
                </div>
                {tab === item.key && (
                  <div className="w-1 h-8 bg-[#1790A7] rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Usuário */}
          <div className="px-4 py-6 border-t border-[#1790A7]/30">
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                aria-label="Menu usuário"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#1790A7] to-[#1790A7]/80 rounded-full">
                  <FaUserCircle className="text-white text-lg" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">Administrador</div>
                  <div className="text-white/60 text-sm">Online</div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </button>
              
              {open && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-[#1790A7]/20 animate-fade-in-up overflow-hidden">
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-[#1790A7]/10 transition-all duration-200 flex items-center gap-3 text-gray-800 font-medium"
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                  >
                    <FaSignOutAlt className="text-[#1790A7]" />
                    Sair do Sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
          .animate-slide-in { animation: slide-in 0.4s ease-out both; }
        `}</style>
      </aside>

      {/* Overlay para fechar o menu mobile */}
      {menuMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setMenuMobile(false)}
        />
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </>
  );
}