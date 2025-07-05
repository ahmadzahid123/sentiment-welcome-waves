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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // For now, return a simple Islamic-themed response
    // TODO: Integrate with Hugging Face Transformers for proper AI responses
    const islamicResponses = [
      "In sha Allah, I'm here to help you with Islamic knowledge. The Quran says: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.' (65:3)",
      "May Allah guide you on the straight path. Remember that seeking knowledge is an obligation upon every Muslim. How can I assist you today?",
      "SubhanAllah! The Prophet (peace be upon him) said: 'The world is green and beautiful, and Allah has appointed you as His stewards over it.'",
      "Alhamdulillahi rabbil alameen. The Quran reminds us: 'And it is He who created the heavens and earth in truth. And the day He says, \"Be,\" and it is, His word is the truth.' (6:73)",
    ];

    const response = islamicResponses[Math.floor(Math.random() * islamicResponses.length)];

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