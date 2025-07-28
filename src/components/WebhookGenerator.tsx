import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const WebhookGenerator: React.FC = () => {
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      generateWebhook();
    }
  }, [user]);

  const generateWebhook = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Gere um token aleatório seguro
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      setToken(token);

      // Crie uma URL única para o webhook
      const webhookUrl = `https://${process.env.REACT_APP_SUPABASE_PROJECT_REF}.supabase.co/functions/webhook?token=${token}`;
      setWebhookUrl(webhookUrl);

      // Salve no banco de dados
      const { error: dbError } = await supabase
        .from('webhook_config')
        .upsert([
          {
            user_id: user.id,
            url: webhookUrl,
            token,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setSuccess('Webhook gerado com sucesso!');
    } catch (err) {
      setError('Erro ao gerar webhook. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('URL copiada para área de transferência!');
    } catch (err) {
      setError('Erro ao copiar para área de transferência.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Gerador de Webhook</h1>

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

              <div className="space-y-6">
                <div>
                  <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="webhookUrl"
                      value={webhookUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                {token && (
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                      Token de Segurança
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id="token"
                        value={token}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => copyToClipboard(token)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    onClick={generateWebhook}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando...
                      </>
                    ) : (
                      'Gerar Novo Webhook'
                    )}
                  </button>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-medium mb-4">Como Usar</h2>
                  <div className="prose prose-sm max-w-none">
                    <h3>Configuração do Webhook</h3>
                    <ol>
                      <li>
                        <p>
                          Clique em "Gerar Novo Webhook" para criar uma URL única.
                        </p>
                      </li>
                      <li>
                        <p>
                          Copie a URL gerada e configure-a no Meta Developer Portal.
                        </p>
                      </li>
                      <li>
                        <p>
                          O token de segurança é necessário para autenticação.
                        </p>
                      </li>
                      <li>
                        <p>
                          O webhook receberá automaticamente as mensagens do WhatsApp.
                        </p>
                      </li>
                    </ol>

                    <h3>Formato do Payload</h3>
                    <pre className="bg-gray-100 p-4 rounded-md">
                      {`{
  "event": "message_received",
  "timestamp": "2025-07-28T21:49:48-03:00",
  "data": {
    "from": "5511999999999",
    "to": "5511888888888",
    "content": "Mensagem do usuário",
    "type": "text"
  }
}`}
                    </pre>

                    <h3>Segurança</h3>
                    <ul>
                      <li>
                        <p>
                          Mantenha o token de segurança em local seguro.
                        </p>
                      </li>
                      <li>
                        <p>
                          Não compartilhe a URL do webhook publicamente.
                        </p>
                      </li>
                      <li>
                        <p>
                          O token é necessário para autenticação.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookGenerator;
