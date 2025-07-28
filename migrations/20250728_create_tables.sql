-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bots table
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create flows table
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    bot_id UUID REFERENCES bots(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive',
    json_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    bot_id UUID REFERENCES bots(id),
    flow_id UUID REFERENCES flows(id),
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- text, image, document, etc
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, read, failed
    direction VARCHAR(10) NOT NULL, -- incoming, outgoing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    trigger VARCHAR(50) NOT NULL, -- message_received, flow_started, etc
    status VARCHAR(20) DEFAULT 'active',
    last_called TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flow logs table
CREATE TABLE flow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    flow_id UUID REFERENCES flows(id),
    step_number INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL, -- message, options, webhook
    status VARCHAR(20) NOT NULL, -- success, failed, pending
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create environment variables table
CREATE TABLE environment_vars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- Create WhatsApp tokens table
CREATE TABLE whatsapp_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create webhook config table
CREATE TABLE webhook_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    key TEXT NOT NULL,
    permissions TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_vars ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for bots
CREATE POLICY "Users can view their own bots" ON bots
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert bots" ON bots
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots" ON bots
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for flows
CREATE POLICY "Users can view their own flows" ON flows
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert flows" ON flows
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flows" ON flows
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for webhooks
CREATE POLICY "Users can view their own webhooks" ON webhooks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert webhooks" ON webhooks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" ON webhooks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for flow logs
CREATE POLICY "Users can view their own flow logs" ON flow_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policies for environment vars
CREATE POLICY "Users can view their own env vars" ON environment_vars
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert env vars" ON environment_vars
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own env vars" ON environment_vars
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for WhatsApp tokens
CREATE POLICY "Users can view their own tokens" ON whatsapp_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert tokens" ON whatsapp_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON whatsapp_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for webhook config
CREATE POLICY "Users can view their own webhook config" ON webhook_config
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert webhook config" ON webhook_config
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhook config" ON webhook_config
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for API keys
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert API keys" ON api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bots_updated_at
    BEFORE UPDATE ON bots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flows_updated_at
    BEFORE UPDATE ON flows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_logs_updated_at
    BEFORE UPDATE ON flow_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environment_vars_updated_at
    BEFORE UPDATE ON environment_vars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_tokens_updated_at
    BEFORE UPDATE ON whatsapp_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_config_updated_at
    BEFORE UPDATE ON webhook_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
