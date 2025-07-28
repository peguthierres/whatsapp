import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const WebhookConfig: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testResponse, setTestResponse] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setConfig(data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar configuração do webhook.');
      setLoading(false);
    }
  };

  const handleSaveConfig = async (url: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('webhook_config')
        .upsert([
          {
            user_id: user.id,
            url
          }
        ]);

      if (error) throw error;

      setConfig({ url });
      setError('');
    } catch (err) {
      setError('Erro ao salvar configuração do webhook.');
    }
  };

  const handleTestWebhook = async () => {
    if (!config?.url) {
      setError('Configure um URL de webhook primeiro.');
      return;
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: {
            message: 'Teste de webhook do WhatsFlowX'
          }
        })
      });

      const result = await response.json();
      setTestResponse(result);
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

              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium mb-4">URL do Webhook</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                          URL do Webhook
                        </label>
                        <input
                          type="url"
                          id="webhookUrl"
                          value={config?.url || ''}
                          onChange={(e) => handleSaveConfig(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="https://seu-webhook.com/webhook"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Eventos Suportados
                        </label>
                        <div className="prose prose-sm max-w-none">
                          <ul>
                            <li>message_received</li>
                            <li>message_sent</li>
                            <li>message_delivered</li>
                            <li>message_read</li>
                            <li>flow_started</li>
                            <li>flow_completed</li>
                            <li>error</li>
                          </ul>

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
                        </div>
                      </div>

                      <button
                        onClick={handleTestWebhook}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Testar Webhook
                      </button>
                    </div>
                  </div>

                  {testResponse && (
                    <div>
                      <h2 className="text-lg font-medium mb-4">Resposta do Teste</h2>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {JSON.stringify(testResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-medium mb-4">Documentação</h2>
                    <div className="prose prose-sm max-w-none">
                      <h3>Como Configurar</h3>
                      <ol>
                        <li>
                          <p>
                            Configure o URL do seu webhook acima.
                          </p>
                        </li>
                        <li>
                          <p>
                            O webhook receberá requisições POST com o formato JSON.
                          </p>
                        </li>
                        <li>
                          <p>
                            Implemente a lógica de processamento no seu servidor.
                          </p>
                        </li>
                      </ol>

                      <h3>Segurança</h3>
                      <ul>
                        <li>
                          Use HTTPS para garantir segurança.
                        </li>
                        <li>
                          Implemente autenticação no seu webhook.
                        </li>
                        <li>
                          Valide o conteúdo recebido.
                        </li>
                        <li>
                          Monitore o desempenho e erros.
                        </li>
                      </ul>

                      <h3>Boas Práticas</h3>
                      <ul>
                        <li>
                          Responda rapidamente (dentro de 5 segundos).
                        </li>
                        <li>
                          Mantenha logs de todas as requisições.
                        </li>
                        <li>
                          Implemente retry mechanism.
                        </li>
                        <li>
                          Monitore o tempo de resposta.
                        </li>
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
