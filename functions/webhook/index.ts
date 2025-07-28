import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request, res: Response) {
  try {
    // Verifica se o token está presente
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    // Verifica se o token é válido
    const { data: webhookConfig, error: webhookError } = await supabase
      .from('webhook_config')
      .select('*')
      .eq('token', token)
      .single();

    if (webhookError || !webhookConfig) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Processa o payload do webhook
    const payload = req.body;
    
    // Valida o formato do payload
    if (!payload || !payload.from || !payload.to || !payload.content) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    // Salva a mensagem no banco de dados
    const { error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          user_id: webhookConfig.user_id,
          from_number: payload.from,
          to_number: payload.to,
          content: payload.content,
          type: payload.type || 'text',
          status: 'received',
          received_at: new Date().toISOString()
        }
      ]);

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
      return res.status(500).json({ error: 'Erro ao processar mensagem' });
    }

    // Processa o fluxo correspondente
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', webhookConfig.user_id)
      .eq('phone_number', payload.to)
      .single();

    if (botError || !bot) {
      console.error('Bot não encontrado:', botError);
      return res.status(404).json({ error: 'Bot não encontrado' });
    }

    // Processa o fluxo
    await processFlow(bot.id, payload);

    res.status(200).json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function processFlow(botId: string, message: any) {
  try {
    // Busca o fluxo ativo do bot
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('*')
      .eq('bot_id', botId)
      .eq('is_active', true)
      .single();

    if (flowError || !flow) {
      console.error('Fluxo não encontrado:', flowError);
      return;
    }

    // Busca o estado atual do fluxo
    const { data: flowState, error: stateError } = await supabase
      .from('flow_states')
      .select('*')
      .eq('bot_id', botId)
      .eq('user_number', message.from)
      .single();

    if (stateError) {
      console.error('Erro ao buscar estado:', stateError);
      return;
    }

    // Se não existe estado, começa do início
    const currentNode = flowState?.current_node || '1';

    // Processa o nó atual
    const node = flow.data.nodes.find(n => n.id === currentNode);
    
    if (!node) {
      console.error('Nó não encontrado:', currentNode);
      return;
    }

    // Se é um nó de condição, verifica a condição
    if (node.type === 'condition') {
      const condition = node.data.conditions.find(cond => 
        evalCondition(cond.condition, message.content)
      );

      if (condition) {
        await updateFlowState(botId, message.from, condition.nextNode);
      }
    } else if (node.type === 'message') {
      // Envia a mensagem de resposta
      await sendMessage(message.from, node.data.content);
      await updateFlowState(botId, message.from, getNextNodeId(node.id));
    }
  } catch (error) {
    console.error('Erro ao processar fluxo:', error);
  }
}

function evalCondition(condition: string, content: string): boolean {
  try {
    // Substitui variáveis pelo conteúdo da mensagem
    const vars = {
      content,
      toLowerCase: () => content.toLowerCase(),
      includes: (str: string) => content.toLowerCase().includes(str.toLowerCase())
    };
    
    return eval(condition);
  } catch (error) {
    console.error('Erro ao avaliar condição:', error);
    return false;
  }
}

async function sendMessage(to: string, content: string) {
  try {
    // Aqui você implementaria a integração com a API do WhatsApp
    console.log('Enviando mensagem para:', to);
    console.log('Conteúdo:', content);

    // Salva o registro de envio
    await supabase.from('messages').insert([
      {
        user_id: process.env.SUPABASE_ANON_KEY,
        from_number: process.env.WHATSAPP_PHONE_NUMBER,
        to_number: to,
        content,
        type: 'text',
        status: 'sending',
        sent_at: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

async function updateFlowState(botId: string, userNumber: string, nextNode: string) {
  try {
    await supabase
      .from('flow_states')
      .upsert([
        {
          bot_id: botId,
          user_number: userNumber,
          current_node: nextNode,
          updated_at: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
  }
}

function getNextNodeId(currentId: string): string {
  // Implemente a lógica para encontrar o próximo nó
  return '2'; // Exemplo
}
