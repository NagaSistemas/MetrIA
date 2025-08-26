import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Sparkles, MessageCircle, Settings } from 'lucide-react';

const AIConfiguration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ai-prompt`);
      const data = await response.json();
      setPrompt(data.prompt || getDefaultPrompt());
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setPrompt(getDefaultPrompt());
    } finally {
      setIsLoading(false);
    }
  };

  const savePrompt = async () => {
    if (!prompt.trim()) return;
    
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ai-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      
      setLastSaved(new Date());
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
      `;
      toast.textContent = '✅ Prompt salvo com sucesso!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDefaultPrompt = () => {
    return `Você é o assistente virtual do MetrIA. Na PRIMEIRA mensagem, apresente-se como: "Olá! Sou o assistente do MetrIA. Como posso ajudá-lo hoje? 😊"

Nas demais mensagens, responda APENAS à pergunta feita, sem se apresentar novamente. Seja direto, educado e prestativo.

Suas funções:
- Recomendar pratos baseado no gosto do cliente
- Explicar ingredientes e preparos dos pratos
- Sugerir combinações e acompanhamentos
- Tirar dúvidas sobre o cardápio
- Ajudar na escolha de bebidas

IMPORTANTE: Quando o cliente quiser adicionar um item, diga: "Ótima escolha! Para adicionar [NOME DO PRATO] ao seu pedido, clique no botão 'Adicionar ao Prato' na tela do cardápio."

Use emojis moderadamente e seja natural na conversa. Sempre mencione preços quando relevante.`;
  };

  const resetToDefault = () => {
    if (confirm('Deseja restaurar o prompt padrão? Isso substituirá o prompt atual.')) {
      setPrompt(getDefaultPrompt());
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#2C2C2C',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          border: '4px solid #D4AF37',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }}></div>
        <h3 style={{ 
          fontFamily: 'Cinzel, serif',
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#D4AF37',
          margin: 0,
          marginBottom: '8px'
        }}>
          Carregando Configurações
        </h3>
        <p style={{ color: '#F5F5F5', opacity: 0.7 }}>Preparando interface do agente IA...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Professional Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
          }}>
            <img src="/Agent.png" alt="Agente IA" style={{ width: '48px', height: '48px' }} />
          </div>
        </div>
        <h2 style={{ 
          fontFamily: 'Cinzel, serif',
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#D4AF37',
          margin: 0,
          marginBottom: '8px'
        }}>
          Configuração do Agente IA
        </h2>
        <p style={{ 
          color: '#F5F5F5', 
          opacity: 0.8, 
          fontSize: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Personalize o comportamento e personalidade do seu assistente virtual
        </p>
      </div>

      {/* Configuration Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header with Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#D4AF37',
              margin: 0,
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Settings size={20} />
              Prompt do Assistente
            </h3>
            <p style={{ 
              color: '#F5F5F5', 
              opacity: 0.7, 
              fontSize: '14px',
              margin: 0
            }}>
              Configure como o assistente deve se comportar e responder aos clientes
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={resetToDefault}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                color: '#8b5cf6',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            >
              <RefreshCw size={16} />
              Restaurar Padrão
            </button>
          </div>
        </div>

        {/* Prompt Editor */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            color: '#F5F5F5', 
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            <MessageCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Instruções para o Assistente
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite as instruções para o assistente IA..."
            style={{
              width: '100%',
              minHeight: '400px',
              padding: '20px',
              backgroundColor: '#0D0D0D',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              color: '#F5F5F5',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'vertical',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Tips */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#8b5cf6',
            margin: 0,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            Dicas para um Prompt Eficaz
          </h4>
          <ul style={{
            color: '#F5F5F5',
            opacity: 0.8,
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li>Defina claramente como o assistente deve se apresentar na primeira mensagem</li>
            <li>Especifique o tom de voz (formal, casual, amigável)</li>
            <li>Liste as principais funções que o assistente deve executar</li>
            <li>Inclua instruções sobre como lidar com pedidos e recomendações</li>
            <li>Defina quando e como usar emojis</li>
            <li>Estabeleça limites do que o assistente pode ou não fazer</li>
          </ul>
        </div>

        {/* Save Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <div>
            {lastSaved && (
              <p style={{
                color: '#F5F5F5',
                opacity: 0.6,
                fontSize: '12px',
                margin: 0
              }}>
                Última atualização: {lastSaved.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          
          <button
            onClick={savePrompt}
            disabled={!prompt.trim() || isSaving}
            style={{
              background: (prompt.trim() && !isSaving)
                ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                : 'rgba(102, 102, 102, 0.5)',
              color: (prompt.trim() && !isSaving) ? '#0D0D0D' : '#999',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (prompt.trim() && !isSaving) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: (prompt.trim() && !isSaving) ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (prompt.trim() && !isSaving) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (prompt.trim() && !isSaving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#D4AF37',
          margin: 0,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <img src="/Agent.png" alt="Agente IA" style={{ width: '20px', height: '20px' }} />
          Como Funciona
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: 'rgba(13, 13, 13, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>1️⃣</span>
            </div>
            <h4 style={{ color: '#F5F5F5', fontSize: '16px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
              Cliente Inicia Conversa
            </h4>
            <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
              O assistente se apresenta usando as instruções do prompt configurado
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(13, 13, 13, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>2️⃣</span>
            </div>
            <h4 style={{ color: '#F5F5F5', fontSize: '16px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
              IA Processa Pergunta
            </h4>
            <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
              O assistente analisa a pergunta usando o contexto do cardápio e as instruções
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(13, 13, 13, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>3️⃣</span>
            </div>
            <h4 style={{ color: '#F5F5F5', fontSize: '16px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
              Resposta Personalizada
            </h4>
            <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
              Retorna uma resposta seguindo exatamente o comportamento definido no prompt
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AIConfiguration;