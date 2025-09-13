import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Trophy, Target, TrendingUp, Plus, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';

// Mock data - will be replaced with real data from Supabase
const mockUser = {
  name: 'John Doe',
  points: 1250,
  streak: 5,
  rank: 15
};

const mockTasks = [
  { id: 1, title: 'Complete Data Structures Assignment', period: 3, completed: false, points: 25 },
  { id: 2, title: 'Review Algorithm Concepts', period: 5, completed: true, points: 15 },
  { id: 3, title: 'Solve 3 LeetCode Problems', period: 7, completed: false, points: 30 }
];

const mockLeaderboard = [
  { rank: 1, name: 'Alice Smith', points: 1850, leetcode: 250 },
  { rank: 2, name: 'Bob Johnson', points: 1720, leetcode: 180 },
  { rank: 3, name: 'Carol Davis', points: 1650, leetcode: 200 }
];

const mockEvents = [
  { title: 'Algorithm Workshop', date: '2024-01-15', time: '10:00 AM' },
  { title: 'Hackathon 2024', date: '2024-01-20', time: '9:00 AM' }
];

interface TimetableEntry {
  id: string;
  subject: string;
  location: string;
  period: number;
}

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [todayTimetable, setTodayTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayTimetable();
    }
  }, [user]);

  const fetchTodayTimetable = async () => {
    if (!user) return;

    setLoading(true);
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekday = today === 0 ? 7 : today; // Convert Sunday to 7, keep others same

    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('owner', user.id)
      .eq('weekday', weekday)
      .order('period');

    if (error) {
      console.error('Error fetching timetable:', error);
    } else {
      setTodayTimetable(data || []);
    }

    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {mockUser.name}! 👋</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-primary">{mockUser.points}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-accent">{mockUser.streak} days</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leaderboard Rank</p>
                  <p className="text-2xl font-bold text-warning">#{mockUser.rank}</p>
                </div>
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Today</p>
                  <p className="text-2xl font-bold">3/5</p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Timetable */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : todayTimetable.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No classes scheduled for today</p>
                    <Link to="/timetable" className="text-primary hover:underline text-sm">
                      Add your timetable →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTimetable.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{entry.subject}</div>
                          <div className="text-sm text-muted-foreground">{entry.location}</div>
                        </div>
                        <Badge variant="outline">Period {entry.period}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Today's Tasks */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Tasks</CardTitle>
                  <CardDescription>Complete your daily goals</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-accent/5 transition-colors">
                    <div className={`h-4 w-4 rounded-full border-2 ${task.completed ? 'bg-success border-success' : 'border-muted-foreground'}`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">Period {task.period}</p>
                    </div>
                    <Badge variant={task.completed ? 'secondary' : 'default'}>
                      {task.points} pts
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performers</CardTitle>
                <CardDescription>This week's leaders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLeaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.points} pts</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};