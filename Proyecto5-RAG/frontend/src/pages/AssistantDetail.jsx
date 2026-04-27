import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, Trash2, FileText, MessageSquare, Trash, Plus } from 'lucide-react';
import api from '../lib/api';
import './AssistantDetail.css';

export default function AssistantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const [resA, resD, resC] = await Promise.all([
        api.get(`/assistants/${id}`),
        api.get(`/assistants/${id}/documents`),
        api.get(`/assistants/${id}/chats`),
      ]);
      setAssistant(resA.data);
      setDocuments(resD.data);
      setChats(resC.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/assistants/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error subiendo documento. Revisa las Azure API Keys en .env');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('¿Eliminar este documento? Se borrará del índice vectorial.')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssistant = async () => {
    if (!window.confirm('¿Eliminar este asistente? Se borrarán todos sus documentos y conversaciones.')) return;
    try {
      await api.delete(`/assistants/${id}`);
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.post(`/assistants/${id}/chat`);
      navigate(`/assistant/${id}/chat/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!assistant) return <div className="page-container">Cargando...</div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="detail-header glass-panel">
        <div className="info">
          <h1>{assistant.name}</h1>
          <p>{assistant.description || 'Sin descripción'}</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteAssistant}>
          <Trash size={15} /> Eliminar asistente
        </button>
      </div>

      <div className="stats-row">
        <span className="stat-badge">
          <FileText size={13} /> {documents.length} documento{documents.length !== 1 ? 's' : ''}
        </span>
        <span className="stat-badge">
          <MessageSquare size={13} /> {chats.length} conversaci{chats.length !== 1 ? 'ones' : 'ón'}
        </span>
      </div>

      <div className="grid-2">
        {/* Documents */}
        <div className="glass-panel subsection">
          <div className="sub-header">
            <h3><FileText size={18} /> Documentos</h3>
            <label className="btn btn-primary btn-sm upload-btn">
              {uploading ? 'Procesando...' : <><Upload size={14} /> Subir</>}
              <input type="file" hidden onChange={handleFileUpload} disabled={uploading} accept=".pdf,.txt,.docx" />
            </label>
          </div>
          <div className="doc-list">
            {documents.length === 0 ? (
              <p className="empty">Sube documentos para que el asistente pueda responder con ellos.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="doc-item">
                  <FileText size={15} className="doc-icon" />
                  <span className="doc-name" title={doc.filename}>{doc.filename}</span>
                  <button
                    className="doc-delete-btn"
                    onClick={() => handleDeleteDocument(doc.id)}
                    title="Eliminar documento"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chats */}
        <div className="glass-panel subsection">
          <div className="sub-header">
            <h3><MessageSquare size={18} /> Conversaciones</h3>
            <button className="btn btn-primary btn-sm" onClick={handleNewChat}>
              <Plus size={14} /> Nueva
            </button>
          </div>
          <div className="chat-list">
            {chats.length === 0 ? (
              <p className="empty">Inicia una conversación con este asistente.</p>
            ) : (
              [...chats].reverse().map((chat) => (
                <Link key={chat.id} to={`/assistant/${id}/chat/${chat.id}`} className="chat-item">
                  <MessageSquare size={15} />
                  <span>{new Date(chat.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
