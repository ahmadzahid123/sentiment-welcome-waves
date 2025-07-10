
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

const islamicKnowledgeData = [
  // Quran Verses
  {
    title: "Surah Al-Fatiha - The Opening",
    content: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    reference: "Quran 1:1-7",
    type: "quran",
    category: "quran",
    tags: ["fatiha", "opening", "prayer", "fundamental"],
    verified: true
  },
  {
    title: "Ayat al-Kursi - Verse of the Throne",
    content: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    arabic_text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    reference: "Quran 2:255",
    type: "quran",
    category: "quran",
    tags: ["ayat-kursi", "throne", "protection", "allah"],
    verified: true
  },
  // Hadith
  {
    title: "The Importance of Prayer",
    content: "The Prophet (peace be upon him) said: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is bad, then the rest of his deeds will be bad.'",
    reference: "Recorded by at-Tabarani",
    type: "hadith",
    category: "hadith",
    tags: ["prayer", "salah", "judgment", "accountability"],
    verified: true
  },
  {
    title: "Kindness to Others",
    content: "The Prophet (peace be upon him) said: 'He is not of us who does not show mercy to our young ones and does not acknowledge the honor due to our elders.'",
    reference: "Sunan Abu Dawood",
    type: "hadith",
    category: "hadith",
    tags: ["kindness", "mercy", "respect", "community"],
    verified: true
  },
  // Duas
  {
    title: "Morning Dhikr - Seeking Protection",
    content: "I seek refuge in Allah from Satan, the accursed. In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    arabic_text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    reference: "Sunan Abu Dawood",
    type: "dua",
    category: "dua",
    tags: ["morning", "protection", "dhikr", "daily"],
    verified: true
  },
  {
    title: "Dua for Knowledge",
    content: "My Lord, increase me in knowledge.",
    arabic_text: "رَبِّ زِدْنِي عِلْماً",
    reference: "Quran 20:114",
    type: "dua",
    category: "dua",
    tags: ["knowledge", "learning", "education", "wisdom"],
    verified: true
  },
  // Fiqh
  {
    title: "Conditions of Prayer",
    content: "The five conditions that must be met for prayer to be valid are: 1) Being in a state of ritual purity (Wudu), 2) Facing the Qibla (direction of Mecca), 3) Covering the Awrah (private parts), 4) Praying at the correct time, 5) Having the intention (Niyyah) to pray.",
    reference: "Islamic Jurisprudence",
    type: "fiqh",
    category: "fiqh",
    tags: ["prayer", "salah", "conditions", "validity", "fiqh"],
    verified: true
  },
  {
    title: "Pillars of Islam",
    content: "Islam is built upon five pillars: 1) Shahada (Declaration of Faith), 2) Salah (Prayer), 3) Zakat (Obligatory Charity), 4) Sawm (Fasting during Ramadan), 5) Hajj (Pilgrimage to Mecca for those who are able).",
    reference: "Sahih al-Bukhari",
    type: "fiqh",
    category: "fiqh",
    tags: ["pillars", "islam", "fundamental", "obligations"],
    verified: true
  }
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Islamic knowledge seeding...');

    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('islamic_knowledge')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing data:', checkError);
      throw checkError;
    }

    if (existingData && existingData.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Islamic knowledge already seeded',
          count: existingData.length 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Insert Islamic knowledge data
    const { data, error } = await supabase
      .from('islamic_knowledge')
      .insert(islamicKnowledgeData)
      .select();

    if (error) {
      console.error('Error inserting Islamic knowledge:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length || 0} Islamic knowledge entries`);

    return new Response(
      JSON.stringify({ 
        message: 'Islamic knowledge seeded successfully',
        count: data?.length || 0,
        data: data
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
    console.error('Error in seed-islamic-knowledge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error
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
