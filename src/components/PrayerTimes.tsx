
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Settings, Compass, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  location: string;
  qiblaDirection: number;
  hijriDate: string;
  prohibitedTimes: Array<{
    name: string;
    start: string;
    end: string;
  }>;
}

interface CalculationMethod {
  id: number;
  name: string;
  description: string;
}

const PrayerTimes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<number>(2); // Default to Islamic Society of North America
  const [selectedSchool, setSelectedSchool] = useState<number>(0); // Default to Shafi/Hanbali/Maliki
  
  const calculationMethods: CalculationMethod[] = [
    { id: 1, name: "University of Islamic Sciences, Karachi", description: "Used in Pakistan, Bangladesh, India, Afghanistan, parts of Europe" },
    { id: 2, name: "Islamic Society of North America", description: "Used in North America (US and Canada)" },
    { id: 3, name: "Muslim World League", description: "Used in Europe, Far East, parts of US" },
    { id: 4, name: "Umm Al-Qura University, Makkah", description: "Used in Saudi Arabia" },
    { id: 5, name: "Egyptian General Authority of Survey", description: "Used in Africa, Syria, Iraq, Lebanon, Malaysia, Brunei, Indonesia" },
    { id: 7, name: "Institute of Geophysics, University of Tehran", description: "Used in Iran, some Shia communities" },
    { id: 8, name: "Gulf Region", description: "Used in Kuwait, Qatar, Bahrain, Oman, UAE" },
    { id: 9, name: "Kuwait", description: "Used in Kuwait" },
    { id: 10, name: "Qatar", description: "Used in Qatar" },
    { id: 11, name: "Majlis Ugama Islam Singapura, Singapore", description: "Used in Singapore" },
    { id: 12, name: "Union Organization Islamic de France", description: "Used in France" },
    { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey", description: "Used in Turkey" }
  ];

  const juristicSchools = [
    { id: 0, name: "Shafi/Hanbali/Maliki", description: "Standard method" },
    { id: 1, name: "Hanafi", description: "Used in Central Asia, Egypt, Syria, Turkey, Balkans, Indian subcontinent" }
  ];

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
  }, [selectedMethod, selectedSchool]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes) {
        updateNextPrayer(prayerTimes);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

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
      setLoading(true);
      
      // Get current date
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      // Fetch prayer times with IslamicAPI
      const prayerResponse = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${selectedMethod}&school=${selectedSchool}`
      );
      
      if (!prayerResponse.ok) throw new Error('Failed to fetch prayer times');
      
      const prayerData = await prayerResponse.json();
      const timings = prayerData.data.timings;
      
      // Fetch Qibla direction
      const qiblaResponse = await fetch(
        `https://api.aladhan.com/v1/qibla/${lat}/${lng}`
      );
      
      let qiblaDirection = 0;
      if (qiblaResponse.ok) {
        const qiblaData = await qiblaResponse.json();
        qiblaDirection = qiblaData.data.direction;
      }

      // Fetch Hijri date
      const hijriResponse = await fetch(
        `https://api.aladhan.com/v1/gToH/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
      );
      
      let hijriDate = '';
      if (hijriResponse.ok) {
        const hijriData = await hijriResponse.json();
        hijriDate = `${hijriData.data.hijri.day} ${hijriData.data.hijri.month.en} ${hijriData.data.hijri.year}`;
      }

      // Calculate prohibited prayer times
      const prohibitedTimes = calculateProhibitedTimes(timings);
      
      const prayerTimesData: PrayerTimesData = {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: prayerData.data.date.readable,
        location: prayerData.data.meta.timezone,
        qiblaDirection,
        hijriDate,
        prohibitedTimes
      };
      
      setPrayerTimes(prayerTimesData);
      updateNextPrayer(prayerTimesData);
      
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prayer times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProhibitedTimes = (timings: any) => {
    const prohibited = [];
    
    // After sunrise (15-20 minutes)
    const sunriseTime = new Date(`1970-01-01T${timings.Sunrise}:00`);
    const afterSunrise = new Date(sunriseTime.getTime() + 20 * 60000);
    prohibited.push({
      name: "After Sunrise",
      start: timings.Sunrise,
      end: afterSunrise.toTimeString().slice(0, 5)
    });

    // Before Dhuhr (15 minutes)
    const dhuhrTime = new Date(`1970-01-01T${timings.Dhuhr}:00`);
    const beforeDhuhr = new Date(dhuhrTime.getTime() - 15 * 60000);
    prohibited.push({
      name: "Before Dhuhr",
      start: beforeDhuhr.toTimeString().slice(0, 5),
      end: timings.Dhuhr
    });

    // After Asr until Maghrib
    prohibited.push({
      name: "After Asr",
      start: timings.Asr,
      end: timings.Maghrib
    });

    return prohibited;
  };

  const updateNextPrayer = (times: PrayerTimesData) => {
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
        const remainingMinutes = prayerTime - currentTime;
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;
        const remaining = remainingHours > 0 
          ? `${remainingHours}h ${remainingMins}m` 
          : `${remainingMins}m`;
        
        setNextPrayer({ 
          name: `${prayer.name} (${prayer.arabic})`, 
          time: prayer.time,
          remaining 
        });
        return;
      }
    }
    
    // If no prayer found today, next is Fajr tomorrow
    setNextPrayer({ 
      name: `Fajr (${prayers[0].arabic})`, 
      time: prayers[0].time,
      remaining: "Tomorrow"
    });
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
    <div className="space-y-4">
      {/* Settings */}
      <Card className="shadow-islamic">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gradient-primary">
            <Settings className="w-5 h-5" />
            Prayer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calculation Method</label>
              <Select value={selectedMethod.toString()} onValueChange={(value) => setSelectedMethod(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calculationMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-muted-foreground">{method.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Juristic School (Asr)</label>
              <Select value={selectedSchool.toString()} onValueChange={(value) => setSelectedSchool(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {juristicSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      <div>
                        <div className="font-medium">{school.name}</div>
                        <div className="text-xs text-muted-foreground">{school.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Prayer Times */}
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
              <span>•</span>
              <Calendar className="w-4 h-4" />
              <span>{prayerTimes.hijriDate}</span>
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
              <div className="text-sm text-primary/80">
                in {nextPrayer.remaining}
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
                    {prayerTimes[prayer.key as keyof PrayerTimesData] as string}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qibla Direction */}
      {prayerTimes && (
        <Card className="shadow-islamic">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gradient-primary">
              <Compass className="w-5 h-5" />
              Qibla Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-y-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {prayerTimes.qiblaDirection.toFixed(1)}°
                </div>
                <div className="text-sm text-muted-foreground">
                  from North (clockwise)
                </div>
                <div className="mt-4">
                  <div 
                    className="w-16 h-16 mx-auto border-2 border-primary rounded-full flex items-center justify-center relative"
                    style={{ transform: `rotate(${prayerTimes.qiblaDirection}deg)` }}
                  >
                    <div className="w-1 h-6 bg-primary absolute top-1"></div>
                    <Compass className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prohibited Prayer Times */}
      {prayerTimes && prayerTimes.prohibitedTimes.length > 0 && (
        <Card className="shadow-islamic">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gradient-primary">
              <AlertTriangle className="w-5 h-5" />
              Prohibited Prayer Times
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Times when voluntary prayers should be avoided
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prayerTimes.prohibitedTimes.map((time, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                  <span className="font-medium text-orange-800 dark:text-orange-200">
                    {time.name}
                  </span>
                  <span className="text-sm text-orange-600 dark:text-orange-300 font-mono">
                    {time.start} - {time.end}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={getLocationAndFetchPrayerTimes}
        className="w-full mt-4"
        disabled={loading}
      >
        <Settings className="w-4 h-4 mr-2" />
        Refresh Prayer Times
      </Button>
    </div>
  );
};

export default PrayerTimes;
