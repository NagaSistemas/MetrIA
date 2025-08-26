import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = { onLogin: (token: string) => void };

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simula delay e validação fake para MVP
    await new Promise((res) => setTimeout(res, 600));

    // Troque por sua regra/API real!
    if (email === "nagaia@admin.com" && password === "nagaia@2025") {
      onLogin("token-fake");
    } else {
      setError("E-mail ou senha incorretos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1790A7] via-[#1790A7]/90 to-[#000000] p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4 animate-bounce-slow overflow-hidden">
            <img src="/Naga.png" alt="Naga IA" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Naga IA
          </h1>
          <p className="text-white/80 text-lg">
            Painel Administrativo
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 animate-slide-up"
        >
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-[#1790A7] focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                placeholder="Digite seu e-mail"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-[#1790A7] focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1790A7] transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1790A7] to-[#1790A7]/80 text-white rounded-xl py-4 px-6 font-semibold text-lg hover:from-[#1790A7]/90 hover:to-[#1790A7]/70 focus:outline-none focus:ring-4 focus:ring-[#1790A7]/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar no Painel</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-delay">
          <p className="text-white/60 text-sm">
            © 2025 Naga IA - Todos os direitos reservados
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in-delay { animation: fade-in-delay 1s ease-out 0.4s both; }
      `}</style>
    </div>
  );
}
