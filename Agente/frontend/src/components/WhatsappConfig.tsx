import { useEffect, useState } from "react";
import { FaCheckCircle, FaQrcode, FaPlug, FaUnlink } from "react-icons/fa";

type Status = "loading" | "connected" | "disconnected" | "connecting";

export default function WhatsappConfig() {
  const [status, setStatus] = useState<Status>("loading");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [showQr, setShowQr] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "https://adequate-cooperation-production.up.railway.app";

  // Checa status do WhatsApp
  const checkStatus = async () => {
    setStatus("loading");
    setQrCode(null);
    try {
      const resp = await fetch(`${apiUrl}/api/whatsapp/status`);
      const data = await resp.json();
      setStatus(data.connected ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    }
  };

  useEffect(() => {
    checkStatus();
    // Polling para atualizar status (mais frequente quando conectando)
    const interval = setInterval(checkStatus, status === "connecting" ? 3000 : 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Buscar QR code e exibir modal
  const connectWhatsapp = async () => {
    setShowQr(true);
    setStatus("connecting");
    setMsg("");
    
    // Polling para buscar QR code
    const fetchQrCode = async () => {
      try {
        const resp = await fetch(`${apiUrl}/api/whatsapp/qrcode`);
        if (resp.ok) {
          const data = await resp.json();
          setQrCode(data.qrCode);
          return true;
        } else {
          return false;
        }
      } catch {
        return false;
      }
    };
    
    // Tenta buscar QR code imediatamente
    const success = await fetchQrCode();
    if (!success) {
      setMsg("Gerando QR Code, aguarde...");
      
      // Polling a cada 2 segundos por até 30 segundos
      let attempts = 0;
      const maxAttempts = 15;
      
      const interval = setInterval(async () => {
        attempts++;
        const success = await fetchQrCode();
        
        if (success) {
          clearInterval(interval);
          setMsg("");
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setMsg("Timeout: QR Code não foi gerado. Tente novamente.");
          setQrCode(null);
        }
      }, 2000);
    }
  };

  // Desconectar WhatsApp
  const disconnect = async () => {
    setMsg("");
    setStatus("loading");
    const resp = await fetch(`${apiUrl}/api/whatsapp/logout`, { method: "POST" });
    if (resp.ok) {
      setMsg("Desconectado com sucesso.");
      setStatus("disconnected");
      setQrCode(null);
      setShowQr(false);
    } else {
      setMsg("Erro ao desconectar.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold mb-2 text-blue-900">Integração WhatsApp</h2>
      <div className="flex items-center gap-2 mb-2">
        {status === "connected" && <FaCheckCircle className="text-green-600" />}
        {status === "connecting" && <FaQrcode className="text-yellow-500 animate-pulse" />}
        {status === "disconnected" && <FaUnlink className="text-red-600" />}
        <span className={`font-semibold text-lg ${status === "connected" ? "text-green-700" : "text-red-700"}`}>
          {status === "connected" ? "Conectado" : status === "connecting" ? "Aguardando conexão..." : "Desconectado"}
        </span>
      </div>

      {status === "connected" && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition"
          onClick={disconnect}
        >
          <FaUnlink /> Desconectar WhatsApp
        </button>
      )}

      {(status === "disconnected" || status === "loading") && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition"
          onClick={connectWhatsapp}
        >
          <FaPlug /> Conectar WhatsApp
        </button>
      )}

      {/* QR Code modal/box */}
      {showQr && qrCode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-3 relative">
            <button
              className="absolute top-2 right-3 text-xl text-gray-400 hover:text-red-600"
              onClick={() => setShowQr(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <FaQrcode className="text-4xl text-blue-700 mb-2" />
            <p className="mb-2 text-center text-blue-900 font-semibold">
              Escaneie o QR Code abaixo com o WhatsApp para conectar:
            </p>
            <img
              src={qrCode}
              alt="QR Code do WhatsApp"
              className="my-2 border rounded-xl shadow-md w-56 h-56 object-contain"
            />
            <span className="text-sm text-gray-600 text-center">
              Abra o WhatsApp &gt; Menu &gt; Aparelhos conectados &gt; Conectar um aparelho
            </span>
          </div>
        </div>
      )}

      {msg && <div className="text-blue-800 font-semibold text-center">{msg}</div>}
    </div>
  );
}
