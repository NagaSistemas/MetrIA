# Estrutura do Projeto MetrIA

```
metria-project/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── contexts/           # Context API (TableContext)
│   │   ├── pages/              # Páginas principais
│   │   │   ├── MenuPage.tsx    # Cardápio do cliente
│   │   │   ├── KitchenPanel.tsx # Painel da cozinha
│   │   │   └── AdminPanel.tsx  # Painel administrativo
│   │   ├── services/           # Serviços e APIs
│   │   ├── hooks/              # Custom hooks
│   │   └── config/
│   │       └── firebase.ts     # Configuração Firebase
│   ├── .env.example           # Variáveis de ambiente
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # Rotas da API
│   │   │   ├── session.ts     # Gerenciamento de sessões
│   │   │   ├── kitchen.ts     # API do painel cozinha
│   │   │   ├── admin.ts       # API do painel admin
│   │   │   └── waiter.ts      # Chamadas de garçom
│   │   ├── services/          # Lógica de negócio
│   │   ├── config/
│   │   │   └── firebase.ts    # Firebase Admin
│   │   ├── scripts/
│   │   │   └── seed.ts        # Popular banco de dados
│   │   └── index.ts           # Servidor principal
│   ├── .env.example          # Variáveis de ambiente
│   └── package.json
│
├── shared/                    # Tipos TypeScript compartilhados
│   └── types.ts              # Interfaces e tipos
│
├── README.md                 # Documentação principal
└── STRUCTURE.md             # Este arquivo
```

## 🔗 Fluxo de Dados

### 1. Cliente (Mesa)
```
QR Code → MenuPage → TableContext → Firebase → Backend API
```

### 2. Cozinha
```
KitchenPanel → Backend API → Firebase → Real-time Updates
```

### 3. Administração
```
AdminPanel → Backend API → Firebase → CRUD Operations
```

## 📊 Coleções Firebase

### restaurants
```json
{
  "id": "string",
  "name": "string",
  "logo": "string",
  "menu": "MenuItem[]",
  "aiPrompt": "string"
}
```

### tables
```json
{
  "id": "string",
  "number": "number",
  "restaurantId": "string",
  "qrCode": "string",
  "currentSession": "TableSession | null"
}
```

### sessions
```json
{
  "id": "string",
  "tableId": "string",
  "restaurantId": "string",
  "status": "OPEN | ORDERING | PAYING | PAID | CLOSED",
  "token": "string",
  "createdAt": "Date",
  "orders": "Order[]",
  "waiterCalls": "WaiterCall[]"
}
```

### orders
```json
{
  "id": "string",
  "sessionId": "string",
  "items": "OrderItem[]",
  "total": "number",
  "status": "PENDING | CONFIRMED | PREPARING | READY | DELIVERED",
  "paymentStatus": "PENDING | PAID | FAILED",
  "isExtra": "boolean",
  "createdAt": "Date"
}
```

### waiterCalls
```json
{
  "id": "string",
  "sessionId": "string",
  "tableNumber": "number",
  "message": "string",
  "status": "PENDING | RESOLVED",
  "createdAt": "Date"
}
```