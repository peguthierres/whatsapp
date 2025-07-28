import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import CreateBot from './pages/CreateBot';
import Flows from './pages/Flows';
import MakeFlow from './pages/MakeFlow';
import Messages from './pages/Messages';
import Webhooks from './pages/Webhooks';
import FlowLogs from './pages/FlowLogs';
import Profile from './pages/Profile';
import Environment from './pages/Environment';
import WhatsappConfig from './pages/WhatsappConfig';
import Sandbox from './pages/Sandbox';
import WebhookConfig from './pages/WebhookConfig';
import ApiConfig from './pages/ApiConfig';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bots" element={<Bots />} />
            <Route path="create-bot" element={<CreateBot />} />
            <Route path="flows" element={<Flows />} />
            <Route path="make-flow" element={<MakeFlow />} />
            <Route path="messages" element={<Messages />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="flow-logs" element={<FlowLogs />} />
            <Route path="profile" element={<Profile />} />
            <Route path="environment" element={<Environment />} />
            <Route path="whatsapp-config" element={<WhatsappConfig />} />
            <Route path="sandbox" element={<Sandbox />} />
            <Route path="webhook-config" element={<WebhookConfig />} />
            <Route path="api-config" element={<ApiConfig />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
