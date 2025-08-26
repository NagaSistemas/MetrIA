# 🚀 GUIA COMPLETO PARA DEPLOY NO RAILWAY

## ❌ PROBLEMAS IDENTIFICADOS E CORRIGIDOS

### 1. **Configuração Firebase**
- ✅ Variáveis de ambiente configuradas
- ✅ Credenciais removidas do código
- ✅ Validação de variáveis obrigatórias

### 2. **Segurança**
- ✅ API Keys removidas do código
- ✅ Credenciais via variáveis de ambiente
- ✅ Arquivo JSON Firebase deve ser removido do repo

### 3. **Build e Deploy**
- ✅ TypeScript compilando corretamente
- ✅ Railway.json configurado
- ✅ Scripts de build funcionando

## 🔧 PASSOS PARA DEPLOY NO RAILWAY

### 1. **Configurar Variáveis de Ambiente no Railway**
```bash
# No painel do Railway, adicione estas variáveis:
PORT=8080
FIREBASE_PROJECT_ID=metria-fcbbc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@metria-fcbbc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQYNvvw7B0kTkB
qasu3MsKzfFW/PoFdoD09905ATKv/ZJjPqdeGpzY1FKv3YCQaGeIdJWOE0K6gV1w
6WHhO/5PWAJZE3aH7GUdzrrRwgNbLWVNvaK1TG+lJ2HhoP2Aq3ekzom20pxw5vNH
6/ZQ7e0p7wY0Znzsbklj2chywTdfTjazbvA0PAOEq/3iSibO/LU+57HqcP1BSZZ6
cN9t8Lh1tB++VdgK3m77QNxU2rpjkYe6qscqRCIsRGb4W/NSFR9RY55YL9VF0vn/
H8eGUEWnv+v4C/GL+mqOMD2Tkjwuwm47vaQrcmMM+2mK7avY8m3cnnpGeN07eXmf
RhWxuLT1AgMBAAECggEAB4/TJSEqNki+5BvnV9p/le7IY6Z3T97vjSUIRKqP5ZDR
4HnRGUgqi96+//AJgka9mXOFu729gngxFS9cDYhvXud8o/61eBQFDcUcmszfESD1
C9fRVE6PEGbaJQ+iB2GzsAGTS+yG/hDSkCNHMODtSYN33zm49Ecod97ZtUzyYf7q
DjWC5pChcYi5I46Xk1iyK+5kgW//fPe93fxCDED7AlQbk+eccdt2u37/FM58sPtS
yRI/wRYbwFeo6Dzpvd9fjLHztV9vEuQqLnS/HTHUQqrlOEAagc+RCx3UyfSF46Ny
6Ey5ZyEZbRJgA1ZI3SIKVC23/W1NYeVDGTj3yKHelwKBgQDHyN0jNFj4EOr16Pvb
C9l0e1uZNHIgRvCGx5tJNeqkeqEg2Eh1vTGZi4ab8zioZKu34gk0BtNCjMZom+r5
kdwmyNV1PuTR61K42gLpHV37PC3to9MdmNyu2z3o0pmFF6a1Wa4HrHN5SdwXKMCm
BfWSrphjKeVk4UssaunL9f9tXwKBgQC5AObQr4X3fUm5wSqPyO9OSnW6FH1bxL6B
C4oSIne4XzphrjbTOMMNYBXxfTkY7x9n7NcP/+nIIjPN0PzkNn/wzyV0qaJjk4mu
/nwtqCiDvHEmG3EK/zrnw0oLrh3UuWi5T9869Gx4A1oCyh6wLH4InuYeoiqfh6ok
5QBKqHhqKwKBgA4AXMcn1whjnyPm1SfP18ibEJtXGpx6fEbl3FMwLSaj1YEIx2NB
BCXfqmppjFH45DP56m00AUBLv2f7bWdaOpSZRKR36O9xT5XW6ZdO0JRX7lwWPCh5
2xWCFf+oKswyESPqihDNnDYm3/7bg0zfZAuIovNoL0R3qZ4OTB5YOjN/AoGBAIet
4ZmrINUhTbCtukk5VEhW04BlBosG/7Akhl5GaQcO0AJTgmHmfyaQEYfKDtX6iU3u
pMtXJF1iuBt56f50+d/iC9ZDkpT030U33lqduRjkWxdXiNBH3yuaTfPC/p3EXMmL
imvyVpqt2pWxJlCOUOCBqMNOq3PUSzRDvrMCW02BAoGBAJ2bf7uk9ajTyKHFDFpY
hA2i+Shldhh+gsbeEPyWYKKM80gZq3xd42yJupuxMaCaYosxVrjeDqlbRbg/Npal
+uC7SFJ5C9y/sg6fs+LSWXfZndUBlv/Dvgw2odIuSwVIBEeVXTLyk3iIw7Kqbg4r
TQJrv+HDIOS0i3cWCWiRK1dh
-----END PRIVATE KEY-----"
DEEPSEEK_API_KEY=sk-94b3a551443148f59500c0644ec2e5f0
```

### 2. **Remover Arquivo Sensível**
```bash
# IMPORTANTE: Remover o arquivo JSON do repositório
git rm backend/metria-fcbbc-firebase-adminsdk-fbsvc-4cc85edb37.json
git commit -m "Remove Firebase credentials file"
```

### 3. **Deploy**
```bash
# Fazer push para o Railway
git add .
git commit -m "Fix Railway deploy configuration"
git push origin main
```

### 4. **Verificar Deploy**
- ✅ Health check: `https://metria-production.up.railway.app/health`
- ✅ API funcionando: `https://metria-production.up.railway.app/api/`

## 🔍 ESTRUTURA CORRIGIDA

### Backend (`/backend`)
- ✅ TypeScript configurado
- ✅ Firebase com variáveis de ambiente
- ✅ DeepSeek API segura
- ✅ Build funcionando
- ✅ Scripts de produção

### Configuração Railway
- ✅ `railway.json` correto
- ✅ Build command: `cd backend && npm install && npm run build`
- ✅ Start command: `cd backend && npm start`
- ✅ Health check: `/health`

## ⚠️ PRÓXIMOS PASSOS

1. **Configurar variáveis no Railway Dashboard**
2. **Remover arquivo JSON do repositório**
3. **Fazer deploy**
4. **Testar endpoints**
5. **Configurar frontend para usar a API**

## 🎯 ENDPOINTS DISPONÍVEIS

- `GET /health` - Health check
- `GET /api/session/:restaurantId/:tableId` - Sessão da mesa
- `POST /api/ai/chat` - Chat com IA
- `GET /api/admin/tables` - Listar mesas
- `POST /api/admin/tables/generate` - Gerar mesas
- `GET /api/kitchen/orders` - Pedidos da cozinha
- `POST /api/call-waiter` - Chamar garçom