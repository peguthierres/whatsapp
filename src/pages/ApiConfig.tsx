import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const ApiConfig: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  const fetchApiKeys = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setApiKeys(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar chaves de API.');
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!user || !newKey.name || !newKey.permissions.length) return;

    try {
      // Gerar uma chave aleatória segura
      const key = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: user.id,
            name: newKey.name,
            description: newKey.description,
            key,
            permissions: newKey.permissions
          }
        ]);

      if (error) throw error;

      // Limpar formulário
      setNewKey({
        name: '',
        description: '',
        permissions: []
      });

      // Recarregar chaves
      fetchApiKeys();
    } catch (err) {
      setError('Erro ao gerar chave de API.');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm('Tem certeza que deseja revogar esta chave de API?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      fetchApiKeys();
    } catch (err) {
      setError('Erro ao revogar chave de API.');
    }
  };

  const availablePermissions = [
    'bots:read',
    'bots:write',
    'flows:read',
    'flows:write',
    'messages:read',
    'messages:write',
    'webhooks:read',
    'webhooks:write'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Configuração de API</h1>

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
                    <h2 className="text-lg font-medium mb-4">Gerar Nova Chave</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nome da Chave
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={newKey.name}
                          onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          value={newKey.description}
                          onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Permissões
                        </label>
                        <div className="space-y-2">
                          {availablePermissions.map((permission) => (
                            <div key={permission} className="flex items-center">
                              <input
                                id={permission}
                                name="permissions"
                                type="checkbox"
                                checked={newKey.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewKey(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission]
                                    }));
                                  } else {
                                    setNewKey(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission)
                                    }));
                                  }
                                }}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={permission}
                                className="ml-3 block text-sm text-gray-700"
                              >
                                {permission.replace(/:/g, ' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateKey}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Gerar Chave
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-4">Chaves Ativas</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissões</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criada em</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {apiKeys.map((key) => (
                            <tr key={key.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{key.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{key.key.substring(0, 8)}...{key.key.substring(key.key.length - 8)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {key.permissions.join(', ')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(key.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleRevokeKey(key.id)}
                                  className="text-red-600 hover:text-red-500"
                                >
                                  Revogar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-medium mb-4">Documentação da API</h2>
                    <div className="prose prose-sm max-w-none">
                      <p>
                        A API está disponível em <code>https://api.whatsflowx.com</code>
                      </p>
                      <h3>Autenticação</h3>
                      <p>
                        Inclua a chave de API no cabeçalho das requisições:
                      </p>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {`Authorization: Bearer SUA_CHAVE_DE_API`}
                      </pre>
                      <h3>Endpoints Disponíveis</h3>
                      <ul>
                        <li>
                          <code>GET /bots</code> - Listar bots
                        </li>
                        <li>
                          <code>POST /bots</code> - Criar bot
                        </li>
                        <li>
                          <code>GET /flows</code> - Listar fluxos
                        </li>
                        <li>
                          <code>POST /flows</code> - Criar fluxo
                        </li>
                        <li>
                          <code>GET /messages</code> - Listar mensagens
                        </li>
                        <li>
                          <code>POST /messages</code> - Enviar mensagem
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

export default ApiConfig;
