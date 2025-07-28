import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Bot } from '../types';
import { Link } from 'react-router-dom';

const Bots: React.FC = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBots = async () => {
      if (!user) return;

      try {
    fetchBots();
  }, [user, searchTerm]);

  const fetchBots = async () => {
    if (!user) return;

    try {
      const query = supabase
        .from('bots')
        .select('*')
        .eq('user_id', user.id);

      if (searchTerm) {
        query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBots(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar bots.');
      setLoading(false);
    }
  };

  const handleDelete = async (botId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este bot?')) return;

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);

      if (error) throw error;

      fetchBots();
    } catch (err) {
      setError('Erro ao deletar bot.');
    }
  };

  const handleEdit = (botId: string) => {
    navigate(`/bots/${botId}/edit`);
  };

  const handleViewLogs = (botId: string) => {
    navigate(`/bots/${botId}/logs`);
  };

  const handleViewFlows = (botId: string) => {
    navigate(`/bots/${botId}/flows`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold">Bots</h1>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar bots..."
                      className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/bots/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Criar Novo Bot
                </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Atividade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bots.map((bot) => (
                        <tr key={bot.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{bot.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bot.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bot.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {bot.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(bot.last_activity_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(bot.id)}
                              className="text-indigo-600 hover:text-indigo-500 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleViewFlows(bot.id)}
                              className="text-blue-600 hover:text-blue-500 mr-4"
                            >
                              Fluxos
                            </button>
                            <button
                              onClick={() => handleViewLogs(bot.id)}
                              className="text-gray-600 hover:text-gray-500 mr-4"
                            >
                              Logs
                            </button>
                            <button
                              onClick={() => handleDelete(bot.id)}
                              className="text-red-600 hover:text-red-500"
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

              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Como Usar</h2>
                <div className="prose prose-sm max-w-none">
                  <h3>Gerenciando Bots</h3>
                  <ul>
                    <li>
                      <p>
                        Use a barra de busca para encontrar bots específicos.
                      </p>
                    </li>
                    <li>
                      <p>
                        Clique em "Editar" para modificar as configurações do bot.
                      </p>
                    </li>
                    <li>
                      <p>
                        Visualize os fluxos associados ao bot.
                      </p>
                    </li>
                    <li>
                      <p>
                        Acesse os logs para acompanhar o desempenho do bot.
                      </p>
                    </li>
                    <li>
                      <p>
                        Use "Deletar" com cautela, pois esta ação não pode ser desfeita.
                      </p>
                    </li>
                  </ul>

                  <h3>Dicas</h3>
                  <ul>
                    <li>
                      Mantenha os bots organizados com nomes descritivos.
                    </li>
                    <li>
                      Monitore regularmente os logs para identificar problemas.
                    </li>
                    <li>
                      Configure os fluxos de acordo com o propósito do bot.
                    </li>
                    <li>
                      Mantenha os tokens do WhatsApp atualizados.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bots;
