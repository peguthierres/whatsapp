import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Bot, Flow, FlowStep } from '../types';

const MakeFlow: React.FC = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([
    {
      id: '1',
      type: 'message',
      content: 'Olá! Como posso ajudar você hoje?',
      next: '2'
    }
  ]);
  const [activeStep, setActiveStep] = useState<string>('1');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBots = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setBots(data || []);
        if (data && data.length > 0) {
          setSelectedBot(data[0]);
        }
      } catch (err) {
        setError('Erro ao carregar bots.');
      }
    };

    fetchBots();
  }, [user]);

  const addStep = () => {
    const newId = (Math.random() + 1).toString(36).substring(7);
    const newStep: FlowStep = {
      id: newId,
      type: 'message',
      content: '',
      next: ''
    };

    setFlowSteps([...flowSteps, newStep]);
    setActiveStep(newId);
  };

  const updateStep = (stepId: string, field: keyof FlowStep, value: any) => {
    setFlowSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const removeStep = (stepId: string) => {
    if (flowSteps.length <= 1) return;

    setFlowSteps(steps =>
      steps.filter(step => step.id !== stepId)
    );
    setActiveStep(flowSteps[0].id);
  };

  const handleSaveFlow = async () => {
    if (!user || !selectedBot || !flowName) return;

    try {
      const { error } = await supabase
        .from('flows')
        .insert([
          {
            bot_id: selectedBot.id,
            name: flowName,
            description: flowDescription,
            steps: flowSteps,
            is_active: true
          }
        ]);

      if (error) throw error;

      setFlowName('');
      setFlowDescription('');
      setFlowSteps([{
        id: '1',
        type: 'message',
        content: 'Olá! Como posso ajudar você hoje?',
        next: '2'
      }]);
      setActiveStep('1');
    } catch (err) {
      setError('Erro ao salvar fluxo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Criar Fluxo</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Bot</label>
                    <select
                      value={selectedBot?.id || ''}
                      onChange={(e) => {
                        const bot = bots.find(b => b.id === e.target.value);
                        setSelectedBot(bot || null);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione um bot</option>
                      {bots.map((bot) => (
                        <option key={bot.id} value={bot.id}>
                          {bot.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nome do Fluxo</label>
                    <input
                      type="text"
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      value={flowDescription}
                      onChange={(e) => setFlowDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleSaveFlow}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Salvar Fluxo
                  </button>
                </div>

                <div className="col-span-2">
                  <div className="space-y-4">
                    {flowSteps.map((step) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg ${
                          activeStep === step.id ? 'bg-indigo-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Passo {flowSteps.indexOf(step) + 1}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => removeStep(step.id)}
                              className="text-red-600 hover:text-red-500"
                            >
                              Remover
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <select
                            value={step.type}
                            onChange={(e) => updateStep(step.id, 'type', e.target.value as FlowStep['type'])}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="message">Mensagem</option>
                            <option value="options">Opções</option>
                            <option value="webhook">Webhook</option>
                          </select>

                          {step.type === 'message' && (
                            <input
                              type="text"
                              value={step.content || ''}
                              onChange={(e) => updateStep(step.id, 'content', e.target.value)}
                              placeholder="Digite a mensagem"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          )}

                          {step.type === 'options' && (
                            <div className="space-y-2">
                              {step.options?.map((option, index) => (
                                <div key={index} className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => {
                                      const newOptions = [...(step.options || [])];
                                      newOptions[index].text = e.target.value;
                                      updateStep(step.id, 'options', newOptions);
                                    }}
                                    placeholder="Texto da opção"
                                    className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={option.next}
                                    onChange={(e) => {
                                      const newOptions = [...(step.options || [])];
                                      newOptions[index].next = e.target.value;
                                      updateStep(step.id, 'options', newOptions);
                                    }}
                                    placeholder="Próximo passo"
                                    className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [...(step.options || []), { text: '', next: '' }];
                                  updateStep(step.id, 'options', newOptions);
                                }}
                                className="text-indigo-600 hover:text-indigo-500"
                              >
                                Adicionar opção
                              </button>
                            </div>
                          )}

                          {step.type === 'webhook' && (
                            <input
                              type="text"
                              value={step.content || ''}
                              onChange={(e) => updateStep(step.id, 'content', e.target.value)}
                              placeholder="URL do webhook"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          )}

                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">Próximo passo</label>
                            <input
                              type="text"
                              value={step.next || ''}
                              onChange={(e) => updateStep(step.id, 'next', e.target.value)}
                              placeholder="ID do próximo passo"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addStep}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar Passo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeFlow;
