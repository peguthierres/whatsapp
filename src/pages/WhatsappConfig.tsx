import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const WhatsappConfig: React.FC = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newToken, setNewToken] = useState({
    name: '',
    token: '',
    phone_number: ''
  });

  useEffect(() => {
    fetchTokens();
  }, [user]);

  const fetchTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setTokens(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar tokens do WhatsApp.');
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!user || !newToken.name || !newToken.token || !newToken.phone_number) return;

    try {
      const { error } = await supabase
        .from('whatsapp_tokens')
        .insert([
          {
            user_id: user.id,
            name: newToken.name,
            token: newToken.token,
            phone_number: newToken.phone_number
          }
        ]);

      if (error) throw error;

      setNewToken({
        name: '',
        token: '',
        phone_number: ''
      });
      fetchTokens();
    } catch (err) {
      setError('Erro ao adicionar token do WhatsApp.');
    }
  };

  const handleUpdateToken = async (tokenId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_tokens')
        .update({ [field]: value })
        .eq('id', tokenId);

      if (error) throw error;

      fetchTokens();
    } catch (err) {
      setError('Erro ao atualizar token do WhatsApp.');
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este token do WhatsApp?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      fetchTokens();
    } catch (err) {
      setError('Erro ao deletar token do WhatsApp.');
    }
  };

  const handleTestConnection = async (tokenId: string) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      if (!token) return;

      // Aqui você implementaria a lógica de teste da conexão com a API do WhatsApp
      // Usando o token e phone_number fornecidos
      
      // Por enquanto, apenas mostraremos uma mensagem de teste
      alert('Teste de conexão implementado aqui');
    } catch (err) {
      setError('Erro ao testar conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Configuração do WhatsApp</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">Adicionar Novo Token</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={newToken.name}
                          onChange={(e) => setNewToken(prev => ({ ...prev, name: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                          Token
                        </label>
                        <input
                          type="password"
                          id="token"
                          value={newToken.token}
                          onChange={(e) => setNewToken(prev => ({ ...prev, token: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                          Número do WhatsApp
                        </label>
                        <input
                          type="tel"
                          id="phone_number"
                          value={newToken.phone_number}
                          onChange={(e) => setNewToken(prev => ({ ...prev, phone_number: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddToken}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Adicionar Token
                    </button>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-4">Tokens Atuais</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tokens.map((token) => (
                            <tr key={token.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{token.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{token.phone_number}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Conectado
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleTestConnection(token.id)}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    Testar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteToken(token.id)}
                                    className="text-red-600 hover:text-red-500"
                                  >
                                    Deletar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

export default WhatsappConfig;
