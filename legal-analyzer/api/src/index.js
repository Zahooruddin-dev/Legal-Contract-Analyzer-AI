export default {
  async fetch(request, env) {
    console.log('🚀 Worker started');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      console.log('📦 Request received with', body.messages?.length, 'messages');

      const AWS_BEDROCK_API_KEY = env.AWS_BEDROCK_API_KEY;
      const AWS_REGION = env.AWS_REGION || 'us-east-1';

      if (!AWS_BEDROCK_API_KEY) {
        console.error('❌ Missing AWS_BEDROCK_API_KEY');
        return new Response(JSON.stringify({ 
          error: 'Server configuration error - Missing AWS Bedrock API key' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const MODEL_ID = 'amazon.nova-lite-v1:0';
      console.log('🤖 Using model:', MODEL_ID);

      // Transform messages to Bedrock format
      const bedrockMessages = body.messages.map(msg => {
        // Skip system messages or merge them into first user message
        if (msg.role === 'system') {
          return null;
        }
        return {
          role: msg.role,
          content: [
            {
              text: typeof msg.content === 'string' ? msg.content : msg.content[0]?.text || ''
            }
          ]
        };
      }).filter(Boolean);

      // If there's a system message, prepend to first user message
      const systemMsg = body.messages.find(m => m.role === 'system');
      if (systemMsg && bedrockMessages.length > 0) {
        const systemText = typeof systemMsg.content === 'string' 
          ? systemMsg.content 
          : systemMsg.content[0]?.text || '';
        
        bedrockMessages[0].content[0].text = 
          `${systemText}\n\n${bedrockMessages[0].content[0].text}`;
      }

      // Build Bedrock payload matching your original structure
      const bedrockPayload = {
        modelId: MODEL_ID,
        messages: bedrockMessages,
        inferenceConfig: {
          maxTokens: body.max_tokens || 1000,
          temperature: body.temperature || 0.2,
          topP: body.top_p || 0.9,
        }
      };

      console.log('📤 Calling Bedrock API...');

      const bedrockUrl = `https://bedrock-runtime.${AWS_REGION}.amazonaws.com/model/${MODEL_ID}/converse`;

      const bedrockRes = await fetch(bedrockUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AWS_BEDROCK_API_KEY}`, // Use Bearer format
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bedrockPayload),
      });

      console.log('📨 Bedrock response status:', bedrockRes.status);

      if (!bedrockRes.ok) {
        const errorText = await bedrockRes.text();
        console.error('❌ Bedrock error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'AWS Bedrock API error',
          status: bedrockRes.status,
          details: errorText
        }), {
          status: bedrockRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const bedrockData = await bedrockRes.json();
      console.log('✅ Response received');

      // Transform to OpenAI-compatible format
      const transformedResponse = {
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: bedrockData.output?.message?.content?.[0]?.text || ''
            },
            finish_reason: bedrockData.stopReason || 'stop'
          }
        ],
        usage: bedrockData.usage || {}
      };

      return new Response(JSON.stringify(transformedResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('💥 Error:', error.message);

      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};