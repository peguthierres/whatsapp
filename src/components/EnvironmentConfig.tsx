import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const EnvironmentConfig: React.FC = () => {
  const { user } = useAuth();
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newVariable, setNewVariable] = useState({
    key: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    fetchVariables();
  }, [user]);

  const fetchVariables = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('environment_vars')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setVariables(data || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar variáveis de ambiente.');
      setLoading(false);
    }
  };

  const handleAddVariable = async () => {
    if (!user || !newVariable.key || !newVariable.value) return;

    try {
      const { error } = await supabase
        .from('environment_vars')
        .insert([
          {
            user_id: user.id,
            key: newVariable.key,
            value: newVariable.value,
            description: newVariable.description
          }
        ]);

      if (error) throw error;

      setNewVariable({
        key: '',
        value: '',
        description: ''
      });

      fetchVariables();
    } catch (err) {
      setError('Erro ao adicionar variável de ambiente.');
    }
  };

  const handleDeleteVariable = async (variableId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta variável?')) return;

    try {
      const { error } = await supabase
        .from('environment_vars')
        .delete()
        .eq('id', variableId);

      if (error) throw error;

      fetchVariables();
    } catch (err) {
      setError('Erro ao deletar variável de ambiente.');
    }
  };

  const handleUpdateVariable = async (variable: any) => {
    if (!user || !variable.key || !variable.value) return;

    try {
      const { error } = await supabase
        .from('environment_vars')
        .update({
          value: variable.value,
          description: variable.description
        })
        .eq('id', variable.id);

      if (error) throw error;

      fetchVariables();
    } catch (err) {
      setError('Erro ao atualizar variável de ambiente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Configuração de Ambiente</h1>

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
                    <h2 className="text-lg font-medium mb-4">Adicionar Nova Variável</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                          Nome da Variável
                        </label>
                        <input
                          type="text"
                          id="key"
                          value={newVariable.key}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="NOME_VARIAVEL"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                          Valor
                        </label>
                        <input
                          type="text"
                          id="value"
                          value={newVariable.value}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          value={newVariable.description}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          rows={3}
                        />
                      </div>

                      <button
                        onClick={handleAddVariable}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Adicionar Variável
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-4">Variáveis Configuradas</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {variables.map((variable) => (
                            <tr key={variable.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{variable.key}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{variable.value}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{variable.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setNewVariable({
                                      key: variable.key,
                                      value: variable.value,
                                      description: variable.description
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-500 mr-4"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteVariable(variable.id)}
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
                    <h2 className="text-lg font-medium mb-4">Como Usar</h2>
                    <div className="prose prose-sm max-w-none">
                      <p>
                        As variáveis de ambiente podem ser usadas em seus fluxos e mensagens usando a sintaxe:
                      </p>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {{nome_variavel}}
                      </pre>
                      <p>
                        Por exemplo, se você tem uma variável chamada <code>EMPRESA_NOME</code>, você pode usar assim:
                      </p>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        Olá! Bem-vindo à {{EMPRESA_NOME}}
                      </pre>

                      <h3>Regras para Nomes de Variáveis</h3>
                      <ul>
                        <li>Somente letras maiúsculas e números</li>
                        <li>Use underline (_) para separar palavras</li>
                        <li>Não use espaços ou caracteres especiais</li>
                        <li>Deve começar com uma letra</li>
                      </ul>

                      <h3>Boas Práticas</h3>
                      <ul>
                        <li>Use nomes descritivos e claros</li>
                        <li>Adicione descrições detalhadas</li>
                        <li>Atualize regularmente valores importantes</li>
                        <li>Remova variáveis que não são mais usadas</li>
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

export default EnvironmentConfig;
