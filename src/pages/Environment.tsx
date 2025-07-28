import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Environment: React.FC = () => {
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
        .from('environment_variables')
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
        .from('environment_variables')
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
      setError('Erro ao adicionar variável.');
    }
  };

  const handleUpdateVariable = async (variableId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('environment_variables')
        .update({ [field]: value })
        .eq('id', variableId);

      if (error) throw error;

      fetchVariables();
    } catch (err) {
      setError('Erro ao atualizar variável.');
    }
  };

  const handleDeleteVariable = async (variableId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta variável?')) return;

    try {
      const { error } = await supabase
        .from('environment_variables')
        .delete()
        .eq('id', variableId);

      if (error) throw error;

      fetchVariables();
    } catch (err) {
      setError('Erro ao deletar variável.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Configurações de Ambiente</h1>

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
                    <h2 className="text-lg font-medium mb-4">Adicionar Nova Variável</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                          Chave
                        </label>
                        <input
                          type="text"
                          id="key"
                          value={newVariable.key}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                          Valor
                        </label>
                        <input
                          type="text"
                          id="value"
                          value={newVariable.value}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <input
                          type="text"
                          id="description"
                          value={newVariable.description}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddVariable}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-4">Variáveis Atuais</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave</th>
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
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={variable.value}
                                    onChange={(e) => handleUpdateVariable(variable.id, 'value', e.target.value)}
                                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                  <button
                                    onClick={() => handleDeleteVariable(variable.id)}
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

export default Environment;
