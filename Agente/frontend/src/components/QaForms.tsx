import { useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaSyncAlt } from "react-icons/fa";

type Props = {
  onAdd: () => void;
};

export default function QaForm({ onAdd }: Props) {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);

  // Backend principal (Python)
  const apiUrl = import.meta.env.VITE_API_URL || "https://agente-de-ia-production-8869.up.railway.app";
  // URL do seu bot Node.js (ajuste se for diferente)
  const botUrl = import.meta.env.VITE_BOT_API_URL || "https://SEU-BOT-NODE/api/reload";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    setMsgType("");
    const resp = await fetch(`${apiUrl}/qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta, resposta }),
    });
    setLoading(false);
    if (resp.ok) {
      setMsg("Cadastrado com sucesso!");
      setMsgType("success");
      setPergunta("");
      setResposta("");
      onAdd();
    } else {
      const data = await resp.json();
      setMsg(data.detail || "Erro ao cadastrar.");
      setMsgType("error");
    }
    setTimeout(() => setMsg(""), 3000); // Limpa mensagem após 3s
  };

  // Função para treinar agente manualmente
  const handleReload = async () => {
    setReloading(true);
    setMsg("");
    setMsgType("");
    try {
      // Faz POST nos dois endpoints
      await fetch(`${apiUrl}/reload`, { method: "POST" });
      await fetch(botUrl, { method: "POST" });
      setMsg("Agente treinado com sucesso!");
      setMsgType("success");
    } catch {
      setMsg("Erro ao treinar agente.");
      setMsgType("error");
    }
    setReloading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-8 hover-lift">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-[#1790A7] to-[#1790A7]/60 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900">Adicionar Pergunta e Resposta</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Pergunta
            </label>
            <input
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-[#1790A7] focus:bg-white focus:outline-none transition-all duration-300 hover:border-gray-300"
              placeholder="Ex: Qual o horário de funcionamento?"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              required
              disabled={loading}
              maxLength={140}
            />
            <div className="text-xs text-gray-500">
              {pergunta.length}/140 caracteres
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Resposta
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-[#1790A7] focus:bg-white focus:outline-none transition-all duration-300 hover:border-gray-300 resize-none h-20"
              placeholder="Ex: Segunda a sexta, 8h às 18h"
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              required
              disabled={loading}
              maxLength={500}
            />
            <div className="text-xs text-gray-500">
              {resposta.length}/500 caracteres
            </div>
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === "success" 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          } animate-fade-in`}>
            <div className={`flex-shrink-0 w-5 h-5 ${
              msgType === "success" ? "text-green-500" : "text-red-500"
            }`}>
              {msgType === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <span className="font-medium">{msg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={!pergunta.trim() || !resposta.trim() || loading}
            className="flex-1 bg-gradient-to-r from-[#1790A7] to-[#1790A7]/80 text-white rounded-xl py-3 px-6 font-semibold hover:from-[#1790A7]/90 hover:to-[#1790A7]/70 focus:outline-none focus:ring-4 focus:ring-[#1790A7]/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Adicionando...</span>
              </>
            ) : (
              <span>Adicionar Pergunta</span>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReload}
            disabled={reloading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl py-3 px-6 font-semibold hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {reloading ? (
              <>
                <FaSyncAlt className="animate-spin" />
                <span>Treinando...</span>
              </>
            ) : (
              <>
                <FaSyncAlt />
                <span>Treinar Agente</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
