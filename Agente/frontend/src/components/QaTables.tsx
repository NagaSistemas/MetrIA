import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

type Qa = { pergunta: string; resposta: string };

type Props = {
  token: string;
};

export default function QaTable({ }: Props) {
  const [qas, setQas] = useState<Qa[]>([]);
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "https://agente-de-ia-production-8869.up.railway.app";

  const fetchQas = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${apiUrl}/qa`);
      const data = await resp.json();
      setQas(data);
    } catch {
      setMsg("Erro ao carregar dados.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQas();
  }, []);

  const handleDelete = async (idx: number) => {
    if (!confirm("Deseja mesmo excluir?")) return;
    setLoading(true);
    const resp = await fetch(`${apiUrl}/qa/${idx}`, { method: "DELETE" });
    setLoading(false);
    if (resp.ok) {
      setMsg("Pergunta removida!");
      fetchQas();
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("Erro ao remover.");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const filteredQas = qas.filter((qa) =>
    qa.pergunta.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-4 font-extrabold text-blue-800">Perguntas e Respostas</h1>
      <input
        className="border p-2 rounded mb-4 w-full md:w-1/2 focus:ring-2 focus:ring-blue-300"
        placeholder="Buscar pergunta"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      {msg && (
        <div className="flex items-center gap-2 text-green-600 my-2 font-semibold transition-all">
          {msg}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border mt-4 rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="p-3 text-left">Pergunta</th>
                <th className="p-3 text-left">Resposta</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredQas.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    Nenhuma pergunta encontrada.
                  </td>
                </tr>
              )}
              {filteredQas.map((qa, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 text-gray-900">{qa.pergunta}</td>
                  <td className="p-3 text-gray-900">{qa.resposta}</td>
                  <td className="p-3 text-right">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white rounded-full p-2 transition focus:outline-none"
                      title="Excluir"
                      aria-label="Excluir"
                      onClick={() => handleDelete(i)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
