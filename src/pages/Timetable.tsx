import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calendar, Clock, MapPin, BookOpen, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface TimetableEntry {
  id?: string;
  weekday: number;
  period: number;
  subject: string;
  location: string;
  notes: string;
}

export const Timetable: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState<{ [key: string]: TimetableEntry }>({});

  useEffect(() => {
    if (user) {
      fetchTimetable();
    }
  }, [user]);

  const fetchTimetable = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('owner', user.id);

    if (error) {
      console.error('Error fetching timetable:', error);
      return;
    }

    const timetableMap: { [key: string]: TimetableEntry } = {};
    data?.forEach((entry) => {
      const key = `${entry.weekday}-${entry.period}`;
      timetableMap[key] = {
        id: entry.id,
        weekday: entry.weekday,
        period: entry.period,
        subject: entry.subject || '',
        location: entry.location || '',
        notes: entry.notes || '',
      };
    });

    setTimetable(timetableMap);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Delete existing entries
      await supabase
        .from('timetables')
        .delete()
        .eq('owner', user.id);

      // Insert new entries
      const entries = Object.values(timetable)
        .filter(entry => entry.subject.trim() !== '')
        .map(entry => ({
          owner: user.id,
          weekday: entry.weekday,
          period: entry.period,
          subject: entry.subject,
          location: entry.location,
          notes: entry.notes,
        }));

      if (entries.length > 0) {
        const { error } = await supabase
          .from('timetables')
          .insert(entries);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const updateEntry = (weekday: number, period: number, field: string, value: string) => {
    const key = `${weekday}-${period}`;
    setTimetable(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        weekday,
        period,
        [field]: value,
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                My Timetable
              </CardTitle>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Timetable'}
              </Button>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 bg-muted">Period</th>
                      {WEEKDAYS.map((day, index) => (
                        <th key={day} className="border border-border p-2 bg-muted min-w-[200px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period) => (
                      <tr key={period}>
                        <td className="border border-border p-2 bg-muted font-medium text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4" />
                            {period}
                          </div>
                        </td>
                        {WEEKDAYS.map((_, weekdayIndex) => {
                          const weekday = weekdayIndex + 1;
                          const key = `${weekday}-${period}`;
                          const entry = timetable[key] || { weekday, period, subject: '', location: '', notes: '' };
                          
                          return (
                            <td key={weekday} className="border border-border p-2">
                              <div className="space-y-2">
                                <div className="relative">
                                  <BookOpen className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                  <Input
                                    placeholder="Subject"
                                    value={entry.subject}
                                    onChange={(e) => updateEntry(weekday, period, 'subject', e.target.value)}
                                    className="pl-7 h-8 text-xs"
                                  />
                                </div>
                                <div className="relative">
                                  <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                  <Input
                                    placeholder="Location"
                                    value={entry.location}
                                    onChange={(e) => updateEntry(weekday, period, 'location', e.target.value)}
                                    className="pl-7 h-8 text-xs"
                                  />
                                </div>
                                <Input
                                  placeholder="Notes"
                                  value={entry.notes}
                                  onChange={(e) => updateEntry(weekday, period, 'notes', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};