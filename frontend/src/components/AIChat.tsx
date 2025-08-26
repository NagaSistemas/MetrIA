import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';

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
      // Mensagem de boas-vindas automática
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
    <div className="flex flex-col h-full bg-metria-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`max-w-xs lg:max-w-md flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}>
              {!message.isUser && (
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-metria-black" />
                </div>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl shadow-lg ${
                  message.isUser
                    ? 'bg-gold text-metria-black rounded-br-md'
                    : 'bg-metria-gray text-metria-white border border-gold/20 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-metria-black/70' : 'text-metria-white/60'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 bg-metria-emerald rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">U</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-metria-black animate-pulse" />
              </div>
              <div className="bg-metria-gray text-metria-white px-4 py-3 rounded-2xl rounded-bl-md border border-gold/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-xs text-metria-white/70 ml-2">Pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gold/20 bg-metria-gray/50">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 bg-metria-black border border-gold/30 rounded-xl text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none transition-all resize-none"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-gold text-metria-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            title="Enviar mensagem"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
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
              className="bg-metria-black/50 text-metria-white/80 px-3 py-2 rounded-lg text-xs whitespace-nowrap hover:bg-gold/20 hover:text-gold transition-all disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChat;