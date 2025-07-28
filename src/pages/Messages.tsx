import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Message } from '../types';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [bots, setBots] = useState<any[]>([]);

  useEffect(() => {
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
          setSelectedBotId(data[0].id);
          fetchMessages(data[0].id);
        }
      } catch (err) {
        setError('Erro ao carregar bots.');
      }
    };

    fetchBots();
  }, [user]);

  const fetchMessages = async (botId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('bot_id', botId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar mensagens.');
      setLoading(false);
    }
  };

  const handleBotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const botId = e.target.value;
    setSelectedBotId(botId);
    fetchMessages(botId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mensagens</h1>
                <div className="relative">
                  <select
                    value={selectedBotId}
                    onChange={handleBotChange}
                    className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um bot</option>
                    {bots.map((bot) => (
                      <option key={bot.id} value={bot.id}>
                        {bot.name}
                      </option>
                    ))}
                  </select>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
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
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {message.type}
                            </span>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
