export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: {
    phone?: string;
    full_name?: string;
    avatar_url?: string;
    company?: string;
    is_admin?: boolean;
  };
}

export interface Bot {
  id: string;
  name: string;
  phone?: string;
  whatsapp_token: string;
  active: boolean;
  created_at: string;
  last_activity_at: string | null;
  user_id: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  last_execution: string | null;
  bot_id: string;
  user_id: string;
}

export interface Message {
  id: string;
  content: string;
  direction: 'in' | 'out';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  flow_id: string;
  bot_id: string;
  from: string;
  to: string;
  type: string;
}

export interface FlowLog {
  id: string;
  flow_id: string;
  timestamp: string;
  step: string;
  type: string;
  details: string;
  status: 'success' | 'error' | 'warning';
  from?: string;
  to?: string;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  encrypted: boolean;
  created_at: string;
  bot_id: string;
}
