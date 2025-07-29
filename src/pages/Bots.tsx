import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Bot } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Bots() {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBots = async () => {
      if (!user) return;

      try {
        fetchBots();
      } catch (error) {
        console.error('Erro ao buscar bots:', error);
        setError('Erro ao carregar bots.');
      }
    };
    fetchBots();
  }, [user]);

  useEffect(() => {
    const fetchBots = async () => {
      if (!user) return;

      try {
        fetchBots();
      } catch (error) {
        console.error('Erro ao buscar bots:', error);
        setError('Erro ao carregar bots.');
      }
    };
    fetchBots();
  }, [user, searchTerm]);

  const fetchBots = async () => {
    try {
      const query = supabase
        .from('bots')
        .select('*')
        .eq('user_id', user?.id)
        .ilike('name', `%${searchTerm}%`)
        .or(`phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setBots(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar bots:', err);
      setError('Erro ao carregar bots.');
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este bot?')) return;

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);

      if (error) throw error;
      setBots(bots.filter(bot => bot.id !== botId));
    } catch (err) {
      console.error('Erro ao deletar bot:', err);
      setError('Erro ao deletar bot.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bots</h1>
        <Link
          to="/bots/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Novo Bot
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar bots..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Atividade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                  <div className="text-sm font-medium text-gray-900">
                    {bot.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{bot.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {bot.last_activity_at ?
                      new Date(bot.last_activity_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Nunca'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bot.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bot.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/bots/${bot.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Como Usar</h2>
        <div className="prose prose-sm max-w-none">
          <h3>Gerenciando Bots</h3>
          <ul>
            <li>
              <p>Use a barra de busca para encontrar bots específicos.</p>
            </li>
            <li>
              <p>Clique em "Editar" para modificar as configurações do bot.</p>
            </li>
            <li>
              <p>Visualize os fluxos associados ao bot.</p>
            </li>
            <li>
              <p>Acesse os logs para acompanhar o desempenho do bot.</p>
            </li>
            <li>
              <p>Use "Deletar" com cautela, pois esta ação não pode ser desfeita.</p>
            </li>
          </ul>

          <h3>Dicas</h3>
          <ul>
            <li>Mantenha os bots organizados com nomes descritivos.</li>
            <li>Monitore regularmente os logs para identificar problemas.</li>
            <li>Configure os fluxos de acordo com o propósito do bot.</li>
            <li>Mantenha os tokens do WhatsApp atualizados.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Bots;
