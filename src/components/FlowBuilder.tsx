import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    content?: string;
    conditions?: Array<{
      condition: string;
      nextNode: string;
    }>;
  };
  position: {
    x: number;
    y: number;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
}

const FlowBuilder: React.FC = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'input',
      data: { label: 'Início' },
      position: { x: 0, y: 0 }
    }
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [error, setError] = useState('');

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: Math.random().toString(),
      type,
      data: {
        label: type === 'message' ? 'Nova Mensagem' : 'Nova Condição',
        content: type === 'message' ? '' : undefined,
        conditions: type === 'condition' ? [] : undefined
      },
      position: { x: 200, y: 200 }
    };

    setNodes(prev => [...prev, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este nó?')) return;

    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  };

  const handleAddEdge = (sourceId: string, targetId: string) => {
    const newEdge: Edge = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep'
    };

    setEdges(prev => [...prev, newEdge]);
  };

  const handleSaveFlow = async () => {
    if (!user) {
      setError('Você precisa estar logado para salvar o fluxo.');
      return;
    }

    try {
      const flowData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
          position: node.position
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type
        }))
      };

      const { error } = await supabase
        .from('flows')
        .insert([
          {
            user_id: user.id,
            name: 'Novo Fluxo',
            data: flowData,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setError('');
    } catch (err) {
      setError('Erro ao salvar o fluxo. Por favor, tente novamente.');
    }
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Construtor de Fluxos</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAddNode('message')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar Mensagem
                  </button>
                  <button
                    onClick={() => handleAddNode('condition')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar Condição
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="relative h-[600px] bg-gray-50 rounded-lg p-4">
                {/* Aqui você implementaria o canvas do flow */}
                <div className="grid grid-cols-12 gap-4">
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`p-4 rounded-lg shadow-sm ${
                        selectedNode?.id === node.id
                          ? 'bg-indigo-50 border-indigo-300 border-2'
                          : 'bg-white'
                      }`}
                      onClick={() => handleNodeClick(node)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">
                          {node.data.label}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      {node.type === 'message' && (
                        <textarea
                          value={node.data.content || ''}
                          onChange={(e) => {
                            setNodes(prev =>
                              prev.map(n =>
                                n.id === node.id
                                  ? { ...n, data: { ...n.data, content: e.target.value } }
                                  : n
                              )
                            );
                          }}
                          className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                          placeholder="Digite a mensagem aqui..."
                        />
                      )}
                      {node.type === 'condition' && (
                        <div className="space-y-2">
                          {node.data.conditions?.map((cond, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={cond.condition}
                                onChange={(e) => {
                                  setNodes(prev =>
                                    prev.map(n =>
                                      n.id === node.id
                                        ? {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              conditions: n.data.conditions?.map((c, i) =>
                                                i === index ? { ...c, condition: e.target.value } : c
                                              )
                                            }
                                          }
                                        : n
                                    )
                                  );
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                placeholder="Condição"
                              />
                              <select
                                value={cond.nextNode || ''}
                                onChange={(e) => {
                                  setNodes(prev =>
                                    prev.map(n =>
                                      n.id === node.id
                                        ? {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              conditions: n.data.conditions?.map((c, i) =>
                                                i === index ? { ...c, nextNode: e.target.value } : c
                                              )
                                            }
                                          }
                                        : n
                                    )
                                  );
                                }}
                                className="p-2 border border-gray-300 rounded-md"
                              >
                                <option value="">Selecione o próximo nó</option>
                                {nodes.map((n) => (
                                  <option key={n.id} value={n.id}>
                                    {n.data.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNodes(prev =>
                                    prev.map(n =>
                                      n.id === node.id
                                        ? {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              conditions: n.data.conditions?.filter((_, i) => i !== index)
                                            }
                                          }
                                        : n
                                    )
                                  );
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setNodes(prev =>
                                prev.map(n =>
                                  n.id === node.id
                                    ? {
                                        ...n,
                                        data: {
                                          ...n.data,
                                          conditions: [...(n.data.conditions || []), { condition: '', nextNode: '' }]
                                        }
                                      }
                                    : n
                                )
                              );
                            }}
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            + Adicionar Condição
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveFlow}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Salvar Fluxo
                </button>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Como Usar</h2>
                <div className="prose prose-sm max-w-none">
                  <h3>Construindo Fluxos</h3>
                  <ol>
                    <li>
                      <p>
                        Clique em "Adicionar Mensagem" para criar um nó de mensagem.
                      </p>
                    </li>
                    <li>
                      <p>
                        Clique em "Adicionar Condição" para criar um nó de condição.
                      </p>
                    </li>
                    <li>
                      <p>
                        Edite o conteúdo dos nós clicando neles.
                      </p>
                    </li>
                    <li>
                      <p>
                        Configure condições para redirecionar o fluxo.
                      </p>
                    </li>
                    <li>
                      <p>
                        Use "Salvar Fluxo" para salvar seu trabalho.
                      </p>
                    </li>
                  </ol>

                  <h3>Tipos de Nós</h3>
                  <ul>
                    <li>
                      <p>
                        <strong>Mensagem:</strong> Para enviar mensagens ao usuário.
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong>Condição:</strong> Para criar ramificações no fluxo.
                      </p>
                    </li>
                  </ul>

                  <h3>Dicas</h3>
                  <ul>
                    <li>
                      Comece com um nó de mensagem inicial.
                    </li>
                    <li>
                      Use condições para criar fluxos complexos.
                    </li>
                    <li>
                      Mantenha os nós organizados e claros.
                    </li>
                    <li>
                      Teste seu fluxo antes de colocar em produção.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
