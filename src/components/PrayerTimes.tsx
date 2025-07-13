
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Settings, Compass, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<number>(2);
  const [selectedSchool, setSelectedSchool] = useState<number>(0);
  
  const calculationMethods: CalculationMethod[] = [
    { id: 1, name: "University of Islamic Sciences, Karachi", description: "Pakistan, Bangladesh, India" },
    { id: 2, name: "Islamic Society of North America", description: "North America" },
    { id: 3, name: "Muslim World League", description: "Europe, Far East" },
    { id: 4, name: "Umm Al-Qura University, Makkah", description: "Saudi Arabia" },
    { id: 5, name: "Egyptian General Authority", description: "Africa, Syria, Iraq" },
    { id: 8, name: "Gulf Region", description: "Kuwait, Qatar, UAE" }
  ];

  const juristicSchools = [
    { id: 0, name: "Shafi/Hanbali/Maliki", description: "Standard method" },
    { id: 1, name: "Hanafi", description: "Central Asia, Turkey" }
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
    if (!location) {
      getCurrentLocation();
    } else {
      fetchPrayerTimes();
    }
  }, [location, selectedMethod, selectedSchool]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes) {
        updateNextPrayer();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Get city name from coordinates
          const cityName = await getCityName(latitude, longitude);
          setLocation({ lat: latitude, lng: longitude, city: cityName });
        } catch (err) {
          console.error('Error getting city name:', err);
          setLocation({ lat: latitude, lng: longitude, city: 'Unknown Location' });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: "Using default location (Mecca). Please enable location access for accurate prayer times.",
          variant: "destructive",
        });
        setDefaultLocation();
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const setDefaultLocation = () => {
    setLocation({ lat: 21.4225, lng: 39.8262, city: 'Mecca, Saudi Arabia' });
  };

  const getCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (response.ok) {
        const data = await response.json();
        return data.city || data.locality || data.principalSubdivision || 'Unknown Location';
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return 'Unknown Location';
  };

  const fetchPrayerTimes = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      // Fetch prayer times
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${location.lat}&longitude=${location.lng}&method=${selectedMethod}&school=${selectedSchool}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.data || 'Failed to fetch prayer times');
      }
      
      const timings = data.data.timings;
      const meta = data.data.meta;
      const date = data.data.date;
      
      // Get Qibla direction
      let qiblaDirection = 0;
      try {
        const qiblaResponse = await fetch(`https://api.aladhan.com/v1/qibla/${location.lat}/${location.lng}`);
        if (qiblaResponse.ok) {
          const qiblaData = await qiblaResponse.json();
          if (qiblaData.code === 200) {
            qiblaDirection = qiblaData.data.direction;
          }
        }
      } catch (err) {
        console.error('Qibla fetch error:', err);
      }
      
      const prayerTimesData: PrayerTimesData = {
        fajr: formatTime(timings.Fajr),
        sunrise: formatTime(timings.Sunrise),
        dhuhr: formatTime(timings.Dhuhr),
        asr: formatTime(timings.Asr),
        maghrib: formatTime(timings.Maghrib),
        isha: formatTime(timings.Isha),
        date: date.readable,
        location: location.city,
        qiblaDirection: Math.round(qiblaDirection * 10) / 10,
        hijriDate: `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`
      };
      
      setPrayerTimes(prayerTimesData);
      updateNextPrayer(prayerTimesData);
      
    } catch (err) {
      console.error('Prayer times fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prayer times';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage + ". Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const updateNextPrayer = (times?: PrayerTimesData) => {
    const currentTimes = times || prayerTimes;
    if (!currentTimes) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: currentTimes.fajr, arabic: 'الفجر' },
      { name: 'Sunrise', time: currentTimes.sunrise, arabic: 'الشروق' },
      { name: 'Dhuhr', time: currentTimes.dhuhr, arabic: 'الظهر' },
      { name: 'Asr', time: currentTimes.asr, arabic: 'العصر' },
      { name: 'Maghrib', time: currentTimes.maghrib, arabic: 'المغرب' },
      { name: 'Isha', time: currentTimes.isha, arabic: 'العشاء' }
    ];

    for (const prayer of prayers) {
      try {
        const timeStr = prayer.time.replace(/AM|PM/g, '').trim();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const isPM = prayer.time.includes('PM');
        const hour24 = isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours;
        const prayerMinutes = hour24 * 60 + minutes;
        
        if (prayerMinutes > currentMinutes) {
          const remainingMinutes = prayerMinutes - currentMinutes;
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
      } catch (err) {
        console.error('Time parsing error:', err);
      }
    }
    
    setNextPrayer({ 
      name: `Fajr (${prayers[0].arabic})`, 
      time: prayers[0].time,
      remaining: "Tomorrow"
    });
  };

  const handleRefresh = () => {
    setLocation(null);
    setPrayerTimes(null);
    setError(null);
    getCurrentLocation();
  };

  if (loading && !prayerTimes) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/3 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !prayerTimes) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Error Loading Prayer Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Prayer Times
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
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
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Qibla Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {prayerTimes.qiblaDirection}°
                </div>
                <div className="text-sm text-muted-foreground">
                  from North (clockwise)
                </div>
                <div className="mt-4">
                  <div 
                    className="w-16 h-16 mx-auto border-2 border-primary rounded-full flex items-center justify-center relative transition-transform duration-500"
                    style={{ transform: `rotate(${prayerTimes.qiblaDirection}deg)` }}
                  >
                    <Compass className="w-8 h-8 text-primary" />
                    <div className="absolute top-1 w-1 h-6 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="w-full"
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh Prayer Times
      </Button>
    </div>
  );
};

export default PrayerTimes;
