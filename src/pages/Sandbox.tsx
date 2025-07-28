import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Bot, Flow, Message } from '../types';

const Sandbox: React.FC = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchBots();
  }, [user]);

  const fetchBots = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBots(data || []);
      if (data && data.length > 0) {
        setSelectedBot(data[0]);
        fetchFlows(data[0].id);
      }
    } catch (err) {
      setError('Erro ao carregar bots.');
    }
  };

  const fetchFlows = async (botId: string) => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
      if (data && data.length > 0) {
        setSelectedFlow(data[0]);
      }
    } catch (err) {
      setError('Erro ao carregar fluxos.');
    }
  };

  const handleBotChange = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    setSelectedBot(bot || null);
    if (bot) {
      fetchFlows(bot.id);
    }
  };

  const handleFlowChange = async (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    setSelectedFlow(flow || null);
  };

  const handleTestMessage = async () => {
    if (!selectedBot || !selectedFlow || !testMessage.trim()) return;

    try {
      // Aqui você implementaria a lógica real de envio de teste
      // Por enquanto, apenas mostraremos uma simulação
      
      const newMessage: Message = {
        id: Date.now().toString(),
        bot_id: selectedBot.id,
        from: 'test@example.com',
        to: selectedBot.phone_number || '',
        content: testMessage,
        type: 'text',
        status: 'sent',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [newMessage, ...prev]);
      setTestMessage('');
    } catch (err) {
      setError('Erro ao enviar mensagem de teste.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Sandbox - Ambiente de Teste</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-medium mb-4">Selecionar Bot</h2>
                  <select
                    value={selectedBot?.id || ''}
                    onChange={(e) => handleBotChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um bot</option>
                    {bots.map((bot) => (
                      <option key={bot.id} value={bot.id}>
                        {bot.name} - {bot.phone_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Selecionar Fluxo</h2>
                  <select
                    value={selectedFlow?.id || ''}
                    onChange={(e) => handleFlowChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um fluxo</option>
                    {flows.map((flow) => (
                      <option key={flow.id} value={flow.id}>
                        {flow.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Enviar Mensagem de Teste</h2>
                  <div className="space-y-4">
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Digite sua mensagem de teste aqui..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={4}
                    />
                    <button
                      onClick={handleTestMessage}
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Enviar Teste
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.from}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.to}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.status === 'sent' ? 'bg-green-100 text-green-800' :
                            message.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'read' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
