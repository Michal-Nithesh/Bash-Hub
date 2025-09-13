import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Trophy, Target, TrendingUp, Plus, CheckCircle, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Navbar } from '@/components/Navbar';

interface UserProfile {
  id: string;
  full_name: string;
  leetcode_points: number;
  streak_count: number;
  college_name: string;
  leetcode_username: string;
}

interface UserStats {
  totalPoints: number;
  streak: number;
  rank: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  period?: number;
  completed: boolean;
  points: number;
  user_id: string;
  due_date: string;
  category: string;
  priority: string;
  created_at: string;
  completed_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  leetcode_problems: number;
  college_name: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  event_type: string;
  creator_id: string;
  registration_required?: boolean;
  max_participants?: number;
}

interface TimetableEntry {
  id: string;
  subject: string;
  location: string;
  period: number;
}

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [todayTimetable, setTodayTimetable] = useState<TimetableEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Add Task Dialog state
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    points: 10,
  });

  // Add Event Dialog state
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    location: '',
    event_type: 'general',
    registration_required: false,
  });

  const fetchTodayTimetable = useCallback(async () => {
    if (!user) return;

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
  }, [user]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
    }
  }, [user]);

  const fetchUserStats = useCallback(async () => {
    if (!user || !userProfile) return;

    setStatsLoading(true);

    try {
      // Calculate rank based on leetcode_points
      const { data: rankData, error: rankError } = await supabase
        .from('profiles')
        .select('id')
        .gt('leetcode_points', userProfile.leetcode_points || 0);

      if (rankError) throw rankError;

      const rank = (rankData?.length || 0) + 1;

      // Get today's tasks statistics
      const today = new Date().toISOString().split('T')[0];
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('completed')
        .eq('user_id', user.id)
        .eq('due_date', today);

      if (tasksError) throw tasksError;

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(task => task.completed).length || 0;

      const stats: UserStats = {
        totalPoints: userProfile.leetcode_points || 0,
        streak: userProfile.streak_count || 0,
        rank: rank,
        tasksCompleted: completedTasks,
        totalTasks: totalTasks,
      };

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user, userProfile]);

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        leetcode_points,
        college_name,
        leetcode_stats (
          total_solved
        )
      `)
      .order('leetcode_points', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      const leaderboardData: LeaderboardEntry[] = data?.map((profile, index) => ({
        rank: index + 1,
        name: profile.full_name || 'Anonymous',
        points: profile.leetcode_points || 0,
        leetcode_problems: profile.leetcode_stats?.[0]?.total_solved || 0,
        college_name: profile.college_name || ''
      })) || [];
      setLeaderboard(leaderboardData);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('due_date', today)
      .order('priority', { ascending: false })
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  }, [user]);

  const fetchUpcomingEvents = useCallback(async () => {
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('events')
      .select('id, title, start_date, location, event_type')
      .gte('start_date', today)
      .eq('is_active', true)
      .order('start_date')
      .limit(3);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  }, []);

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      // Refresh user stats to update task completion count
      if (userProfile) {
        fetchUserStats();
      }
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTask.title.trim()) return;

    setIsAddingTask(true);

    const today = new Date().toISOString().split('T')[0];
    
    const taskData = {
      user_id: user.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      category: newTask.category,
      priority: newTask.priority,
      points: newTask.points,
      due_date: today,
      completed: false,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
    } else {
      // Add to local state
      setTasks(prev => [...prev, data]);
      // Reset form
      setNewTask({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        points: 10,
      });
      // Close dialog
      setIsAddTaskDialogOpen(false);
      // Refresh user stats
      if (userProfile) {
        fetchUserStats();
      }
    }

    setIsAddingTask(false);
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEvent.title.trim() || !newEvent.start_date || !newEvent.start_time) return;

    setIsAddingEvent(true);

    // Combine date and time into a proper ISO string
    const startDateTime = new Date(`${newEvent.start_date}T${newEvent.start_time}`).toISOString();
    
    const eventData = {
      creator_id: user.id,
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || null,
      start_date: startDateTime,
      location: newEvent.location.trim() || null,
      event_type: newEvent.event_type,
      registration_required: newEvent.registration_required,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
    } else {
      // Add to local state
      setEvents(prev => [...prev, data]);
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        location: '',
        event_type: 'general',
        registration_required: false,
      });
      // Close dialog
      setIsAddEventDialogOpen(false);
    }

    setIsAddingEvent(false);
  };

  const refreshTasks = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('due_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const refreshEvents = async () => {
    const today = new Date();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', today.toISOString())
      .eq('is_active', true)
      .order('start_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchTodayTimetable(),
        fetchUserProfile(),
        fetchTasks(),
        fetchLeaderboard(),
        fetchUpcomingEvents()
      ]).finally(() => setLoading(false));
    }
  }, [user, fetchTodayTimetable, fetchUserProfile, fetchTasks, fetchLeaderboard, fetchUpcomingEvents]);

  useEffect(() => {
    if (userProfile) {
      fetchUserStats();
    }
  }, [userProfile, fetchUserStats]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {userProfile?.full_name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  {statsLoading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">{userStats?.totalPoints || 0}</p>
                  )}
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
                  {statsLoading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-accent">{userStats?.streak || 0} days</p>
                  )}
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
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-warning">#{userStats?.rank || '-'}</p>
                  )}
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
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{userStats?.tasksCompleted || 0}/{userStats?.totalTasks || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              {!statsLoading && userStats && (
                <Progress value={(userStats.tasksCompleted / userStats.totalTasks) * 100} className="mt-2" />
              )}
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
                <Button size="sm" onClick={() => setIsAddTaskDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
                        <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks for today</p>
                    <p className="text-sm">Add your first task to get started!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-accent/5 transition-colors">
                      <button
                        onClick={() => toggleTask(task.id, !task.completed)}
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-success border-success text-white' 
                            : 'border-muted-foreground hover:border-success'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {task.period && <span>Period {task.period}</span>}
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${
                            task.priority === 'high' ? 'border-red-200 text-red-700' :
                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-green-200 text-green-700'
                          }`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={task.completed ? 'secondary' : 'default'}>
                        {task.points} pts
                      </Badge>
                    </div>
                  ))
                )}
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
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No leaderboard data yet</p>
                  </div>
                ) : (
                  leaderboard.map((user) => (
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
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  <CardDescription>Stay updated with upcoming activities</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="h-4 w-4 bg-muted animate-pulse rounded mt-1"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming events</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()} at{' '}
                          {new Date(event.start_date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Add New Task
            </DialogTitle>
            <DialogDescription>
              Create a new task to track your daily progress and earn points.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={addTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                disabled={isAddingTask}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description (optional)</Label>
              <Textarea
                id="taskDescription"
                placeholder="Add task details..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                disabled={isAddingTask}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskCategory">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                  disabled={isAddingTask}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                  disabled={isAddingTask}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskPoints">Points Reward</Label>
              <Select
                value={newTask.points.toString()}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, points: parseInt(value) }))}
                disabled={isAddingTask}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 points (Quick task)</SelectItem>
                  <SelectItem value="10">10 points (Normal task)</SelectItem>
                  <SelectItem value="15">15 points (Important task)</SelectItem>
                  <SelectItem value="20">20 points (Major task)</SelectItem>
                  <SelectItem value="25">25 points (Challenge task)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2">Task Tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep tasks specific and achievable</li>
                <li>• Higher priority tasks help maintain streak</li>
                <li>• Completing tasks earns you points and ranks</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskDialogOpen(false)}
                disabled={isAddingTask}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingTask || !newTask.title.trim()}>
                {isAddingTask ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Add New Event
            </DialogTitle>
            <DialogDescription>
              Create a new event to share with the community and stay organized.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={addEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                disabled={isAddingEvent}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Description (optional)</Label>
              <Textarea
                id="eventDescription"
                placeholder="Describe the event..."
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                disabled={isAddingEvent}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                  disabled={isAddingEvent}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTime">Time *</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                  disabled={isAddingEvent}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Location (optional)</Label>
              <Input
                id="eventLocation"
                placeholder="Event location or online link"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                disabled={isAddingEvent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}
                disabled={isAddingEvent}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="contest">Contest</SelectItem>
                  <SelectItem value="placement">Placement</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="registrationRequired"
                checked={newEvent.registration_required}
                onChange={(e) => setNewEvent(prev => ({ ...prev, registration_required: e.target.checked }))}
                disabled={isAddingEvent}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="registrationRequired" className="text-sm">
                Registration required for this event
              </Label>
            </div>

            <div className="bg-muted rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2">Event Tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Include clear event details and timing</li>
                <li>• Add location or online meeting links</li>
                <li>• Events are visible to all community members</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEventDialogOpen(false)}
                disabled={isAddingEvent}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingEvent || !newEvent.title.trim() || !newEvent.start_date || !newEvent.start_time}>
                {isAddingEvent ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};