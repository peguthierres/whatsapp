import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const WhatsAppConfig: React.FC = () => {
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

  const handleDeleteToken = async (tokenId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este token?')) return;

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

  const handleTestConnection = async (tokenData: any) => {
    try {
      // Aqui você implementaria a lógica real de teste da conexão
      // Por enquanto, apenas mostraremos uma simulação
      
      alert(`Testando conexão com WhatsApp Business API para o número: ${tokenData.phone_number}`);
    } catch (err) {
      setError('Erro ao testar conexão do WhatsApp.');
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
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium mb-4">Adicionar Novo Token</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nome da Conta
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={newToken.name}
                          onChange={(e) => setNewToken(prev => ({ ...prev, name: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                          Token de Acesso
                        </label>
                        <input
                          type="password"
                          id="token"
                          value={newToken.token}
                          onChange={(e) => setNewToken(prev => ({ ...prev, token: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Número de Telefone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={newToken.phone_number}
                          onChange={(e) => setNewToken(prev => ({ ...prev, phone_number: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="+5511999999999"
                        />
                      </div>

                      <button
                        onClick={handleAddToken}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Adicionar Token
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-4">Tokens Configurados</h2>
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
                                  Ativo
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleTestConnection(token)}
                                  className="text-blue-600 hover:text-blue-500 mr-4"
                                >
                                  Testar
                                </button>
                                <button
                                  onClick={() => handleDeleteToken(token.id)}
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
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-medium mb-4">Documentação</h2>
                    <div className="prose prose-sm max-w-none">
                      <h3>Como obter o Token do WhatsApp Business API</h3>
                      <ol>
                        <li>
                          <p>
                            Acesse a página de configuração do WhatsApp Business API no Meta Developer Portal.
                          </p>
                        </li>
                        <li>
                          <p>
                            Gere um novo token de acesso com as permissões necessárias:
                          </p>
                          <ul>
                            <li>whatsapp_business_management</li>
                            <li>whatsapp_business_messaging</li>
                            <li>whatsapp_business_profile</li>
                          </ul>
                        </li>
                        <li>
                          <p>
                            Copie o token gerado e cole no campo acima.
                          </p>
                        </li>
                        <li>
                          <p>
                            O número de telefone deve ser o mesmo cadastrado na sua conta WhatsApp Business.
                          </p>
                        </li>
                      </ol>

                      <h3>Formato do Número de Telefone</h3>
                      <p>
                        O número deve ser informado no formato internacional, incluindo o código do país:
                      </p>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        +5511999999999
                      </pre>
                      <ul>
                        <li>+55 = Código do Brasil</li>
                        <li>11 = DDD de São Paulo</li>
                        <li>999999999 = Número do celular</li>
                      </ul>

                      <h3>Segurança</h3>
                      <p>
                        Nunca compartilhe seu token de acesso com terceiros. Mantenha-o seguro e faça backup regularmente.
                      </p>
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

export default WhatsAppConfig;
