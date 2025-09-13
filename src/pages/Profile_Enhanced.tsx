import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { User, Mail, School, Linkedin, Github, Trophy, Target, TrendingUp, Code, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserStats {
  totalPoints: number;
  streak: number;
  rank: number;
  leetcodeSolved: number;
  tasksCompleted: number;
}

interface LeetCodeStats {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  contest_rating: number;
  acceptance_rate: number;
  streak_count: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: 'task' | 'leetcode' | 'certificate' | 'event';
  date: string;
  points?: number;
}

export const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [profile, setProfile] = useState({
    full_name: '',
    personal_email: '',
    college_email: '',
    leetcode_username: '',
    linkedin_url: '',
    college_name: '',
    bio: '',
    year_of_study: '',
    branch: '',
    phone_number: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        personal_email: data.personal_email || '',
        college_email: data.college_email || '',
        leetcode_username: data.leetcode_username || '',
        linkedin_url: data.linkedin_url || '',
        college_name: data.college_name || '',
        bio: data.bio || '',
        year_of_study: data.year_of_study?.toString() || '',
        branch: data.branch || '',
        phone_number: data.phone_number || '',
      });
      
      // Calculate profile completeness
      calculateProfileCompleteness(data);
    }
    setLoading(false);
  }, [user, toast]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;

    setStatsLoading(true);
    try {
      // Get user's profile for points and streak
      const { data: profileData } = await supabase
        .from('profiles')
        .select('leetcode_points, streak_count')
        .eq('id', user.id)
        .single();

      // Calculate rank
      const { data: rankData } = await supabase
        .from('profiles')
        .select('id')
        .gt('leetcode_points', profileData?.leetcode_points || 0);

      const rank = (rankData?.length || 0) + 1;

      // Get completed tasks count
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Get LeetCode stats
      const { data: leetcodeData } = await supabase
        .from('leetcode_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserStats({
        totalPoints: profileData?.leetcode_points || 0,
        streak: profileData?.streak_count || 0,
        rank: rank,
        leetcodeSolved: leetcodeData?.total_solved || 0,
        tasksCompleted: tasksData?.length || 0,
      });

      if (leetcodeData) {
        setLeetcodeStats(leetcodeData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const fetchRecentActivities = useCallback(async () => {
    if (!user) return;

    try {
      // Get recent completed tasks
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id, title, completed_at, points')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(3);

      // Get recent LeetCode submissions
      const { data: recentSubmissions } = await supabase
        .from('leetcode_submissions')
        .select('id, problem_title, submission_date')
        .eq('user_id', user.id)
        .order('submission_date', { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];

      // Add tasks
      recentTasks?.forEach(task => {
        activities.push({
          id: task.id,
          title: `Completed: ${task.title}`,
          type: 'task',
          date: task.completed_at,
          points: task.points,
        });
      });

      // Add submissions
      recentSubmissions?.forEach(submission => {
        activities.push({
          id: submission.id,
          title: `Solved: ${submission.problem_title}`,
          type: 'leetcode',
          date: submission.submission_date,
        });
      });

      // Sort by date and take top 5
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [user]);

  const calculateProfileCompleteness = (profileData: Record<string, string | number | null>) => {
    const fields = [
      'full_name', 'personal_email', 'college_email', 'leetcode_username',
      'linkedin_url', 'college_name', 'bio', 'year_of_study', 'branch', 'phone_number'
    ];
    
    const filledFields = fields.filter(field => profileData[field] && profileData[field]?.toString().trim() !== '');
    const completeness = Math.round((filledFields.length / fields.length) * 100);
    setProfileCompleteness(completeness);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      // Recalculate completeness after update
      fetchProfile();
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [user, fetchProfile, fetchUserStats, fetchRecentActivities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header with Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Completeness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span className="font-medium">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                  {profileCompleteness < 100 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Complete your profile to improve visibility
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                ) : userStats ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Points</span>
                      <Badge variant="secondary">{userStats.totalPoints}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rank</span>
                      <Badge variant="outline">#{userStats.rank}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Streak</span>
                      <Badge variant="default">{userStats.streak} days</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No stats available</p>
                )}
              </CardContent>
            </Card>

            {/* LeetCode Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  LeetCode Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                ) : leetcodeStats ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Problems Solved</span>
                      <Badge variant="secondary">{leetcodeStats.total_solved}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Easy / Medium / Hard</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs px-1">{leetcodeStats.easy_solved}</Badge>
                        <Badge variant="outline" className="text-xs px-1">{leetcodeStats.medium_solved}</Badge>
                        <Badge variant="outline" className="text-xs px-1">{leetcodeStats.hard_solved}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Acceptance Rate</span>
                      <Badge variant="default">{leetcodeStats.acceptance_rate}%</Badge>
                    </div>
                  </div>
                ) : profile.leetcode_username ? (
                  <p className="text-sm text-muted-foreground">Connect your LeetCode to see stats</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Add LeetCode username to track progress</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Form */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={profile.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="personalEmail">Personal Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="personalEmail"
                            type="email"
                            placeholder="your.email@gmail.com"
                            className="pl-10"
                            value={profile.personal_email}
                            onChange={(e) => handleInputChange('personal_email', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="collegeEmail">College Email</Label>
                        <div className="relative">
                          <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="collegeEmail"
                            type="email"
                            placeholder="student@college.edu"
                            className="pl-10"
                            value={profile.college_email}
                            onChange={(e) => handleInputChange('college_email', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="leetcodeUsername"
                            placeholder="leetcode_user123"
                            className="pl-10"
                            value={profile.leetcode_username}
                            onChange={(e) => handleInputChange('leetcode_username', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collegeName">College Name</Label>
                      <Input
                        id="collegeName"
                        placeholder="Your college name"
                        value={profile.college_name}
                        onChange={(e) => handleInputChange('college_name', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearOfStudy">Year of Study</Label>
                        <Input
                          id="yearOfStudy"
                          placeholder="e.g., 2, 3, 4"
                          value={profile.year_of_study}
                          onChange={(e) => handleInputChange('year_of_study', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Input
                          id="branch"
                          placeholder="e.g., Computer Science"
                          value={profile.branch}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+91 9876543210"
                        value={profile.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="linkedinUrl"
                          placeholder="https://linkedin.com/in/username"
                          className="pl-10"
                          value={profile.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Complete tasks or solve problems to see activity here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'task' ? 'bg-blue-100 text-blue-700' :
                            activity.type === 'leetcode' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {activity.type === 'task' ? <CheckCircle className="h-4 w-4" /> :
                             activity.type === 'leetcode' ? <Code className="h-4 w-4" /> :
                             <Trophy className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()} at{' '}
                              {new Date(activity.date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {activity.points && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                +{activity.points} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};