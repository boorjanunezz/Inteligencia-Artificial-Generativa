import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
import api from '../lib/api';
import './Chat.css';

export default function Chat() {
  const { id, sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${sessionId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMsgDesc = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsgDesc }]);
    setLoading(true);

    try {
      const res = await api.post(`/chat/${sessionId}/messages`, { content: userMsgDesc });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'La base de conocimiento RAG o el LLM tardaron demasiado en responder. Por favor revisa la consola y el backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return <div className="page-container">Error: sessionId is required.</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header glass-panel">
        <Link to={`/assistant/${id}`} className="btn btn-ghost" style={{padding: '0.4rem'}}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{marginLeft: '12px'}}>
          <h2 style={{fontSize: '1.1rem', margin: 0}}>Conversación RAG</h2>
          <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Respondiendo con base al contexto del asistente</span>
        </div>
      </div>

      <div className="messages-area glass-panel">
        {messages.length === 0 && (
          <div className="empty-chat">
            <Bot size={48} className="empty-icon" />
            <p>Este es el inicio de tu conversación.</p>
            <span>Todo el conocimiento proviene estrictamente de los documentos del asistente.</span>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`message-wrapper ${m.role}`}>
            <div className={`message ${m.role}-bubble`}>
              {m.role === 'assistant' ? <Bot size={18} className="msg-icon" /> : <User size={18} className="msg-icon" />}
              <div className="msg-content">
                {m.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper assistant">
            <div className="message assistant-bubble typing">
              <Bot size={18} className="msg-icon" />
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area glass-panel">
        <form onSubmit={handleSend} className="input-form">
          <input
            type="text"
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu consulta para el asistente..."
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary send-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
