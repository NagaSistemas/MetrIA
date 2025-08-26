from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from qa_engine import setup_engine, answer_with_context
from qa_crud import router as qa_router
import uvicorn
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Middleware (sempre antes das rotas)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "https://lightgrey-lyrebird-872902.hostingersite.com",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar as rotas de CRUD
app.include_router(qa_router)

# Carrega os dados do CSV
qa_data = setup_engine()

def reload_engine():
    global qa_data, sessions, conversation_history
    qa_data = setup_engine()
    sessions.clear()  # Limpar sessões ao recarregar
    conversation_history.clear()  # Limpar históricos

def log_pergunta_sem_resposta(pergunta, resposta):
    import csv, os
    from datetime import datetime
    log_path = "data/perguntas_sem_resposta.csv"
    existe = os.path.exists(log_path)
    with open(log_path, "a", newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        if not existe:
            writer.writerow(["data_hora", "pergunta", "resposta"])
        writer.writerow([datetime.now().isoformat(), pergunta, resposta])

from typing import Optional

# Pydantic model para a pergunta
class Query(BaseModel):
    pergunta: str
    session_id: Optional[str] = None

# Rota raiz para healthcheck
@app.get("/")
def root():
    return {"status": "ok", "message": "Naga IA Backend funcionando"}

# Sistema de sessões para controlar primeira mensagem e histórico
sessions = set()
conversation_history = {}

# Endpoint inteligente
@app.post("/ask")
def ask(query: Query):
    try:
        # Gerar session_id se não fornecido ou vazio
        if not query.session_id or query.session_id == "":
            import uuid
            query.session_id = str(uuid.uuid4())
        
        # Verificar se é primeira mensagem da sessão
        primeira_mensagem = query.session_id not in sessions
        
        # Inicializar histórico se for nova sessão
        if query.session_id not in conversation_history:
            conversation_history[query.session_id] = []
        
        # Adicionar sessão ao conjunto
        sessions.add(query.session_id)
        
        # Obter histórico da conversa
        historico = conversation_history[query.session_id]
        
        resposta_obj = answer_with_context(qa_data, query.pergunta, primeira_mensagem, historico)
        resposta = str(resposta_obj.text) if hasattr(resposta_obj, "text") else str(resposta_obj)
        
        # Adicionar pergunta e resposta ao histórico
        conversation_history[query.session_id].append(f"Cliente: {query.pergunta}")
        conversation_history[query.session_id].append(f"Atendente: {resposta}")
        
        # Limitar histórico a últimas 10 mensagens
        if len(conversation_history[query.session_id]) > 10:
            conversation_history[query.session_id] = conversation_history[query.session_id][-10:]
        
        return {"resposta": resposta, "session_id": query.session_id}
    except Exception as e:
        return {"resposta": f"Desculpe, não consegui processar sua pergunta no momento. Erro: {str(e)[:100]}"}



# ========== ENDPOINTS PARA PROMPT PERSONALIZADO ==========
@app.get("/api/prompt")
def get_prompt():
    try:
        with open("data/prompt.txt", "r", encoding="utf-8") as f:
            prompt = f.read().strip()
    except:
        prompt = "Você é um assistente virtual prestativo. Responda de forma clara e útil."
    return {"prompt": prompt}

@app.post("/api/prompt")
def save_prompt(data: dict):
    try:
        with open("data/prompt.txt", "w", encoding="utf-8") as f:
            f.write(data["prompt"])
        return {"ok": True}
    except:
        return {"ok": False}

# ========== NOVO ENDPOINT PARA RELOAD MANUAL ==========
@app.post("/reload")
def reload():
    reload_engine()
    return {"ok": True}

# (Opcional) Servir frontend localmente. Em produção, não precisa!
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
