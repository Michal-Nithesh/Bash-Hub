import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Plus, 
  X, 
  Edit,
  Volume2,
  VolumeX,
  Target,
  Clock,
  Lightbulb,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

// Types and Interfaces
interface TimerSettings {
  workDuration: number;
  breakDuration: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface SessionData {
  date: string;
  sessionsCompleted: number;
  timeStudied: number;
  goalHours: number;
  accomplishments: string[];
  distractions: string[];
}

interface DistractionLog {
  id: string;
  timestamp: number;
  note: string;
}

const FocusMode: React.FC = () => {
  const { user, signOut } = useAuth();
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5
  });
  const [showSettings, setShowSettings] = useState(false);

  // Goal and Progress State
  const [dailyGoal, setDailyGoal] = useState(2); // Default 2 hours
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [timeStudiedToday, setTimeStudiedToday] = useState(0);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Journal and Reflection State
  const [sessionNote, setSessionNote] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  // Motivational State
  const [currentQuote, setCurrentQuote] = useState(0);
  const [streak, setStreak] = useState(0);

  // Distraction Log State
  const [distractions, setDistractions] = useState<DistractionLog[]>([]);
  const [showDistractionLog, setShowDistractionLog] = useState(false);
  const [distractionNote, setDistractionNote] = useState('');

  // Audio State
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [currentSound, setCurrentSound] = useState('white-noise');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Effects and Functions
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Session completed
            setIsRunning(false);
            handleSessionComplete();
            return isWorkSession ? settings.breakDuration * 60 : settings.workDuration * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isWorkSession, settings]);

  const handleSessionComplete = () => {
    if (isWorkSession) {
      // Completed a work session
      setSessionsCompleted(prev => prev + 1);
      setTimeStudiedToday(prev => prev + settings.workDuration);
      setShowReflection(true);
      
      // Rotate motivational quote
      setCurrentQuote(prev => (prev + 1) % motivationalQuotes.length);
    }
    
    // Switch between work and break
    setIsWorkSession(!isWorkSession);
    
    // Play completion sound if enabled
    if (isSoundEnabled) {
      // We'll implement sound notification here
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? settings.workDuration * 60 : settings.breakDuration * 60);
  };

  const updateTimerSettings = () => {
    if (!isRunning) {
      setTimeLeft(isWorkSession ? settings.workDuration * 60 : settings.breakDuration * 60);
    }
  };

  useEffect(() => {
    updateTimerSettings();
  }, [settings, isWorkSession]);

  // Local Storage Functions
  const getStorageKey = (key: string) => {
    const today = new Date().toISOString().split('T')[0];
    return `focus-mode-${key}-${today}`;
  };

  const loadDailyData = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`focus-mode-data-${today}`);
    
    if (savedData) {
      const data = JSON.parse(savedData) as SessionData;
      setSessionsCompleted(data.sessionsCompleted || 0);
      setTimeStudiedToday(data.timeStudied || 0);
      setDailyGoal(data.goalHours || 2);
    }

    // Load streak data
    const streakData = localStorage.getItem('focus-mode-streak');
    if (streakData) {
      setStreak(parseInt(streakData) || 0);
    }

    // Load tasks
    const savedTasks = localStorage.getItem(getStorageKey('tasks'));
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveDailyData = () => {
    const today = new Date().toISOString().split('T')[0];
    const data: SessionData = {
      date: today,
      sessionsCompleted,
      timeStudied: timeStudiedToday,
      goalHours: dailyGoal,
      accomplishments: [],
      distractions: distractions.map(d => d.note)
    };
    
    localStorage.setItem(`focus-mode-data-${today}`, JSON.stringify(data));
    localStorage.setItem('focus-mode-streak', streak.toString());
    localStorage.setItem(getStorageKey('tasks'), JSON.stringify(tasks));
  };

  // Load data on component mount
  useEffect(() => {
    loadDailyData();
  }, []);

  // Save data whenever relevant state changes
  useEffect(() => {
    saveDailyData();
  }, [sessionsCompleted, timeStudiedToday, dailyGoal, streak, tasks, distractions]);

  // Update streak logic
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const todayData = localStorage.getItem(`focus-mode-data-${today}`);
      const yesterdayData = localStorage.getItem(`focus-mode-data-${yesterday}`);
      
      if (todayData && yesterdayData) {
        const today_sessions = JSON.parse(todayData).sessionsCompleted || 0;
        const yesterday_sessions = JSON.parse(yesterdayData).sessionsCompleted || 0;
        
        if (today_sessions > 0 && yesterday_sessions > 0) {
          // Continue streak
        } else if (today_sessions > 0) {
          // Start new streak
          setStreak(1);
        }
      }
    };
    
    checkStreak();
  }, [sessionsCompleted]);

  // Task Management Functions
  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Badge and Achievement System
  const getBadges = () => {
    const badges = [];
    
    if (sessionsCompleted >= 3) {
      badges.push({ name: "Focus Streak", icon: "🔥", description: "3 sessions in a row" });
    }
    if (sessionsCompleted >= 5) {
      badges.push({ name: "Dedication", icon: "💪", description: "5 sessions today" });
    }
    if (streak >= 3) {
      badges.push({ name: "Consistency", icon: "⭐", description: "3+ day streak" });
    }
    if (streak >= 7) {
      badges.push({ name: "Week Warrior", icon: "👑", description: "1 week streak" });
    }
    if (timeStudiedToday >= dailyGoal * 60) {
      badges.push({ name: "Goal Crusher", icon: "🎯", description: "Daily goal achieved" });
    }
    
    return badges;
  };

  const getProgressMessage = () => {
    const progress = (timeStudiedToday / (dailyGoal * 60)) * 100;
    
    if (progress >= 100) return "🎉 Goal achieved! You're crushing it!";
    if (progress >= 75) return "🔥 So close! Keep pushing!";
    if (progress >= 50) return "💪 Halfway there! Great work!";
    if (progress >= 25) return "📚 Good start! Keep going!";
    return "🌱 Ready to begin your focus journey?";
  };

  // Session Journal Functions
  const saveSessionReflection = () => {
    if (sessionNote.trim()) {
      const today = new Date().toISOString().split('T')[0];
      const existingData = localStorage.getItem(`focus-mode-data-${today}`);
      
      if (existingData) {
        const data = JSON.parse(existingData) as SessionData;
        data.accomplishments = [...(data.accomplishments || []), sessionNote.trim()];
        localStorage.setItem(`focus-mode-data-${today}`, JSON.stringify(data));
      }
      
      setSessionNote('');
      setShowReflection(false);
      
      // Update streak if it's the first session today
      if (sessionsCompleted === 1) {
        setStreak(prev => prev + 1);
      }
    }
  };

  const getSessionHistory = () => {
    const today = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(`focus-mode-data-${today}`);
    
    if (data) {
      const sessionData = JSON.parse(data) as SessionData;
      return sessionData.accomplishments || [];
    }
    
    return [];
  };

  // Distraction Log Functions
  const logDistraction = () => {
    if (distractionNote.trim()) {
      const newDistraction: DistractionLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        note: distractionNote.trim()
      };
      
      setDistractions(prev => [...prev, newDistraction]);
      setDistractionNote('');
      setShowDistractionLog(false);
    }
  };

  const getDistractionStats = () => {
    const today = new Date().toDateString();
    const todayDistractions = distractions.filter(d => 
      new Date(d.timestamp).toDateString() === today
    );
    
    return {
      today: todayDistractions.length,
      thisWeek: distractions.filter(d => 
        Date.now() - d.timestamp < 7 * 24 * 60 * 60 * 1000
      ).length
    };
  };

  // Audio and Sound Functions
  const soundOptions = [
    { value: 'white-noise', label: 'White Noise', emoji: '🔊' },
    { value: 'rain', label: 'Rain Sounds', emoji: '🌧️' },
    { value: 'forest', label: 'Forest Ambience', emoji: '🌲' },
    { value: 'cafe', label: 'Café Atmosphere', emoji: '☕' },
    { value: 'ocean', label: 'Ocean Waves', emoji: '🌊' },
    { value: 'lo-fi', label: 'Lo-Fi Beats', emoji: '🎵' }
  ];

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    
    if (!isSoundEnabled) {
      // Start playing sound (in a real app, you'd load actual audio files)
      console.log(`Playing ${currentSound} sounds...`);
    } else {
      // Stop sound
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const changeSoundType = (soundType: string) => {
    setCurrentSound(soundType);
    if (isSoundEnabled) {
      // Switch to new sound type
      console.log(`Switching to ${soundType} sounds...`);
    }
  };

  // Motivational quotes
  const motivationalQuotes = [
    "Success is the sum of small efforts repeated day in and day out.",
    "Focus on progress, not perfection.",
    "The future depends on what you do today.",
    "Discipline is choosing between what you want now and what you want most.",
    "Every expert was once a beginner.",
    "Your only limit is your mind.",
    "Great things never come from comfort zones.",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ✨ Focus Mode – Study Smarter, One Session at a Time
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your personal focus space. Use the Pomodoro method to balance study and rest:
            Work with full focus for 25 minutes, recharge with a 5-minute break, and repeat to build a powerful study rhythm.
            Stay consistent, track your progress, and turn your study time into achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    {isWorkSession ? 'Focus Session' : 'Break Time'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Timer Display */}
                <div className="text-center mb-6">
                  <div className={`text-8xl font-bold transition-colors duration-300 mb-4 ${
                    isWorkSession 
                      ? 'text-primary' 
                      : 'text-accent'
                  }`}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  
                  {/* Session indicator */}
                  <div className="mb-4">
                    <Badge 
                      variant={isWorkSession ? "default" : "secondary"} 
                      className="text-sm px-3 py-1"
                    >
                      {isWorkSession ? '💼 Focus Time' : '☕ Break Time'}
                    </Badge>
                  </div>
                  
                  {/* Timer Controls */}
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={isRunning ? pauseTimer : startTimer}
                      className={`px-8 transition-all duration-200 ${
                        isRunning 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={resetTimer}
                      className="px-6"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Timer Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Work Duration (minutes)</label>
                        <Input 
                          type="number" 
                          value={settings.workDuration}
                          onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Break Duration (minutes)</label>
                        <Input 
                          type="number" 
                          value={settings.breakDuration}
                          onChange={(e) => setSettings({...settings, breakDuration: parseInt(e.target.value) || 5})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Study Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Add a study task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTask();
                      }
                    }}
                  />
                  <Button onClick={addTask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No tasks yet. Add some study goals!</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Break down your study session into smaller tasks</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 hover:bg-accent/5 ${
                        task.completed 
                          ? 'bg-muted/30 border-muted' 
                          : 'bg-background'
                      }`}>
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <span className={`flex-1 transition-all duration-200 ${
                          task.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}>
                          {task.text}
                        </span>
                        {task.completed && <span className="text-primary">✓</span>}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTask(task.id)}
                          className="opacity-60 hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Goal */}
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Daily Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Study {dailyGoal} hours today</span>
                    <span className="text-muted-foreground">{sessionsCompleted} sessions completed</span>
                  </div>
                  <Progress 
                    value={(timeStudiedToday / (dailyGoal * 60)) * 100} 
                    className="mb-2 h-3"
                  />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{Math.round(timeStudiedToday)} / {dailyGoal * 60} minutes</span>
                    <span>{Math.round((timeStudiedToday / (dailyGoal * 60)) * 100)}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Goal (hours)"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value) || 2)}
                    className="flex-1"
                    min="1"
                    max="12"
                  />
                  <Button variant="outline" size="sm">
                    Set
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Motivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-sm italic text-muted-foreground mb-3 p-3 bg-muted/30 rounded-lg">
                    "{motivationalQuotes[currentQuote]}"
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    <Badge variant="secondary" className="mb-2">
                      🔥 {streak} day streak
                    </Badge>
                    {getBadges().map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge.icon} {badge.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getProgressMessage()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDistractionLog(true)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Log Distraction
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={toggleSound}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                  {isSoundEnabled ? 'Sounds On' : 'Sounds Off'}
                </Button>

                {isSoundEnabled && (
                  <div className="pt-2 border-t">
                    <label className="text-sm font-medium mb-2 block">Background Sound:</label>
                    <div className="grid grid-cols-2 gap-1">
                      {soundOptions.map((sound) => (
                        <Button
                          key={sound.value}
                          variant={currentSound === sound.value ? "default" : "outline"}
                          size="sm"
                          className="text-xs p-2 h-auto"
                          onClick={() => changeSoundType(sound.value)}
                        >
                          <span className="mr-1">{sound.emoji}</span>
                          {sound.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Session Reflection Modal */}
        {showReflection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Session Complete! 🎉</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2">Great job completing your focus session!</p>
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                    Time studied: {settings.workDuration} minutes | Sessions today: {sessionsCompleted}
                  </div>
                  <p className="mb-2">What did you accomplish this session?</p>
                </div>
                <Textarea 
                  placeholder="Reflect on your achievements... (e.g., 'Finished math chapter 3', 'Completed essay outline')"
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowReflection(false)}>
                    Skip
                  </Button>
                  <Button onClick={saveSessionReflection}>
                    Save Reflection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Distraction Log Modal */}
        {showDistractionLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Log Distraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2">What distracted you? Being aware helps improve focus.</p>
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                    Today's distractions: {getDistractionStats().today} | This week: {getDistractionStats().thisWeek}
                  </div>
                </div>
                <Input 
                  placeholder="What was the distraction? (e.g., 'Phone notification', 'Noise outside')"
                  value={distractionNote}
                  onChange={(e) => setDistractionNote(e.target.value)}
                  className="mb-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      logDistraction();
                    }
                  }}
                />
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Recent distractions:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {distractions.slice(-3).map((distraction) => (
                      <div key={distraction.id} className="text-xs p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">
                          {new Date(distraction.timestamp).toLocaleTimeString()} - 
                        </span>
                        {distraction.note}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDistractionLog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={logDistraction}>
                    Log It
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
