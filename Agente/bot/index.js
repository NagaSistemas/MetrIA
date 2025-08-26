const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PROMPT_PATH = './prompt.json';

let client;
let qrCodeBase64 = "";
let connected = false;

// ========== Inicialização do WhatsApp ==========

client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  require('qrcode').toDataURL(qr, (err, url) => {
    qrCodeBase64 = url;
    connected = false;
    console.log('Novo QR code disponível! Válido por ~40 segundos');
    
    // Limpar QR code após 35 segundos (antes de expirar)
    setTimeout(() => {
      if (!connected) {
        console.log('QR Code expirado, gerando novo...');
        // Forçar nova inicialização para gerar novo QR
        client.destroy().then(() => {
          setTimeout(() => {
            client.initialize();
          }, 2000);
        });
      }
    }, 35000);
  });
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  connected = true;
  qrCodeBase64 = "";
  console.log('WhatsApp conectado!');
});

client.on('authenticated', () => {
  connected = true;
  qrCodeBase64 = "";
  console.log('Autenticado!');
});

client.on('disconnected', (reason) => {
  connected = false;
  qrCodeBase64 = "";
  console.log('Desconectado:', reason);
});

// ========== Prompt Dinâmico ==========

function getPrompt() {
  if (fs.existsSync(PROMPT_PATH)) {
    try {
      const data = fs.readFileSync(PROMPT_PATH, 'utf-8');
      return JSON.parse(data).prompt || "Responda de forma clara e objetiva:";
    } catch (e) {
      return "Responda de forma clara e objetiva:";
    }
  }
  return "Responda de forma clara e objetiva:";
}

// ========== Recebendo mensagens ==========

client.on('message', async msg => {
  if (!msg.fromMe && msg.body) {
    try {
      // Usa o prompt salvo pelo usuário
      const promptCustom = getPrompt();
      const promptFinal = `${promptCustom}\nPergunta do cliente: ${msg.body}`;

      const response = await axios.post(process.env.BACKEND_URL, { pergunta: promptFinal });
      const resposta = response.data.resposta;
      if (resposta) {
        await msg.reply(resposta);
      } else {
        await msg.reply("Desculpe, não consegui encontrar uma resposta.");
      }
    } catch (err) {
      console.error("Erro ao buscar resposta:", err?.response?.data || err.message);
      await msg.reply("Desculpe, ocorreu um erro ao buscar a resposta.");
    }
  }
});

// ========== API REST para o frontend React ==========

// Status de conexão
app.get('/api/whatsapp/status', (req, res) => {
  res.json({ connected });
});

// QR Code (caso não conectado)
app.get('/api/whatsapp/qrcode', (req, res) => {
  if (connected) {
    res.status(400).json({ message: "Já conectado." });
  } else if (qrCodeBase64) {
    res.json({ qrCode: qrCodeBase64 });
  } else {
    // Se não tem QR code, forçar geração
    if (client.info) {
      // Cliente já inicializado, apenas aguardar
      res.status(202).json({ message: "QR code sendo gerado, aguarde..." });
    } else {
      // Inicializar cliente se necessário
      client.initialize();
      res.status(202).json({ message: "Inicializando WhatsApp, aguarde..." });
    }
  }
});

// Logout/desconectar
app.post('/api/whatsapp/logout', async (req, res) => {
  if (client && connected) {
    await client.destroy();
    connected = false;
    res.json({ ok: true });
    console.log('Logout solicitado e executado.');
  } else {
    res.status(400).json({ error: "Não conectado" });
  }
});

// Prompt: buscar
app.get('/api/prompt', (req, res) => {
  res.json({ prompt: getPrompt() });
});

// Prompt: salvar
app.post('/api/prompt', (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt inválido' });
  }
  fs.writeFileSync(PROMPT_PATH, JSON.stringify({ prompt }), 'utf-8');
  res.json({ ok: true });
  console.log('Prompt atualizado:', prompt);
});

// ========== Botão "Treinar Agente" ==========

// Endpoint para recarregar dados locais manualmente (paliativo)
app.post('/api/reload', (req, res) => {
  // Aqui você pode adicionar lógica extra caso precise recarregar dados do disco
  // No seu caso, tudo já é lido em tempo real com getPrompt()
  console.log('Treinar agente: Reload manual solicitado.');
  res.json({ ok: true, message: 'Reload realizado com sucesso.' });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log('API WhatsApp ouvindo na porta ' + PORT);
  client.initialize();
});
