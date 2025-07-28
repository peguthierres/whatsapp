import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CreateBot: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappTokens, setWhatsappTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState('');

  useEffect(() => {
    if (!user) return;
    
    fetchWhatsappTokens();
  }, [user]);

  const fetchWhatsappTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setWhatsappTokens(data || []);
    } catch (err) {
      console.error('Erro ao carregar tokens do WhatsApp:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Você precisa estar logado para criar um bot.');
      setLoading(false);
      return;
    }

    if (!selectedToken) {
      setError('Selecione um token de WhatsApp válido.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bots')
        .insert([
          {
            user_id: user.id,
            name,
            description,
            phone_number: phoneNumber,
            whatsapp_token_id: selectedToken
          }
        ])
        .select()
        .single();

      if (error) throw error;

      navigate(`/bots/${data.id}`);
    } catch (err) {
      setError('Erro ao criar bot. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Criar Novo Bot</h1>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome do Bot
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    placeholder="Ex: Atendimento ao Cliente"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Descreva o propósito do seu bot e suas principais funcionalidades"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Número de Telefone
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+5511999999999"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="whatsappToken" className="block text-sm font-medium text-gray-700">
                    Token do WhatsApp
                  </label>
                  <select
                    id="whatsappToken"
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selecione um token...</option>
                    {whatsappTokens.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.name} - {token.phone_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Criando...
                      </>
                    ) : (
                      'Criar Bot'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Como Usar</h2>
                <div className="prose prose-sm max-w-none">
                  <h3>Passos para Criar um Bot</h3>
                  <ol>
                    <li>
                      <p>
                        Configure um token do WhatsApp na seção de configuração.
                      </p>
                    </li>
                    <li>
                      <p>
                        Preencha o nome e descrição do bot.
                      </p>
                    </li>
                    <li>
                      <p>
                        Informe o número de telefone que o bot usará.
                      </p>
                    </li>
                    <li>
                      <p>
                        Selecione um token de WhatsApp configurado.
                      </p>
                    </li>
                    <li>
                      <p>
                        Clique em "Criar Bot" para finalizar.
                      </p>
                    </li>
                  </ol>

                  <h3>Dicas</h3>
                  <ul>
                    <li>
                      Use nomes descritivos para seus bots.
                    </li>
                    <li>
                      Mantenha a descrição clara e objetiva.
                    </li>
                    <li>
                      Verifique se o número de telefone está no formato correto (+5511999999999).
                    </li>
                    <li>
                      Certifique-se de ter um token do WhatsApp configurado.
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

export default CreateBot;
