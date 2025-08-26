import os
import requests
from dotenv import load_dotenv
import pandas as pd
from loader import load_qa_from_csv

load_dotenv()

# DeepSeek API
deepseek_key = os.getenv("DEEPSEEK_API_KEY", "sk-94b3a551443148f59500c0644ec2e5f0")

def setup_engine():
    # Carrega dados do CSV
    qa_data = load_qa_from_csv("data/base.csv")
    return qa_data

def answer_with_context(qa_data, pergunta, primeira_mensagem=False, historico=[]):
    # Obter horário de Brasília
    from datetime import datetime
    import pytz
    
    brasilia_tz = pytz.timezone('America/Sao_Paulo')
    agora = datetime.now(brasilia_tz)
    hora = agora.hour
    
    if 5 <= hora < 12:
        saudacao = "Bom dia"
    elif 12 <= hora < 18:
        saudacao = "Boa tarde"
    else:
        saudacao = "Boa noite"
    
    # Carregar prompt personalizado
    try:
        with open("data/prompt.txt", "r", encoding="utf-8") as f:
            prompt_personalizado = f.read().strip()
    except:
        prompt_personalizado = "Você é um assistente virtual prestativo."
    
    # Adicionar instrução sobre primeira mensagem e horário
    if primeira_mensagem:
        instrucao_extra = f"\n\nIMPORTANTE: Esta é a PRIMEIRA mensagem da conversa. Use a saudação '{saudacao}' e apresente-se conforme as instruções."
    else:
        instrucao_extra = "\n\nIMPORTANTE: Esta NÃO é a primeira mensagem. NÃO se apresente novamente. NÃO use saudações como 'Boa noite'. Responda diretamente à pergunta de forma natural."
    
    # Montar histórico da conversa
    historico_texto = ""
    if historico:
        historico_texto = "\n\nHistórico da conversa:\n" + "\n".join(historico[-6:])  # Últimas 6 mensagens
    
    # Usar prompt personalizado com instrução
    if primeira_mensagem:
        prompt = f"""{prompt_personalizado}{instrucao_extra}

Horário atual em Brasília: {agora.strftime('%H:%M')} ({saudacao}){historico_texto}

Pergunta atual do cliente: {pergunta}

Sua resposta:"""
    else:
        prompt = f"""{prompt_personalizado}{instrucao_extra}{historico_texto}

Pergunta atual do cliente: {pergunta}

Sua resposta:"""
    
    try:
        response = requests.post(
            "https://api.deepseek.com/chat/completions",
            headers={
                "Authorization": f"Bearer {deepseek_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            resposta_texto = result['choices'][0]['message']['content']
        else:
            resposta_texto = "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em instantes."
    
    except Exception as e:
        resposta_texto = "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em instantes."
    
    class SimpleResponse:
        def __init__(self, text):
            self.text = text
    
    return SimpleResponse(resposta_texto)