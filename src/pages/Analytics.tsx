import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeBots: 0,
    activeFlows: 0,
    successfulFlows: 0,
    failedFlows: 0,
    averageResponseTime: 0,
    messageVolume: [] as { date: string; count: number }[],
    flowPerformance: [] as { flow: string; success: number; failure: number }[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch message statistics
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('user_id', user.id);

      if (messageError) throw messageError;

      // Fetch bot statistics
      const { data: botData, error: botError } = await supabase
        .from('bots')
        .select('id, status')
        .eq('user_id', user.id);

      if (botError) throw botError;

      // Fetch flow statistics
      const { data: flowData, error: flowError } = await supabase
        .from('flows')
        .select('id, status')
        .eq('user_id', user.id);

      if (flowError) throw flowError;

      // Fetch flow logs
      const { data: logData, error: logError } = await supabase
        .from('flow_logs')
        .select('flow_id, status, created_at')
        .eq('user_id', user.id);

      if (logError) throw logError;

      // Calculate statistics
      const totalMessages = messageData?.length || 0;
      const activeBots = botData?.filter(bot => bot.status === 'active').length || 0;
      const activeFlows = flowData?.filter(flow => flow.status === 'active').length || 0;
      
      // Calculate flow performance
      const flowPerformance = flowData?.map(flow => {
        const flowLogs = logData?.filter(log => log.flow_id === flow.id);
        const success = flowLogs?.filter(log => log.status === 'success').length || 0;
        const failure = flowLogs?.filter(log => log.status === 'failure').length || 0;
        return {
          flow: flow.id,
          success,
          failure
        };
      }) || [];

      // Calculate message volume by date
      const messageVolume = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const count = messageData?.filter(
          msg => new Date(msg.created_at).toDateString() === date.toDateString()
        ).length || 0;
        return {
          date: date.toDateString(),
          count
        };
      });

      // Calculate average response time
      const averageResponseTime = 0; // Implementar cálculo real

      setStats({
        totalMessages,
        activeBots,
        activeFlows,
        successfulFlows: flowPerformance.reduce((sum, item) => sum + item.success, 0),
        failedFlows: flowPerformance.reduce((sum, item) => sum + item.failure, 0),
        averageResponseTime,
        messageVolume,
        flowPerformance
      });
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar estatísticas.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Analytics</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Total de Mensagens
                              </dt>
                              <dd className="text-lg font-semibold text-gray-900">
                                {stats.totalMessages.toLocaleString()}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Bots Ativos
                              </dt>
                              <dd className="text-lg font-semibold text-gray-900">
                                {stats.activeBots}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Fluxos Ativos
                              </dt>
                              <dd className="text-lg font-semibold text-gray-900">
                                {stats.activeFlows}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                          Volume de Mensagens
                        </h3>
                        <div className="flex flex-col">
                          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Volume
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.messageVolume.map((item, index) => (
                                      <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.count.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                          Performance dos Fluxos
                        </h3>
                        <div className="flex flex-col">
                          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fluxo
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sucesso
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Falha
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Taxa de Sucesso
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.flowPerformance.map((item, index) => (
                                      <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          Fluxo {item.flow}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                          {item.success.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                          {item.failure.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {((item.success / (item.success + item.failure)) * 100).toFixed(1)}%
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Métricas Gerais
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-6 w-6 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">
                                    Fluxos Sucessos
                                  </dt>
                                  <dd className="text-lg font-semibold text-gray-900">
                                    {stats.successfulFlows.toLocaleString()}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-6 w-6 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">
                                    Fluxos Falhados
                                  </dt>
                                  <dd className="text-lg font-semibold text-gray-900">
                                    {stats.failedFlows.toLocaleString()}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-6 w-6 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">
                                    Tempo Médio de Resposta
                                  </dt>
                                  <dd className="text-lg font-semibold text-gray-900">
                                    {stats.averageResponseTime.toFixed(2)}s
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Analytics;
