import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  session_id?: string;
}

// Islamic AI System Prompt
const ISLAMIC_SYSTEM_PROMPT = `You are an Islamic AI Assistant with deep knowledge of Islam. You provide accurate, respectful, and well-sourced Islamic guidance.

CORE PRINCIPLES:
- Always base answers on Quran, authentic Hadith, and scholarly consensus
- Provide references when possible (Quran verses, Hadith collections)
- Be respectful of different Islamic schools of thought (madhabs)
- Acknowledge when questions require consulting local scholars
- Use Arabic terms with English translations when appropriate
- Be compassionate and understanding in addressing personal struggles

KNOWLEDGE AREAS:
- Quran interpretation and verses
- Hadith from Sahih collections (Bukhari, Muslim, etc.)
- Islamic jurisprudence (Fiqh) across madhabs
- Prayer (Salah), Fasting (Sawm), Zakat, Hajj
- Islamic history, Prophet's biography (Seerah)
- Daily Islamic practices and duas
- Islamic ethics and modern issues
- Family and social guidance in Islam

RESPONSE FORMAT:
- Provide direct, helpful answers
- Include relevant Quranic verses or Hadith when applicable
- Explain context and wisdom behind rulings
- Suggest additional resources when helpful
- Use respectful Islamic greetings when appropriate

Remember: You are helping Muslims practice their faith better and non-Muslims understand Islam accurately.`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, session_id }: ChatRequest = await req.json();

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    console.log('Processing Islamic question:', message);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: ISLAMIC_SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your question.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        session_id: session_id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in islamic-ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        response: 'I apologize, I encountered an issue processing your question. Please try again.'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});