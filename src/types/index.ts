export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface WhatsAppToken {
  id: string;
  user_id: string;
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
  valid_until: string;
}

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Flow {
  id: string;
  bot_id: string;
  name: string;
  structure_json: FlowStep[];
  created_at: string;
}

export interface FlowStep {
  id: string;
  type: 'message' | 'options' | 'webhook';
  content?: string;
  options?: Array<{
    text: string;
    next: string;
  }>;
  next?: string;
}

export interface Message {
  id: string;
  bot_id: string;
  from: string;
  to: string;
  type: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  url: string;
  trigger: 'new_message' | 'response_sent' | 'flow_completed' | 'error';
  is_active: boolean;
  last_call?: string;
  retry_count: number;
}

export interface FlowLog {
  id: string;
  flow_id: string;
  step: string;
  status: 'success' | 'error';
  result: any;
  payload: any;
  timestamp: string;
}
