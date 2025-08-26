# Naga IA - Agente Inteligente

Sistema completo de chatbot com IA para automatizar conversações via WhatsApp e painel administrativo web.

## 🚀 Funcionalidades

- **Painel Administrativo** - Interface web elegante para gerenciar o bot
- **Base de Conhecimento** - Sistema de perguntas e respostas
- **Integração WhatsApp** - Bot automatizado para WhatsApp
- **IA Avançada** - Powered by DeepSeek API
- **Chat de Teste** - Teste o bot diretamente no painel

## 🛠️ Tecnologias

### Backend
- **FastAPI** - API REST moderna
- **LlamaIndex** - Framework para aplicações LLM
- **DeepSeek API** - Modelo de IA avançado
- **Pandas** - Manipulação de dados

### Frontend
- **React + TypeScript** - Interface moderna
- **Tailwind CSS** - Estilização elegante
- **Vite** - Build tool rápido

### Bot WhatsApp
- **whatsapp-web.js** - Integração WhatsApp
- **Puppeteer** - Automação do navegador

## 🔧 Configuração

### Variáveis de Ambiente (Railway)
```env
DEEPSEEK_API_KEY=sua_chave_deepseek
OPENAI_API_KEY=sua_chave_openai_backup
```

### Credenciais de Login
- **Email:** `nagaia@admin.com`
- **Senha:** `nagaia@2025`

## 📦 Deploy

### Railway (Backend)
1. Conecte este repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### Hostinger (Frontend)
1. Execute `npm run build` na pasta `frontend`
2. Suba os arquivos da pasta `dist/` para o servidor
3. Inclua o arquivo `Naga.png` na raiz

## 🎨 Design

- **Cores principais:** #1790A7, #000000, #FFFFFF
- **Design responsivo** para mobile e desktop
- **Animações suaves** e interface moderna
- **Logo personalizada** Naga IA

## 📱 Uso

1. **Acesse o painel** administrativo
2. **Gerencie perguntas** e respostas
3. **Configure o WhatsApp** bot
4. **Teste o agente** no chat integrado
5. **Monitore conversas** em tempo real

## 🔒 Segurança

- Login protegido por credenciais
- API keys em variáveis de ambiente
- Validação de dados no backend

---

**© 2025 Naga IA - Todos os direitos reservados**