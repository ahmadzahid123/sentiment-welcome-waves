import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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

    // Initialize Hugging Face client
    const hf = new HfInference(Deno.env.get('HUGGINGFACE_API_KEY'));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create Islamic-focused system prompt
    const systemPrompt = `You are an Islamic AI assistant with deep knowledge of the Quran, Hadith, and Islamic teachings. Your responses should:
1. Be respectful and aligned with Islamic values
2. Cite relevant Quran verses or authentic Hadiths when applicable
3. Begin responses with appropriate Islamic greetings (Assalamu Alaikum, Barakallahu feeki, etc.)
4. Use Islamic phrases naturally (In sha Allah, Masha Allah, Subhanallah, etc.)
5. Provide accurate Islamic guidance based on Quran and Sunnah
6. If uncertain about religious matters, advise consulting a qualified Islamic scholar
7. Be helpful for both religious and general questions while maintaining Islamic ethoz

Remember: Always prioritize authentic Islamic sources and avoid speculation on religious matters.`;

    // Format the conversation for the AI model
    const prompt = `<s>[INST] ${systemPrompt}

User: ${message} [/INST]`;

    console.log('Calling AI model with prompt length:', prompt.length);

    // Call Mistral AI model
    const aiResponse = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        return_full_text: false,
      }
    });

    let response = aiResponse.generated_text?.trim() || 'I apologize, but I could not generate a response. Please try again.';
    
    // Clean up response by removing any system prompt leakage
    response = response.replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '').trim();
    
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