import { useState, useEffect } from "react";

export default function PromptConfig() {
  const [prompt, setPrompt] = useState("");
  const [novoPrompt, setNovoPrompt] = useState("");
  const [msg, setMsg] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "https://adequate-cooperation-production.up.railway.app";

  // Carregar prompt atual
  useEffect(() => {
    fetch(`${apiUrl}/api/prompt`)
      .then(res => res.json())
      .then(data => {
        setPrompt(data.prompt);
        setNovoPrompt(data.prompt);
      });
  }, []);

  // Salvar novo prompt
  const salvar = async () => {
    setMsg("");
    const resp = await fetch(`${apiUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: novoPrompt })
    });
    if (resp.ok) {
      setPrompt(novoPrompt);
      setMsg("Prompt salvo com sucesso!");
    } else {
      setMsg("Erro ao salvar prompt.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Prompt do Assistente</h2>
      <label className="block mb-2 font-semibold text-blue-900">
        Edite abaixo o prompt padrão do assistente:
      </label>
      <textarea
        className="w-full border rounded p-3 mb-4 h-32"
        value={novoPrompt}
        onChange={e => setNovoPrompt(e.target.value)}
      />
      <button
        className="bg-blue-700 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition"
        onClick={salvar}
        disabled={!novoPrompt.trim()}
      >
        Salvar
      </button>
      {msg && <div className="mt-4 text-green-700 font-semibold">{msg}</div>}
      <div className="mt-8 text-sm text-gray-600">
        Prompt atual: <span className="font-mono">{prompt}</span>
      </div>
    </div>
  );
}
