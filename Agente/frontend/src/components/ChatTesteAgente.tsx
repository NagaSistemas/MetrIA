import { useState, useRef, useEffect } from "react";

type Mensagem = {
  autor: "user" | "bot";
  texto: string;
};

export default function ChatTesteAgente() {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll automático ao adicionar novas mensagens
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [historico]);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    // Debug
    console.log("Enviando mensagem:", mensagem);

    // Adiciona a mensagem do usuário no histórico
    setHistorico((h) => [...h, { autor: "user", texto: mensagem }]);
    setMensagem("");
    setErro(null);

    try {
      const res = await fetch("https://agente-de-ia-production-8869.up.railway.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pergunta: mensagem,
          session_id: sessionId || "" 
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("Resposta recebida:", data);

      // Salvar session_id se for a primeira mensagem
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      // Extrair o texto da resposta corretamente
      let respostaTexto = data.resposta;
      if (typeof respostaTexto === 'object' && respostaTexto !== null) {
        respostaTexto = respostaTexto.text || JSON.stringify(respostaTexto);
      }
      
      if (!respostaTexto) {
        throw new Error("Resposta vazia do servidor");
      }

      setHistorico((h) => [...h, { autor: "bot", texto: String(respostaTexto) }]);
    } catch (e: any) {
      console.error("Erro ao enviar mensagem:", e);
      setErro(e.message);
      setHistorico((h) => [
        ...h,
        { autor: "bot", texto: "Erro ao conectar com o servidor." },
      ]);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Teste do Agente de IA</h2>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto bg-gray-100 p-3 rounded-lg border border-gray-300"
      >
        {historico.length === 0 && (
          <p className="text-gray-500">Nenhuma mensagem ainda.</p>
        )}
        {historico.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              msg.autor === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                msg.autor === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.texto}
            </div>
          </div>
        ))}
        {erro && <div className="text-red-600 mt-2">Erro: {erro}</div>}
      </div>

      <div className="mt-3 flex">
        <input
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
          className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={enviarMensagem}
          className="bg-blue-600 text-white px-5 rounded-r-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
