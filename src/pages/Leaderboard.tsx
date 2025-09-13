import React, { useState } from 'react';
import { Trophy, Medal, Crown, User, Code, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, name: 'Alice Smith', college: 'GEC Thiruvananthapuram', leetcodeSolved: 250, points: 1850, streak: 12, avatar: '👩‍💻' },
  { rank: 2, name: 'Bob Johnson', college: 'LBS College of Engineering', leetcodeSolved: 180, points: 1720, streak: 8, avatar: '👨‍💻' },
  { rank: 3, name: 'Carol Davis', college: 'College of Engineering, Trivandrum', leetcodeSolved: 200, points: 1650, streak: 15, avatar: '👩‍🎓' },
  { rank: 4, name: 'David Wilson', college: 'Noorul Islam Centre', leetcodeSolved: 165, points: 1580, streak: 6, avatar: '👨‍🎓' },
  { rank: 5, name: 'Emma Brown', college: 'Francis Xavier Engineering', leetcodeSolved: 190, points: 1520, streak: 9, avatar: '👩‍💻' },
  { rank: 6, name: 'Frank Miller', college: 'GEC Thiruvananthapuram', leetcodeSolved: 145, points: 1480, streak: 4, avatar: '👨‍💻' },
  { rank: 7, name: 'Grace Lee', college: 'Kamaraj College of Engineering', leetcodeSolved: 175, points: 1420, streak: 11, avatar: '👩‍🎓' },
  { rank: 8, name: 'Henry Chen', college: 'CSI Institute of Technology', leetcodeSolved: 155, points: 1380, streak: 7, avatar: '👨‍💻' }
];

export const Leaderboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setColegeFilter] = useState('all');

  const filteredLeaderboard = mockLeaderboard.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = collegeFilter === 'all' || user.college.includes(collegeFilter);
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
            />
          </div>
          <div>
            <Select onValueChange={setColegeFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                <SelectItem value="GEC">GEC Thiruvananthapuram</SelectItem>
                <SelectItem value="LBS">LBS College of Engineering</SelectItem>
                <SelectItem value="College of Engineering">College of Engineering, Trivandrum</SelectItem>
                <SelectItem value="Noorul Islam">Noorul Islam Centre</SelectItem>
                <SelectItem value="Francis Xavier">Francis Xavier Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredLeaderboard.slice(0, 3).map((user, index) => (
            <Card key={user.rank} className={`${getRankStyle(user.rank)} transition-all duration-300 hover:scale-105`}>
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

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLeaderboard.map((user) => (
                <div 
                  key={user.rank} 
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
      </div>
    </div>
  );
};