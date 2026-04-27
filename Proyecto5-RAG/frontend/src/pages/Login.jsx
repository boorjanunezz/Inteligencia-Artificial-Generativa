import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { login, register } from '../lib/api';
import './Login.css';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor, rellena todos los campos');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password);
        const data = await login(username, password);
        localStorage.setItem('token', data.access_token);
        onLogin(username);
      } else {
        const data = await login(username, password);
        localStorage.setItem('token', data.access_token);
        onLogin(username);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <div className="login-card">
        <div className="logo-center">
          <div className="login-icon">
            <Bot size={28} />
          </div>
        </div>
        <h1 className="login-title">NexRAG</h1>
        <p className="login-subtitle">
          {isRegister ? 'Crea tu cuenta para empezar' : 'Inicia sesión en tu cuenta'}
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-msg">{error}</div>}
          
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text" 
              className="input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>
        
        <div className="switch-mode">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button className="switch-btn" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
