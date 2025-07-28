import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const WebhookConfig: React.FC = () => {
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchWebhookUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('webhook_config')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setWebhookUrl(data?.url || '');
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar configuração do webhook.');
        setLoading(false);
      }
    };

    fetchWebhookUrl();
  }, [user]);

  const handleUpdateWebhook = async () => {
    if (!user || !webhookUrl.trim()) return;

    try {
      const { error } = await supabase
        .from('webhook_config')
        .upsert([
          {
            user_id: user.id,
            url: webhookUrl
          }
        ]);

      if (error) throw error;

      setSuccess('Configuração do webhook atualizada com sucesso!');
      setError('');
    } catch (err) {
      setError('Erro ao atualizar configuração do webhook.');
      setSuccess('');
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) return;

    try {
      // Aqui você implementaria a lógica real de teste do webhook
      // Por enquanto, apenas mostraremos uma simulação
      
      alert('Teste de webhook implementado aqui');
    } catch (err) {
      setError('Erro ao testar webhook.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Configuração de Webhook</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="text-sm text-green-700">{success}</div>
                </div>
              )}

              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                      URL do Webhook
                    </label>
                    <input
                      type="url"
                      id="webhookUrl"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://seu-webhook.com/webhook"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleUpdateWebhook}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Salvar Configuração
                    </button>
                    <button
                      onClick={handleTestWebhook}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Testar Webhook
                    </button>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-lg font-medium mb-4">Documentação</h2>
                    <div className="prose prose-sm max-w-none">
                      <p>
                        O webhook receberá requisições POST com o seguinte formato:
                      </p>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {`{
  "event": "message_received",
  "data": {
    "from": "551199999999",
    "to": "551188888888",
    "content": "Mensagem do usuário",
    "timestamp": "2025-07-28T18:36:49-03:00"
  }
}`}
                      </pre>
                      <p>
                        O sistema suporta os seguintes eventos:
                      </p>
                      <ul>
                        <li>message_received</li>
                        <li>message_sent</li>
                        <li>message_delivered</li>
                        <li>message_read</li>
                        <li>flow_started</li>
                        <li>flow_completed</li>
                        <li>error</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookConfig;
