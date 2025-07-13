
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IslamicDate {
  hijri: {
    date: string;
    format: string;
    day: string;
    weekday: {
      en: string;
      ar: string;
    };
    month: {
      number: number;
      en: string;
      ar: string;
    };
    year: string;
    designation: {
      abbreviated: string;
      expanded: string;
    };
  };
  gregorian: {
    date: string;
    format: string;
    day: string;
    weekday: {
      en: string;
    };
    month: {
      number: number;
      en: string;
    };
    year: string;
    designation: {
      abbreviated: string;
      expanded: string;
    };
  };
}

interface IslamicEvent {
  name: string;
  date: string;
  type: 'religious' | 'historical';
  description: string;
}

const IslamicCalendar = () => {
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<IslamicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIslamicDate();
  }, []);

  const fetchIslamicDate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Islamic date');
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        setIslamicDate(data.data);
        generateUpcomingEvents(data.data);
      } else {
        throw new Error(data.data || 'Invalid response');
      }
      
    } catch (err) {
      console.error('Islamic calendar error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Islamic calendar');
    } finally {
      setLoading(false);
    }
  };

  const generateUpcomingEvents = (dateData: IslamicDate) => {
    // This is a simplified list of Islamic events
    const events: IslamicEvent[] = [
      {
        name: "Laylat al-Qadr",
        date: "27 Ramadan",
        type: "religious",
        description: "The Night of Power, when the Quran was first revealed"
      },
      {
        name: "Eid al-Fitr",
        date: "1 Shawwal",
        type: "religious",
        description: "Festival marking the end of Ramadan"
      },
      {
        name: "Eid al-Adha",
        date: "10 Dhul Hijjah",
        type: "religious",
        description: "Festival of Sacrifice during Hajj"
      },
      {
        name: "Muharram",
        date: "1 Muharram",
        type: "historical",
        description: "Islamic New Year"
      },
      {
        name: "Day of Ashura",
        date: "10 Muharram",
        type: "historical",
        description: "Day of remembrance and fasting"
      },
      {
        name: "Mawlid an-Nabi",
        date: "12 Rabi' al-awwal",
        type: "religious",
        description: "Birth of Prophet Muhammad (PBUH)"
      }
    ];

    // Show next 3 upcoming events
    setUpcomingEvents(events.slice(0, 3));
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
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
          <Button onClick={fetchIslamicDate} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Islamic Date */}
      {islamicDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Islamic Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {islamicDate.hijri.day} {islamicDate.hijri.month.en} {islamicDate.hijri.year} AH
              </div>
              <div className="text-lg text-muted-foreground">
                {islamicDate.hijri.weekday.en}
              </div>
              <div className="text-sm text-muted-foreground">
                Corresponding to: {islamicDate.gregorian.day} {islamicDate.gregorian.month.en} {islamicDate.gregorian.year}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Islamic Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Upcoming Islamic Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {event.type === 'religious' ? (
                    <Star className="w-4 h-4 text-primary" />
                  ) : (
                    <Calendar className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{event.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.date}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Islamic Time Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Islamic Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-card/50 rounded">
              <span className="text-sm font-medium">Current Month</span>
              <span className="text-sm">{islamicDate?.hijri.month.en}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-card/50 rounded">
              <span className="text-sm font-medium">Arabic Month</span>
              <span className="text-sm font-arabic">{islamicDate?.hijri.month.ar}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-card/50 rounded">
              <span className="text-sm font-medium">Day of Week</span>
              <span className="text-sm">{islamicDate?.hijri.weekday.en}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IslamicCalendar;
