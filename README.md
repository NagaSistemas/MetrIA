# MetrIA - Sistema de Cardápio Digital com IA

Sistema completo de cardápio de mesa com QR Code individual, assistente de IA, pagamentos integrados e painéis de gerenciamento.

## 🚀 Funcionalidades

- **Cardápio Digital**: QR Code único por mesa com cardápio interativo
- **Assistente IA**: Recomendações personalizadas usando DeepSeek
- **Pagamentos**: Integração com iPag (PIX e Cartão)
- **Painel Cozinha**: Gerenciamento de pedidos em tempo real
- **Painel Admin**: Controle completo de mesas, pedidos e configurações
- **Chamada de Garçom**: Sistema de alertas para atendimento

## 🛠️ Stack Tecnológica

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: Firebase Firestore
- **Pagamentos**: iPag
- **IA**: DeepSeek
- **Hospedagem**: Hostinger (Frontend)

## 📋 Pré-requisitos

- Node.js 18+
- Conta Firebase
- Conta iPag
- Conta DeepSeek

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd metria-project
```

### 2. Configure o Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
- Firebase (Project ID, Client Email, Private Key)
- iPag (API Key)
- DeepSeek (API Key)

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações do Firebase.

### 4. Inicie os serviços

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 URLs do Sistema

- **Cardápio**: `https://app.seudominio.com/m/{restaurantId}/{tableId}?t={sessionToken}`
- **Painel Cozinha**: `https://app.seudominio.com/kitchen`
- **Painel Admin**: `https://app.seudominio.com/admin`

## 📱 Fluxo de Uso

### Cliente
1. Escaneia QR Code da mesa
2. Navega pelo cardápio ou usa assistente IA
3. Adiciona itens ao "prato" (carrinho)
4. Finaliza pedido e paga
5. Pode adicionar itens extras ou chamar garçom

### Cozinha
1. Visualiza pedidos em tempo real
2. Atualiza status dos pedidos
3. Recebe alertas de chamadas de garçom

### Administração
1. Gera e gerencia mesas
2. Monitora pedidos
3. Configura assistente IA
4. Encerra sessões de mesa

## 🔄 Estados da Mesa

- **OPEN**: Mesa disponível para pedidos
- **ORDERING**: Cliente montando pedido
- **PAYING**: Processando pagamento
- **PAID**: Pagamento confirmado
- **CLOSED**: Sessão encerrada

## 🎯 Próximos Passos

1. Implementar integração completa com iPag
2. Desenvolver assistente IA com DeepSeek
3. Adicionar sistema de notificações push
4. Implementar relatórios e analytics
5. Criar app mobile nativo

## 📄 Licença

Este projeto está sob a licença MIT.