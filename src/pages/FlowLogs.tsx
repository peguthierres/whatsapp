import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { FlowLog, Flow } from '../types';

export default function FlowLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FlowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    const fetchFlows = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('flows')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFlows(data || []);
        if (data && data.length > 0) {
          setSelectedFlowId(data[0].id);
          fetchFlowLogs(data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar fluxos:', err);
        setError('Erro ao carregar fluxos.');
      }
    };

    fetchFlows();
  }, [user]);

  const fetchFlowLogs = async (flowId: string) => {
    try {
      const { data, error } = await supabase
        .from('flow_logs')
        .select('*')
        .eq('flow_id', flowId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Erro ao carregar logs.');
      setLoading(false);
    }
  };

  const handleFlowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const flowId = e.target.value;
    setSelectedFlowId(flowId);
    fetchFlowLogs(flowId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Logs de Fluxos</h1>
                <div className="relative">
                  <select
                    value={selectedFlowId}
                    onChange={handleFlowChange}
                    className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um fluxo</option>
                    {flows.map((flow) => (
                      <option key={flow.id} value={flow.id}>
                        {flow.name}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Passo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          De
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Para
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detalhes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{log.step}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{log.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' :
                              log.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status}
                            </span>
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

export default FlowLogs;
