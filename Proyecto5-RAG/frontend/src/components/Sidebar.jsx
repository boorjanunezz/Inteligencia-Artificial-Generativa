import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Plus, Home, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import './Sidebar.css';

export default function Sidebar() {
  const [assistants, setAssistants] = useState([]);
  const location = useLocation();

  const loadAssistants = async () => {
    try {
      const res = await api.get('/assistants');
      setAssistants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssistants();
  }, [location]);

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-area">
          <div className="logo-icon"><Bot size={24} /></div>
          <h2>NexRAG</h2>
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="nav-group">
          <p className="nav-label">General</p>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Inicio</span>
          </Link>
        </div>

        <div className="nav-group assistants-group">
          <div className="nav-group-header">
            <p className="nav-label">Tus Asistentes</p>
          </div>
          
          <div className="assistants-list">
            {assistants.map(a => (
              <Link 
                key={a.id} 
                to={`/assistant/${a.id}`} 
                className={`nav-link assistant-link ${location.pathname.includes(`/assistant/${a.id}`) ? 'active' : ''}`}
              >
                <div className="assistant-dot"></div>
                <span className="assistant-name">{a.name}</span>
                <ChevronRight size={14} className="chevron" />
              </Link>
            ))}
            {assistants.length === 0 && (
              <p className="empty-text">No hay asistentes</p>
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <Link to="/" className="btn btn-primary w-full new-btn">
          <Plus size={18} /> Crear Asistente
        </Link>
      </div>
    </aside>
  );
}
