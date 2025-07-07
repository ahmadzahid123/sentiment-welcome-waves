import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

async function getGroqResponse(message: string, context: string = ''): Promise<string> {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const messages = [
      { role: 'system', content: ISLAMIC_SYSTEM_PROMPT },
      { role: 'user', content: `${context ? `Context: ${context}\n\n` : ''}${message}` }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Free Groq model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your question.';
  } catch (error) {
    console.error('Groq API error:', error);
    return 'I apologize, but I encountered an error. Please try asking your question again.';
  }
}

async function searchIslamicKnowledge(query: string): Promise<string> {
  try {
    // Search in our Islamic knowledge database
    const { data, error } = await supabase
      .from('islamic_knowledge')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, tags.cs.{${query}}`)
      .eq('verified', true)
      .limit(3);

    if (error) {
      console.error('Database search error:', error);
      return '';
    }

    if (!data || data.length === 0) {
      return '';
    }

    // Format the knowledge for context
    const contextParts = data.map(item => {
      let context = `${item.title}: ${item.content}`;
      if (item.arabic_text) context += `\nArabic: ${item.arabic_text}`;
      if (item.translation) context += `\nTranslation: ${item.translation}`;
      if (item.reference) context += `\nReference: ${item.reference}`;
      return context;
    });

    return contextParts.join('\n\n---\n\n');
  } catch (error) {
    console.error('Knowledge search error:', error);
    return '';
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, session_id }: ChatRequest = await req.json();

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    console.log('Processing Islamic question:', message);

    // Search for relevant Islamic knowledge
    const relevantKnowledge = await searchIslamicKnowledge(message);
    
    // Get AI response with Islamic context
    const aiResponse = await getGroqResponse(message, relevantKnowledge);

    console.log('AI response generated successfully');

    // Return the response
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
        response: 'أعتذر، واجهت مشكلة في معالجة سؤالك. يرجى المحاولة مرة أخرى.\n\nI apologize, I encountered an issue processing your question. Please try again.'
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
};

serve(handler);