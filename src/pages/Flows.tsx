import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Flow, Bot } from '../types';
import { Link } from 'react-router-dom';

export default function Flows() {
  const { user } = useAuth();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

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
          setSelectedBot(data[0]);
          fetchFlows(data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar bots:', err);
        setError('Erro ao carregar bots.');
      }
    };

    fetchBots();
  }, [user]);

  const fetchFlows = async (botId: string) => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar fluxos:', err);
      setError('Erro ao carregar fluxos.');
      setLoading(false);
    }
  };

  const handleBotChange = async (botId: string) => {
    const bot = bots.find((b) => b.id === botId);
    setSelectedBot(bot || null);
    fetchFlows(botId);
  };

  const handleToggleActive = async (flowId: string) => {
    try {
      const flow = flows.find((f) => f.id === flowId);
      if (!flow) return;

      const { error } = await supabase
        .from('flows')
        .update({ active: !flow.active })
        .eq('id', flowId);

      if (error) throw error;

      setFlows(flows.map((f) =>
        f.id === flowId ? { ...f, active: !f.active } : f
      ));
    } catch (err) {
      console.error('Erro ao atualizar fluxo:', err);
      setError('Erro ao atualizar fluxo.');
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este fluxo?')) return;

    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId);

      if (error) throw error;

      setFlows(flows.filter((f) => f.id !== flowId));
    } catch (err) {
      console.error('Erro ao deletar fluxo:', err);
      setError('Erro ao deletar fluxo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Fluxos</h1>
                <div className="flex space-x-4">
                  <select
                    value={selectedBot?.id || ''}
                    onChange={(e) => handleBotChange(e.target.value)}
                    className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um bot</option>
                    {bots.map((bot) => (
                      <option key={bot.id} value={bot.id}>
                        {bot.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/make-flow"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Criar Novo Fluxo
                  </Link>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última execução</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {flows.map((flow) => (
                        <tr key={flow.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{flow.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{flow.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              flow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {flow.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {flow.last_execution ? new Date(flow.last_execution).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleActive(flow.id)}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                                flow.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {flow.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleDeleteFlow(flow.id)}
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

export default Flows;
