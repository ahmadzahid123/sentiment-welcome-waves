
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuranVerse {
  text: string;
  translation: string;
  reference: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  ayah: number;
}

const DailyVerse = () => {
  const [verse, setVerse] = useState<QuranVerse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const predefinedVerses: QuranVerse[] = [
    {
      text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
      translation: "And whoever fears Allah - He will make for him a way out",
      reference: "Quran 65:2",
      surah: { number: 65, name: "الطلاق", englishName: "At-Talaq" },
      ayah: 2
    },
    {
      text: "وَبَشِّرِ الصَّابِرِينَ",
      translation: "And give good tidings to the patient",
      reference: "Quran 2:155",
      surah: { number: 2, name: "البقرة", englishName: "Al-Baqarah" },
      ayah: 155
    },
    {
      text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "Indeed, with hardship comes ease",
      reference: "Quran 94:6",
      surah: { number: 94, name: "الشرح", englishName: "Ash-Sharh" },
      ayah: 6
    },
    {
      text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      translation: "Our Lord, give us good in this world and good in the next world and save us from the punishment of the Fire",
      reference: "Quran 2:201",
      surah: { number: 2, name: "البقرة", englishName: "Al-Baqarah" },
      ayah: 201
    },
    {
      text: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
      translation: "And remind, for indeed, the reminder benefits the believers",
      reference: "Quran 51:55",
      surah: { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat" },
      ayah: 55
    }
  ];

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use date as seed for consistent daily verse
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const hash = hashCode(dateStr);
      const index = Math.abs(hash) % predefinedVerses.length;
      
      // Simulate API delay
      setTimeout(() => {
        setVerse(predefinedVerses[index]);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Error loading verse:', err);
      setError('Failed to load daily verse');
      setLoading(false);
    }
  };

  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else if (verse) {
        const utterance = new SpeechSynthesisUtterance(verse.translation);
        utterance.rate = 0.8;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const getNewVerse = () => {
    const randomIndex = Math.floor(Math.random() * predefinedVerses.length);
    setVerse(predefinedVerses[randomIndex]);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDailyVerse} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Daily Verse
        </CardTitle>
      </CardHeader>
      
      {verse && (
        <CardContent className="space-y-4">
          {/* Arabic Text */}
          <div className="text-center p-4 bg-primary/5 rounded-lg border">
            <p className="text-xl font-arabic leading-relaxed text-primary">
              {verse.text}
            </p>
          </div>
          
          {/* Translation */}
          <div className="text-center">
            <p className="text-lg text-foreground leading-relaxed mb-2">
              "{verse.translation}"
            </p>
          </div>
          
          {/* Reference */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              {verse.reference}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Surah {verse.surah.englishName}
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudio}
              disabled={!('speechSynthesis' in window)}
            >
              {isPlaying ? (
                <VolumeX className="w-4 h-4 mr-2" />
              ) : (
                <Volume2 className="w-4 h-4 mr-2" />
              )}
              {isPlaying ? 'Stop' : 'Listen'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={getNewVerse}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Verse
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DailyVerse;
