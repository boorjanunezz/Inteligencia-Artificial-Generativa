import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import api from '../lib/api';
import './Home.css';

export default function Home() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assistants', {
        name, description, instructions
      });
      // reload sidebar by a simple trick or just navigate
      window.location.href = `/assistant/${res.data.id}`;
    } catch (err) {
      console.error(err);
      alert('Error creando asistente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="hero-section text-center">
        <div className="hero-icon">
          <Sparkles size={48} className="text-accent" />
        </div>
        <h1 className="hero-title">Crea tu nuevo Asistente RAG</h1>
        <p className="hero-subtitle">Define su personalidad y súbele documentos exclusivos.</p>
      </div>

      <div className="form-container glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Asistente</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ej: Asesor Legal Autónomos" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción Breve</label>
            <input 
              type="text" 
              className="input" 
              placeholder="¿Qué hace este asistente?" 
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Instrucciones (System Prompt)</label>
            <textarea 
              className="textarea" 
              rows="5"
              placeholder="Eres un experto legal. Responde formalmente y con precisión..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Creando...' : (
              <>
                <Bot size={20} /> Construir Asistente
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
