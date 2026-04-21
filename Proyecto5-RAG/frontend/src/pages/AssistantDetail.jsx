import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, Trash2, FileText, MessageSquare, Trash } from 'lucide-react';
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
      const resA = await api.get(`/assistants/${id}`);
      setAssistant(resA.data);
      const resD = await api.get(`/assistants/${id}/documents`);
      setDocuments(resD.data);
      const resC = await api.get(`/assistants/${id}/chats`);
      setChats(resC.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/assistants/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error subiendo documento. Asegúrate de configurar Azure API Keys en .env');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAssistant = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este asistente? Su índice y documentos también desaparecerán de forma local.")) return;
    try {
      await api.delete(`/assistants/${id}`);
      window.location.href = "/";
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
          <h1 className="title" style={{marginBottom: '5px'}}>{assistant.name}</h1>
          <p style={{color: 'var(--text-muted)'}}>{assistant.description || 'Sin descripción'}</p>
        </div>
        <div className="actions">
          <button className="btn btn-danger" onClick={handleDeleteAssistant}>
            <Trash size={16} /> Eliminar
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel subsection">
          <div className="sub-header">
            <h3><FileText size={20} /> Documentos ({documents.length})</h3>
            <label className="btn btn-primary btn-sm upload-btn">
              {uploading ? 'Procesando...' : <><Upload size={16} /> Subir Archivo</>}
              <input type="file" hidden onChange={handleFileUpload} disabled={uploading} accept=".pdf,.txt,.docx" />
            </label>
          </div>
          
          <div className="doc-list">
            {documents.length === 0 ? <p className="empty">No has subido documentos.</p> : documents.map(doc => (
              <div key={doc.id} className="doc-item">
                <FileText size={18} className="doc-icon" />
                <span>{doc.filename}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel subsection">
          <div className="sub-header">
            <h3><MessageSquare size={20} /> Historial de Chats</h3>
            <button className="btn btn-primary btn-sm" onClick={handleNewChat}>Nuevo Chat</button>
          </div>
          
          <div className="chat-list">
            {chats.length === 0 ? <p className="empty">No hay conversaciones previas.</p> : chats.map(chat => (
              <Link key={chat.id} to={`/assistant/${id}/chat/${chat.id}`} className="chat-item">
                <MessageSquare size={16} />
                <span>Sesión de {new Date(chat.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
