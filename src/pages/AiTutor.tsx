import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bot, 
  Brain, 
  BookOpen, 
  Calculator, 
  Code, 
  FileText, 
  Lightbulb, 
  MessageSquare, 
  Zap,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';

interface TutorFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  examples: string[];
}

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  questionsAsked: number;
  conceptsLearned: string[];
  timestamp: Date;
}

interface LearningStats {
  totalSessions: number;
  totalQuestions: number;
  favoriteSubjects: string[];
  weeklyProgress: number;
  studyStreak: number;
}

export const AiTutor: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(true); // Open by default on tutor page
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [recentSessions] = useState<StudySession[]>([
    {
      id: '1',
      subject: 'Mathematics',
      duration: 45,
      questionsAsked: 12,
      conceptsLearned: ['Calculus', 'Derivatives', 'Integration'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      subject: 'Computer Science',
      duration: 60,
      questionsAsked: 8,
      conceptsLearned: ['Data Structures', 'Algorithms', 'Binary Trees'],
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      subject: 'Physics',
      duration: 30,
      questionsAsked: 6,
      conceptsLearned: ['Quantum Mechanics', 'Wave Functions'],
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ]);

  const [learningStats] = useState<LearningStats>({
    totalSessions: 24,
    totalQuestions: 156,
    favoriteSubjects: ['Mathematics', 'Computer Science', 'Physics'],
    weeklyProgress: 85,
    studyStreak: 7
  });

  const tutorFeatures: TutorFeature[] = [
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Mathematics",
      description: "Get help with algebra, calculus, statistics, and more",
      category: "Math",
      examples: ["Solve equations", "Explain derivatives", "Help with proofs"]
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Programming",
      description: "Debug code, learn algorithms, and understand concepts",
      category: "CS",
      examples: ["Debug my code", "Explain recursion", "Help with data structures"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Science",
      description: "Physics, chemistry, biology concepts explained simply",
      category: "Science",
      examples: ["Explain photosynthesis", "Help with physics problems", "Chemistry reactions"]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Essay Writing",
      description: "Improve your writing with structure and style tips",
      category: "Writing",
      examples: ["Review my essay", "Help with thesis", "Improve grammar"]
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Literature",
      description: "Analyze texts, understand themes, and discuss ideas",
      category: "Literature",
      examples: ["Analyze Shakespeare", "Discuss themes", "Character analysis"]
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Problem Solving",
      description: "Break down complex problems into manageable steps",
      category: "General",
      examples: ["Step-by-step solutions", "Think through problems", "Find patterns"]
    }
  ];

  const quickStartPrompts = [
    "Help me understand calculus derivatives",
    "Explain how binary search works",
    "What is photosynthesis and how does it work?",
    "Review my code for errors",
    "Help me write a thesis statement",
    "Explain quantum physics concepts"
  ];

  const handleQuickStart = (prompt: string) => {
    setIsChatbotOpen(true);
    setIsChatbotMinimized(false);
    setInitialMessage(prompt);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar isAuthenticated={!!user} onLogout={signOut} />
      
      {/* Full-page chatbot */}
      <div className="flex-1">
        <Chatbot
          fullPage={true}
          initialMessage={initialMessage}
        />
      </div>
    </div>
  );
};

export default AiTutor;
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Tutor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI learning companion. Get instant help with homework, understand complex concepts, 
            and accelerate your learning journey with personalized tutoring.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Study Sessions</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{learningStats.totalSessions}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Questions Asked</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{learningStats.totalQuestions}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Study Streak</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{learningStats.studyStreak} days</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Weekly Progress</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{learningStats.weeklyProgress}%</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <Progress value={learningStats.weeklyProgress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Tutor Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  What I Can Help You With
                </CardTitle>
                <CardDescription>
                  Explore the different subjects and topics where your AI tutor can assist you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleQuickStart(`Help me with ${feature.title.toLowerCase()}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{feature.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {feature.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {feature.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Examples: {feature.examples.join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Click on any of these prompts to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickStartPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => handleQuickStart(prompt)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Study Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Recent Study Sessions
                </CardTitle>
                <CardDescription>
                  Review your latest learning activities and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.questionsAsked} questions • {formatDuration(session.duration)}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.conceptsLearned.map((concept, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {getTimeAgo(session.timestamp)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Control Panel */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  AI Tutor Assistant
                </CardTitle>
                <CardDescription>
                  Your AI tutor is ready to help you learn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>✨ Ask any academic question</p>
                    <p>📁 Upload files for analysis</p>
                    <p>🧠 Get personalized explanations</p>
                    <p>📚 Learn at your own pace</p>
                  </div>
                  
                  {!isChatbotOpen ? (
                    <Button 
                      onClick={() => setIsChatbotOpen(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Learning Session
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        AI Tutor is active
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChatbotMinimized(!isChatbotMinimized)}
                        className="w-full"
                      >
                        {isChatbotMinimized ? 'Show Chat' : 'Minimize Chat'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Ask Specific Questions</p>
                    <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                      Instead of "Help with math", try "Explain how to solve quadratic equations"
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                    <p className="font-medium text-green-800 dark:text-green-200">Upload Your Work</p>
                    <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                      Share homework, notes, or problems for personalized feedback
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                    <p className="font-medium text-purple-800 dark:text-purple-200">Practice Regularly</p>
                    <p className="text-purple-600 dark:text-purple-300 text-xs mt-1">
                      Consistent daily practice helps reinforce learning
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favorite Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Your Favorite Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {learningStats.favoriteSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{subject}</span>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      {isChatbotOpen && (
        <Chatbot
          isMinimized={isChatbotMinimized}
          onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
          onClose={() => {
            setIsChatbotOpen(false);
            setIsChatbotMinimized(false);
            setInitialMessage('');
          }}
          initialMessage={initialMessage}
        />
      )}
    </div>
  );
};