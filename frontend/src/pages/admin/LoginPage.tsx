import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Carregar usuário salvo se existir
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Credenciais fixas para demonstração
    if (username === 'admin' && password === 'metria2024') {
      // Salvar sessão
      sessionStorage.setItem('adminLoggedIn', 'true');
      
      // Salvar usuário se "Lembrar de mim" estiver marcado
      if (rememberMe) {
        localStorage.setItem('adminUsername', username);
      } else {
        localStorage.removeItem('adminUsername');
      }

      navigate('/admin');
    } else {
      setError('Usuário ou senha incorretos');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D0D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/Logo.png" 
            alt="MetrIA Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))',
              marginBottom: '16px'
            }} 
          />
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '28px',
            fontWeight: '700',
            color: '#D4AF37',
            margin: 0,
            marginBottom: '8px'
          }}>
            Painel Administrativo
          </h1>
          <p style={{
            color: '#F5F5F5',
            opacity: 0.7,
            fontSize: '14px',
            margin: 0
          }}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#F5F5F5',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#D4AF37',
                  opacity: 0.7
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  backgroundColor: '#0D0D0D',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  color: '#F5F5F5',
                  fontSize: '16px',
                  outline: 'none',
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
                placeholder="Digite seu usuário"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#F5F5F5',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#D4AF37',
                  opacity: 0.7
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 48px',
                  backgroundColor: '#0D0D0D',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  color: '#F5F5F5',
                  fontSize: '16px',
                  outline: 'none',
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
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#D4AF37',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '24px' 
          }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '12px',
                accentColor: '#D4AF37'
              }}
            />
            <label 
              htmlFor="rememberMe"
              style={{
                color: '#F5F5F5',
                fontSize: '14px',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              Lembrar de mim
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#ef4444',
                fontSize: '14px',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading 
                ? 'rgba(212, 175, 55, 0.5)' 
                : 'linear-gradient(135deg, #D4AF37, #B8860B)',
              color: '#0D0D0D',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isLoading 
                ? 'none' 
                : '0 4px 15px rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0D0D0D',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        {/* Demo Info */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#D4AF37',
            fontSize: '12px',
            margin: 0,
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            Credenciais de Demonstração:
          </p>
          <p style={{
            color: '#F5F5F5',
            fontSize: '12px',
            margin: 0,
            opacity: 0.8
          }}>
            Usuário: <strong>admin</strong> | Senha: <strong>metria2024</strong>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;