import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Webhook } from '../types';

const Webhooks: React.FC = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [trigger, setTrigger] = useState('new_message');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchWebhooks();
  }, [user]);

  const fetchWebhooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('last_call', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar webhooks.');
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!user || !url) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .insert([
          {
            user_id: user.id,
            url,
            trigger,
            is_active: isActive,
            retry_count: 0
          }
        ]);

      if (error) throw error;

      setUrl('');
      setTrigger('new_message');
      setIsActive(true);
      fetchWebhooks();
    } catch (err) {
      setError('Erro ao criar webhook.');
    }
  };

  const handleToggleActive = async (webhookId: string) => {
    try {
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) return;

      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !webhook.is_active })
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(webhooks.map(w =>
        w.id === webhookId ? { ...w, is_active: !w.is_active } : w
      ));
    } catch (err) {
      setError('Erro ao atualizar webhook.');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(webhooks.filter(w => w.id !== webhookId));
    } catch (err) {
      setError('Erro ao deletar webhook.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Webhooks</h1>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="URL do webhook"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="new_message">Nova mensagem</option>
                    <option value="response_sent">Resposta enviada</option>
                    <option value="flow_completed">Fluxo concluído</option>
                    <option value="error">Erro</option>
                  </select>
                  <button
                    onClick={handleCreateWebhook}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gatilho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última chamada</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentativas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {webhooks.map((webhook) => (
                        <tr key={webhook.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{webhook.url}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {webhook.trigger.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {webhook.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {webhook.last_call ? new Date(webhook.last_call).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {webhook.retry_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleActive(webhook.id)}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                                webhook.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {webhook.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              Deletar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
