import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Bot, Message } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Buscar bots do usuário
        const { data: botsData, error: botsError } = await supabase
          .from('bots')
          .select('*')
          .eq('user_id', user.id);

        if (botsError) throw botsError;
        setBots(botsData || []);

        // Buscar mensagens recentes
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('bot_id', botsData?.[0]?.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Bots Ativos</h3>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{bots.filter(bot => bot.is_active).length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Mensagens Recebidas</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{messages.length}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Fluxos Ativos</h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">{bots.length}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Últimas Mensagens</h2>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{message.from}</p>
                          <p className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          message.status === 'sent' ? 'bg-green-100 text-green-800' :
                          message.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          message.status === 'read' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
