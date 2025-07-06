import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, session_id } = await req.json();

    // Get Groq API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this is the first message in the session
    const { data: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id);

    const isFirstMessage = !messageCount || messageCount === 0;

    // Create Islamic-focused system prompt
    const systemPrompt = `You are an Islamic AI assistant with deep knowledge of the Quran, Hadith, and Islamic teachings. Your responses should:
1. Be respectful and aligned with Islamic values
2. Cite relevant Quran verses or authentic Hadiths when applicable
3. ${isFirstMessage ? 'Begin with Islamic greeting (Assalamu Alaikum wa Rahmatullahi wa Barakatuh)' : 'Do NOT include greetings in your response unless specifically relevant'}
4. Use Islamic phrases naturally (In sha Allah, Masha Allah, Subhanallah, etc.)
5. Provide accurate Islamic guidance based on Quran and Sunnah
6. If uncertain about religious matters, advise consulting a qualified Islamic scholar
7. Be helpful for both religious and general questions while maintaining Islamic ethos

Remember: Always prioritize authentic Islamic sources and avoid speculation on religious matters.`;

    console.log('Calling Groq API with message:', message);

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    let response = groqData.choices[0]?.message?.content?.trim() || 'I apologize, but I could not generate a response. Please try again.';
    
    console.log('AI Response generated successfully, length:', response.length);

    // Save the AI interaction to knowledge base if it's a good response
    if (response.length > 50 && !response.includes('I apologize')) {
      try {
        await supabase
          .from('islamic_knowledge')
          .insert([
            {
              type: 'qa',
              title: message.substring(0, 100),
              content: response,
              category: 'ai_generated',
              verified: false,
            }
          ]);
      } catch (dbError) {
        console.log('Note: Could not save to knowledge base:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in islamic-ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        response: 'I apologize, but I encountered an error. Please try again. May Allah make it easy for us.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});