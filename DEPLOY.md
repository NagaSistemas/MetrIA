# 🚀 Deploy do MetrIA

## ✅ Configurações Realizadas

### 🔧 Railway (Backend)
- **URL**: `metria-production.up.railway.app`
- **Porta**: 8080
- **Arquivo**: `railway.json` configurado
- **Variáveis de ambiente**: `.env` criado

### 🔥 Firebase
- **Projeto**: `metria-fcbbc`
- **Credenciais**: Arquivo JSON configurado
- **SDK**: Integrado no frontend e backend

### 🤖 IA (DeepSeek)
- **API Key**: Configurada
- **Serviço**: Integrado ao backend
- **Chat**: Componente React criado

## 📋 Passos para Deploy

### 1. Backend (Railway)
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
# Conectar ao Railway e fazer push
```

### 2. Frontend (Hostinger)
```bash
cd frontend
npm run build
# Upload da pasta dist/ para Hostinger
```

### 3. Inicializar Dados
```bash
# Após deploy do backend
npm run seed
```

## 🔗 URLs Finais

- **API**: `https://metria-production.up.railway.app`
- **Frontend**: `https://app.seudominio.com`
- **Cardápio**: `https://app.seudominio.com/m/{restaurantId}/{tableId}?t={token}`
- **Cozinha**: `https://app.seudominio.com/kitchen`
- **Admin**: `https://app.seudominio.com/admin`

## ✅ Funcionalidades Implementadas

### 🎯 Sistema Completo
- ✅ QR Code por mesa
- ✅ Cardápio digital
- ✅ **Assistente IA integrado** (DeepSeek)
- ✅ Carrinho de compras
- ✅ Painel da cozinha
- ✅ Painel administrativo
- ✅ Chamadas de garçom
- ✅ Firebase configurado
- ✅ Railway configurado

### 🤖 IA Features
- ✅ Chat contextual por sessão
- ✅ Recomendações de pratos
- ✅ Explicação de ingredientes
- ✅ Sugestões personalizadas
- ✅ Histórico de conversa
- ✅ Prompt customizável

## 🔄 Próximos Passos

1. **Deploy efetivo** no Railway e Hostinger
2. **Integração iPag** para pagamentos
3. **Testes completos** do fluxo
4. **Otimizações** de performance
5. **Monitoramento** e logs