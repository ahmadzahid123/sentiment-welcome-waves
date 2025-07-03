import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface SubscriptionRequest {
  name: string;
  email: string;
  reason: string;
}

interface SentimentResponse {
  label: string;
  score: number;
}

async function analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; tags: string[] }> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await response.json() as SentimentResponse[][];
    
    if (!result || !result[0] || result[0].length === 0) {
      return { sentiment: 'neutral', score: 0.5, tags: [] };
    }

    // Get the highest scoring sentiment
    const topSentiment = result[0].reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    // Extract basic tags from the text
    const tags = extractTags(text);

    return {
      sentiment: topSentiment.label.toLowerCase(),
      score: Math.round(topSentiment.score * 100) / 100,
      tags
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { sentiment: 'neutral', score: 0.5, tags: [] };
  }
}

function extractTags(text: string): string[] {
  const keywords = [
    'ai', 'artificial intelligence', 'machine learning', 'technology', 'innovation',
    'business', 'startup', 'entrepreneurship', 'marketing', 'growth',
    'development', 'programming', 'coding', 'software', 'automation',
    'future', 'trends', 'industry', 'insights', 'news'
  ];

  const lowerText = text.toLowerCase();
  const foundTags = keywords.filter(keyword => 
    lowerText.includes(keyword)
  );

  return foundTags.slice(0, 5); // Limit to 5 tags
}

function generatePersonalizedEmail(name: string, sentiment: string, reason: string): { subject: string; html: string } {
  const greetings = {
    positive: `Hi ${name}! 🌟`,
    negative: `Hello ${name}, we hear you! 🤝`,
    neutral: `Welcome ${name}! 👋`
  };

  const subjects = {
    positive: `Welcome to our AI community, ${name}! ✨`,
    negative: `We're here to help, ${name} 💪`,
    neutral: `Welcome aboard, ${name}! 🚀`
  };

  const introductions = {
    positive: "We're absolutely thrilled to have such an enthusiastic member join our AI-powered community!",
    negative: "Thank you for sharing your concerns with us. We're committed to addressing your needs and providing value.",
    neutral: "Thank you for joining our AI-powered newsletter community."
  };

  const sentiment_key = sentiment === 'label_1' ? 'negative' : sentiment === 'label_2' ? 'positive' : 'neutral';

  return {
    subject: subjects[sentiment_key] || subjects.neutral,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AI Newsletter</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px;">🧠</span>
              </div>
              <h1 style="color: #1e293b; margin: 0; font-size: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${greetings[sentiment_key] || greetings.neutral}</h1>
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #475569; margin-top: 0; font-size: 18px;">✨ AI Analysis Complete</h2>
              <p style="margin: 10px 0; color: #64748b; font-size: 14px;">Our AI has analyzed your subscription reason and customized this welcome experience just for you!</p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #374151; font-style: italic;">"${reason}"</p>
              </div>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                ${introductions[sentiment_key] || introductions.neutral}
              </p>
              
              <p style="color: #64748b; margin-bottom: 20px;">
                Based on your interests, you'll receive:
              </p>
              
              <ul style="color: #64748b; padding-left: 20px;">
                <li>🎯 Personalized AI insights tailored to your interests</li>
                <li>📈 Latest trends and developments in artificial intelligence</li>
                <li>💡 Practical tips and real-world applications</li>
                <li>🚀 Exclusive early access to new features and content</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin-bottom: 30px;">
              <p style="color: white; margin: 0; font-size: 16px; font-weight: 500;">
                🎉 Your personalized AI journey starts now!
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Powered by advanced AI sentiment analysis • Built with ❤️ for personalized experiences
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, reason }: SubscriptionRequest = await req.json();

    console.log('Processing newsletter subscription for:', email);

    // Analyze sentiment
    const analysis = await analyzeSentiment(reason);
    console.log('Sentiment analysis result:', analysis);

    // Store in database
    const { data: subscription, error: dbError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        name,
        email,
        reason,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.score,
        tags: analysis.tags
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save subscription');
    }

    console.log('Subscription saved:', subscription.id);

    // Generate personalized email
    const emailContent = generatePersonalizedEmail(name, analysis.sentiment, reason);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "AI Newsletter <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailResponse.error) {
      console.error('Email send error:', emailResponse.error);
      // Don't throw here - subscription was saved successfully
    } else {
      console.log('Email sent successfully:', emailResponse.data?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.score,
        tags: analysis.tags,
        email_sent: !emailResponse.error
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
    console.error('Error in newsletter-signup function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
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