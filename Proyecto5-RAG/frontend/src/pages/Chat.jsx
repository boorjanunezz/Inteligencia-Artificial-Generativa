import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import api, { setFeedback, clearFeedback } from '../lib/api';
import './Chat.css';

export default function Chat() {
  const { id, sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (sessionId) loadMessages();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${sessionId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await api.post(`/chat/${sessionId}/messages`, { content: text });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'El backend tardó demasiado en responder. Revisa que las API keys estén configuradas.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgId, value) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    try {
      if (msg.feedback === value) {
        await clearFeedback(msgId);
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, feedback: null } : m)));
      } else {
        await setFeedback(msgId, value);
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, feedback: value } : m)));
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleCopy = async (msgId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // clipboard not available
    }
  };

  if (!sessionId) return <div className="page-container">Error: sessionId requerido.</div>;

  return (
    <div className="chat-container">
      <div className="chat-header glass-panel">
        <Link to={`/assistant/${id}`} className="btn btn-ghost" style={{ padding: '0.4rem 0.6rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ marginLeft: '12px' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Conversación RAG</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>Respuestas basadas en los documentos del asistente</p>
        </div>
      </div>

      <div className="messages-area glass-panel">
        {messages.length === 0 && (
          <div className="empty-chat">
            <Bot size={44} className="empty-icon" />
            <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>Inicio de conversación</p>
            <span style={{ fontSize: '0.82rem' }}>Las respuestas provienen exclusivamente de los documentos del asistente.</span>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`message-wrapper ${m.role}`}>
            <div className={`message ${m.role}-bubble`}>
              {m.role === 'assistant' ? (
                <Bot size={17} className="msg-icon" />
              ) : (
                <User size={17} className="msg-icon" />
              )}
              <div className="msg-content" style={{ flex: 1 }}>
                {m.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}

                {m.role === 'assistant' && m.id && (
                  <div className="msg-actions">
                    <button
                      className={`msg-action-btn ${copiedId === m.id ? 'copied' : ''}`}
                      onClick={() => handleCopy(m.id, m.content)}
                      title="Copiar respuesta"
                    >
                      {copiedId === m.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <button
                      className={`msg-action-btn ${m.feedback === 1 ? 'active-up' : ''}`}
                      onClick={() => handleFeedback(m.id, 1)}
                      title="Útil"
                    >
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      className={`msg-action-btn ${m.feedback === -1 ? 'active-down' : ''}`}
                      onClick={() => handleFeedback(m.id, -1)}
                      title="No útil"
                    >
                      <ThumbsDown size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-wrapper assistant">
            <div className="message assistant-bubble">
              <Bot size={17} className="msg-icon" />
              <div className="typing-indicator">
                <span /><span /><span />
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
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta al asistente..."
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary send-btn" disabled={loading || !input.trim()}>
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
