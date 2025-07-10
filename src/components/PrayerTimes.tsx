
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  location: string;
}

const PrayerTimes = () => {
  const { user } = useAuth();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

  const prayerNames = [
    { key: 'fajr', name: 'Fajr', arabic: 'الفجر' },
    { key: 'sunrise', name: 'Sunrise', arabic: 'الشروق' },
    { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر' },
    { key: 'asr', name: 'Asr', arabic: 'العصر' },
    { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب' },
    { key: 'isha', name: 'Isha', arabic: 'العشاء' }
  ];

  useEffect(() => {
    getLocationAndFetchPrayerTimes();
  }, []);

  const getLocationAndFetchPrayerTimes = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            await fetchPrayerTimes(latitude, longitude);
          },
          () => {
            // Fallback to a default location (Mecca)
            fetchPrayerTimes(21.4225, 39.8262);
          }
        );
      } else {
        // Fallback to Mecca
        fetchPrayerTimes(21.4225, 39.8262);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=${lat}&longitude=${lng}&method=2`
      );
      
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      
      const data = await response.json();
      const timings = data.data.timings;
      
      const prayerData: PrayerTimesData = {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: data.data.date.readable,
        location: data.data.meta.timezone
      };
      
      setPrayerTimes(prayerData);
      calculateNextPrayer(prayerData);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = (times: PrayerTimesData) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: times.fajr, arabic: 'الفجر' },
      { name: 'Sunrise', time: times.sunrise, arabic: 'الشروق' },
      { name: 'Dhuhr', time: times.dhuhr, arabic: 'الظهر' },
      { name: 'Asr', time: times.asr, arabic: 'العصر' },
      { name: 'Maghrib', time: times.maghrib, arabic: 'المغرب' },
      { name: 'Isha', time: times.isha, arabic: 'العشاء' }
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        setNextPrayer({ name: `${prayer.name} (${prayer.arabic})`, time: prayer.time });
        return;
      }
    }
    
    // If no prayer found today, next is Fajr tomorrow
    setNextPrayer({ name: `Fajr (${prayers[0].arabic})`, time: prayers[0].time });
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-islamic">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gradient-primary">
          <Clock className="w-5 h-5" />
          Prayer Times
        </CardTitle>
        {prayerTimes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{prayerTimes.location}</span>
            <span>•</span>
            <span>{prayerTimes.date}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {nextPrayer && (
          <div className="p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-primary font-medium">Next Prayer</div>
            <div className="text-lg font-bold text-primary">
              {nextPrayer.name} - {nextPrayer.time}
            </div>
          </div>
        )}
        
        {prayerTimes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prayerNames.map((prayer) => (
              <div
                key={prayer.key}
                className="flex justify-between items-center p-3 bg-card/50 rounded-lg border"
              >
                <div>
                  <div className="font-medium text-foreground">{prayer.name}</div>
                  <div className="text-sm text-muted-foreground">{prayer.arabic}</div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {prayerTimes[prayer.key as keyof PrayerTimesData]}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={getLocationAndFetchPrayerTimes}
          className="w-full mt-4"
        >
          <Settings className="w-4 h-4 mr-2" />
          Refresh Prayer Times
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrayerTimes;
