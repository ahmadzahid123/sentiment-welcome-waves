
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Book, Mic, MessageSquare, Globe, Heart, Calendar, Moon, Star } from 'lucide-react';
import PrayerTimes from './PrayerTimes';
import IslamicKnowledge from './IslamicKnowledge';
import VoiceFeatures from './VoiceFeatures';
import IslamicCalendar from './IslamicCalendar';
import DailyVerse from './DailyVerse';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: Clock,
      title: 'Prayer Times',
      description: 'Accurate prayer times based on your location with notifications',
      count: '5 Daily Prayers',
      color: 'bg-blue-500'
    },
    {
      icon: Book,
      title: 'Islamic Knowledge',
      description: 'Browse Quran verses, Hadith, and Islamic teachings',
      count: 'Thousands of Sources',
      color: 'bg-green-500'
    },
    {
      icon: Moon,
      title: 'Islamic Calendar',
      description: 'Current Hijri date and upcoming Islamic events',
      count: 'Live Updates',
      color: 'bg-purple-500'
    },
    {
      icon: Star,
      title: 'Daily Verse',
      description: 'Daily Quran verses with translation and audio',
      count: 'Daily Inspiration',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      {/* Welcome Header - More prominent */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🕌</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Islamic AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          السلام عليكم ورحمة الله وبركاته - Your comprehensive Islamic companion with prayer times, 
          Islamic knowledge, AI chat, and spiritual guidance all in one place.
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
          {/* Features Grid - More visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 hover:border-primary/50"
                    onClick={() => {
                      const tabMap: { [key: string]: string } = {
                        'Prayer Times': 'prayers',
                        'Islamic Knowledge': 'knowledge',
                        'Islamic Calendar': 'calendar',
                        'Daily Verse': 'overview' // Stay on overview for daily verse
                      };
                      const targetTab = tabMap[feature.title];
                      if (targetTab) setActiveTab(targetTab);
                    }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${feature.color} rounded-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                      <p className="text-sm text-primary font-medium">{feature.count}</p>
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

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Verse - More prominent */}
            <div className="lg:col-span-1">
              <DailyVerse />
            </div>
            
            {/* Quick Prayer Times */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Today's Prayer Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PrayerTimes />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold">Explore More Features</h3>
                <p className="text-muted-foreground">
                  Click on any feature card above or use the tabs to explore all Islamic tools and resources
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <button 
                    onClick={() => setActiveTab('prayers')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    View Prayer Times
                  </button>
                  <button 
                    onClick={() => setActiveTab('knowledge')}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Browse Knowledge
                  </button>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Islamic Calendar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
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
