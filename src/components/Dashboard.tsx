
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Book, Mic, MessageSquare, Globe, Heart } from 'lucide-react';
import PrayerTimes from './PrayerTimes';
import IslamicKnowledge from './IslamicKnowledge';
import VoiceFeatures from './VoiceFeatures';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get Islamic guidance and answers from our AI powered by authentic sources',
      count: 'Always Available'
    },
    {
      icon: Clock,
      title: 'Prayer Times',
      description: 'Accurate prayer times based on your location with notifications',
      count: '5 Daily Prayers'
    },
    {
      icon: Book,
      title: 'Islamic Knowledge',
      description: 'Browse Quran verses, Hadith, and Islamic teachings',
      count: 'Thousands of Sources'
    },
    {
      icon: Mic,
      title: 'Voice Features',
      description: 'Speech-to-text and text-to-speech in multiple languages',
      count: 'Multilingual Support'
    }
  ];

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
          Islamic AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Your comprehensive Islamic companion powered by AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="prayers" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Prayers</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span className="hidden sm:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Message */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-2xl">🌙</div>
                <h2 className="text-xl font-semibold text-gradient-primary">
                  السلام عليكم ورحمة الله وبركاته
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Welcome to your Islamic AI Assistant. Get prayer times, explore Islamic knowledge, 
                  chat with our AI for spiritual guidance, and use voice features - all in one place.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-islamic hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      const tabMap: { [key: string]: string } = {
                        'AI Chat Assistant': 'chat',
                        'Prayer Times': 'prayers',
                        'Islamic Knowledge': 'knowledge',
                        'Voice Features': 'voice'
                      };
                      const targetTab = tabMap[feature.title];
                      if (targetTab) setActiveTab(targetTab);
                    }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
                      <p className="text-xs text-primary font-medium">{feature.count}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Prayer Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PrayerTimes />
            
            <Card className="shadow-islamic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient-primary">
                  <Globe className="w-5 h-5" />
                  Quick Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Islamic AI Chat</p>
                      <p className="text-sm text-muted-foreground">Ask questions about Islam</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border">
                    <Book className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Quran & Hadith</p>
                      <p className="text-sm text-muted-foreground">Browse Islamic texts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border">
                    <Mic className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Voice Support</p>
                      <p className="text-sm text-muted-foreground">Multilingual TTS & STT</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prayers">
          <PrayerTimes />
        </TabsContent>

        <TabsContent value="knowledge">
          <IslamicKnowledge />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceFeatures />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
