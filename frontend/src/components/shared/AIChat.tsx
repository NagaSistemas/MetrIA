import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  restaurantId: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, sessionId, restaurantId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: '🍽️ Olá! Sou o assistente MetrIA, seu maître digital. Como posso ajudá-lo hoje? Posso recomendar pratos, explicar ingredientes ou tirar qualquer dúvida sobre nosso cardápio!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          restaurantId
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '🤖 Desculpe, estou com dificuldades técnicas no momento. Posso ajudá-lo de outra forma?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: '#0D0D0D' 
    }}>
      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            {!message.isUser && (
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#D4AF37',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img src="/Agent.png" alt="IA" style={{ width: '20px', height: '20px' }} />
              </div>
            )}
            
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: message.isUser ? '#D4AF37' : '#2C2C2C',
              color: message.isUser ? '#0D0D0D' : '#F5F5F5',
              border: message.isUser ? 'none' : '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0,
                marginBottom: '8px',
                whiteSpace: 'pre-wrap'
              }}>
                {message.text}
              </p>
              <p style={{
                fontSize: '11px',
                margin: 0,
                opacity: 0.7
              }}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            {message.isUser && (
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#046D63',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: '600' }}>U</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#D4AF37',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/Agent.png" alt="IA" style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: '#2C2C2C',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#D4AF37',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#D4AF37',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.16s'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#D4AF37',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.32s'
                }}></div>
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: '#F5F5F5', 
                opacity: 0.7 
              }}>
                Pensando...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        backgroundColor: 'rgba(44, 44, 44, 0.5)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#0D0D0D',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              color: '#F5F5F5',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              minHeight: '48px',
              maxHeight: '120px',
              fontFamily: 'inherit'
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              backgroundColor: '#D4AF37',
              color: '#0D0D0D',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isLoading ? 1 : 0.5,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (inputText.trim() && !isLoading) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {[
            '🍽️ Recomende um prato',
            '🥗 Opções vegetarianas', 
            '🍷 Sugestão de bebida',
            '⏰ Tempo de preparo'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(suggestion.substring(2))}
              disabled={isLoading}
              style={{
                backgroundColor: 'rgba(13, 13, 13, 0.5)',
                color: 'rgba(245, 245, 245, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.color = '#D4AF37';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.5)';
                  e.currentTarget.style.color = 'rgba(245, 245, 245, 0.8)';
                }
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AIChat;