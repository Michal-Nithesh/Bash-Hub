import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Crown, User, Code, Target, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  college: string;
  leetcodeSolved: number;
  points: number;
  streak: number;
  avatar?: string;
  leetcode_username?: string;
}

export const Leaderboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colleges, setColleges] = useState<string[]>([]);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles with LeetCode usernames
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          college_name,
          streak_count,
          leetcode_points,
          total_problems_solved,
          avatar_url,
          leetcode_username
        `)
        .not('full_name', 'is', null);

      if (profilesError) throw profilesError;

      // Helper function to fetch LeetCode stats from API
      const fetchLeetCodeStats = async (username: string): Promise<number> => {
        try {
          const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
          if (response.ok) {
            const data = await response.json();
            return data.totalSolved || 0;
          }
        } catch (error) {
          console.warn(`Error fetching LeetCode stats for ${username}:`, error);
        }
        return 0;
      };

      // Process profiles and fetch LeetCode data in parallel
      const leaderboardPromises = profilesData?.map(async (profile) => {
        let leetcodeSolved = 0;
        
        // Fetch from API if username exists
        if (profile.leetcode_username) {
          leetcodeSolved = await fetchLeetCodeStats(profile.leetcode_username);
        } else {
          // Fallback to database value if no username
          leetcodeSolved = profile.total_problems_solved || 0;
        }

        const points = profile.leetcode_points || (profile.streak_count * 10) + (leetcodeSolved * 5);
        
        return {
          rank: 0, // Will be assigned after sorting
          id: profile.id,
          name: profile.full_name || 'Anonymous',
          college: profile.college_name || 'Unknown College',
          leetcodeSolved: leetcodeSolved,
          points: points,
          streak: profile.streak_count || 0,
          avatar: profile.avatar_url || getRandomAvatar(),
          leetcode_username: profile.leetcode_username
        };
      }) || [];

      // Wait for all API calls to complete
      const leaderboardData = await Promise.all(leaderboardPromises);

      // Sort and assign ranks based on LeetCode problems solved
      const leaderboard: LeaderboardEntry[] = leaderboardData
        .sort((a, b) => {
          // Primary ranking: LeetCode problems solved (descending)
          if (b.leetcodeSolved !== a.leetcodeSolved) {
            return b.leetcodeSolved - a.leetcodeSolved;
          }
          // Secondary ranking: Points (for tie-breaking)
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          // Tertiary ranking: Streak (for additional tie-breaking)
          return b.streak - a.streak;
        })
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboardData(leaderboard);

      // Extract unique colleges for filter
      const uniqueColleges = Array.from(new Set(
        leaderboard.map(entry => entry.college).filter(college => college && college !== 'Unknown College')
      ));
      setColleges(uniqueColleges);

    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to get random avatar if none provided
  const getRandomAvatar = () => {
    const avatars = ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍🔬', '👨‍🔬'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const filteredLeaderboard = leaderboardData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = collegeFilter === 'all' || user.college.toLowerCase().includes(collegeFilter.toLowerCase());
    return matchesSearch && matchesCollege;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'hover:bg-accent/50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-muted-foreground">Compete with the best students across Kanyakumari district</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
          <div>
            <Select onValueChange={setCollegeFilter} defaultValue="all" disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading leaderboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error loading leaderboard: {error}</p>
            <button 
              onClick={fetchLeaderboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {filteredLeaderboard.slice(0, 3).map((user, index) => (
                <Card key={user.id} className={`${getRankStyle(user.rank)} transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="text-4xl mb-2">{user.avatar}</div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{user.college}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-primary">{user.points}</p>
                        <p className="text-muted-foreground">Points</p>
                      </div>
                      <div>
                        <p className="font-medium text-accent">{user.leetcodeSolved}</p>
                        <p className="text-muted-foreground">LeetCode</p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="mt-4">
                      🔥 {user.streak} day streak
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No results message */}
            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students found matching your criteria.</p>
              </div>
            )}

            {/* Full Leaderboard */}
            {filteredLeaderboard.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Full Rankings ({filteredLeaderboard.length} students)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredLeaderboard.map((user) => (
                      <div 
                        key={user.id} 
                        className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${getRankStyle(user.rank)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <span className="font-bold text-sm">#{user.rank}</span>
                          </div>
                          <div className="text-2xl">{user.avatar}</div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.college}</p>
                          {user.leetcode_username && (
                            <p className="text-xs text-blue-600">@{user.leetcode_username}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-primary">{user.points}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <Code className="h-4 w-4 text-accent" />
                              <span className="font-semibold text-accent">{user.leetcodeSolved}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">LeetCode</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-orange-500">🔥</span>
                              <span className="font-semibold">{user.streak}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};