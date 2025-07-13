
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Book, Mic, MessageSquare, Globe, Heart, Calendar, Moon } from 'lucide-react';
import PrayerTimes from './PrayerTimes';
import IslamicKnowledge from './IslamicKnowledge';
import VoiceFeatures from './VoiceFeatures';
import IslamicCalendar from './IslamicCalendar';
import DailyVerse from './DailyVerse';

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
      icon: Calendar,
      title: 'Islamic Calendar',
      description: 'Current Hijri date and upcoming Islamic events',
      count: 'Live Updates'
    }
  ];

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Islamic AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Your comprehensive Islamic companion powered by AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
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
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
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
                <h2 className="text-xl font-semibold">
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
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      const tabMap: { [key: string]: string } = {
                        'AI Chat Assistant': 'chat',
                        'Prayer Times': 'prayers',
                        'Islamic Knowledge': 'knowledge',
                        'Islamic Calendar': 'calendar'
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

          {/* Quick Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Verse */}
            <DailyVerse />
            
            {/* Quick Prayer Times */}
            <div className="lg:col-span-2">
              <PrayerTimes />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prayers">
          <PrayerTimes />
        </TabsContent>

        <TabsContent value="knowledge">
          <IslamicKnowledge />
        </TabsContent>

        <TabsContent value="calendar">
          <IslamicCalendar />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceFeatures />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
