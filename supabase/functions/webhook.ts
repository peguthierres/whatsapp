import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    const body = await req.json();
    const headers = req.headers;

    // Validate WhatsApp webhook signature
    const signature = headers.get("x-hub-signature-256");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // Process incoming WhatsApp messages
    if (body?.object === "whatsapp_business_account" && body?.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const fromNumber = message.from;
      const content = message.text?.body || message.image?.caption || message.document?.caption || "";

      // Get bot configuration
      const { data: botData, error: botError } = await supabase
        .from("whatsapp_tokens")
        .select("user_id, bot_id")
        .eq("phone_number", fromNumber.substring(1)) // Remove leading +
        .single();

      if (botError) {
        console.error("Error fetching bot configuration:", botError);
        return new Response("Bot not found", { status: 404 });
      }

      // Save message to database
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          user_id: botData.user_id,
          bot_id: botData.bot_id,
          from_number: fromNumber,
          to_number: message.to,
          content,
          type: "text", // TODO: Handle other message types
          direction: "incoming",
          status: "received"
        });

      if (messageError) {
        console.error("Error saving message:", messageError);
        return new Response("Error saving message", { status: 500 });
      }

      // Process webhook triggers
      const { data: webhookData } = await supabase
        .from("webhooks")
        .select("url, trigger")
        .eq("user_id", botData.user_id)
        .eq("status", "active");

      for (const webhook of webhookData) {
        if (webhook.trigger === "message_received") {
          try {
            await fetch(webhook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                event: "message_received",
                data: {
                  from: fromNumber,
                  to: message.to,
                  content,
                  timestamp: new Date().toISOString()
                }
              })
            });
          } catch (error) {
            console.error("Error sending webhook:", error);
          }
        }
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Not implemented", { status: 404 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
