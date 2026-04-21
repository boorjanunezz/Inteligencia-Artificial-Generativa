import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AssistantDetail from './pages/AssistantDetail';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assistant/:id" element={<AssistantDetail />} />
            <Route path="/assistant/:id/chat/:sessionId?" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
