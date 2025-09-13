import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, CheckCircle, ChevronRight, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface LeetCodeStats {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  contest_rating?: number;
  acceptance_rate?: number;
  streak_count?: number;
}

interface LeetCodeConnectProps {
  hasLeetCodeUsername: boolean;
  username?: string;
  userId: string;
  onUpdate?: () => void;
}

export default function LeetCodeConnect({
  hasLeetCodeUsername,
  username,
  userId,
  onUpdate,
}: LeetCodeConnectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState(username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const { toast } = useToast();

  // Fetch LeetCode stats from database
  const fetchLeetCodeStats = async (usernameToFetch: string) => {
    if (!usernameToFetch) return null;

    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase
        .from('leetcode_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching LeetCode stats:', error);
        return null;
      }

      if (data) {
        setLeetcodeStats(data);
        return data;
      }

      // If no stats in database, try to fetch from API
      return await fetchFromLeetCodeAPI(usernameToFetch);
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      return null;
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch stats from LeetCode API and store in database
  const fetchFromLeetCodeAPI = async (usernameToFetch: string) => {
    try {
      const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${usernameToFetch}/`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from LeetCode API');
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error('User not found on LeetCode');
      }

      const statsData = {
        user_id: userId,
        leetcode_username: usernameToFetch,
        total_solved: data.totalSolved || 0,
        easy_solved: data.easySolved || 0,
        medium_solved: data.mediumSolved || 0,
        hard_solved: data.hardSolved || 0,
        contest_rating: data.ranking || 0,
        acceptance_rate: parseFloat(data.acceptanceRate?.replace('%', '') || '0'),
        streak_count: 0, // This would need to be calculated separately
      };

      // Store in database
      const { error: upsertError } = await supabase
        .from('leetcode_stats')
        .upsert(statsData, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error storing LeetCode stats:', upsertError);
      }

      setLeetcodeStats(statsData);
      return statsData;
    } catch (error) {
      console.error('Error fetching from LeetCode API:', error);
      throw error;
    }
  };

  // Load stats when component mounts if username exists
  useEffect(() => {
    if (hasLeetCodeUsername && username) {
      fetchLeetCodeStats(username);
    }
  }, [hasLeetCodeUsername, username, userId]);

  const validateLeetCodeUsername = async (usernameToValidate: string) => {
    try {
      setIsVerifying(true);
      const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${usernameToValidate}/`
      );
      
      if (!response.ok) {
        throw new Error('Failed to connect to LeetCode API');
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error('LeetCode username not found. Please check and try again.');
      }

      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError('');

    if (!leetcodeUsername.trim()) {
      setValidationError('Please enter a valid LeetCode username');
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate username exists on LeetCode
      await validateLeetCodeUsername(leetcodeUsername);

      // Update profile with LeetCode username
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ leetcode_username: leetcodeUsername })
        .eq('id', userId);

      if (profileError) {
        throw new Error('Failed to update profile');
      }

      // Fetch and store LeetCode stats
      await fetchFromLeetCodeAPI(leetcodeUsername);

      setSuccessMessage('LeetCode username successfully connected!');
      toast({
        title: "Success",
        description: "LeetCode account connected successfully!",
      });

      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }

      // Close dialog after success
      setTimeout(() => {
        setIsDialogOpen(false);
        setIsSubmitting(false);
        setSuccessMessage('');
      }, 2000);

    } catch (error: any) {
      console.error('Error connecting LeetCode:', error);
      setValidationError(error.message || 'Could not verify username. Please try again later.');
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Remove LeetCode username from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ leetcode_username: null })
        .eq('id', userId);

      if (profileError) {
        throw new Error('Failed to disconnect LeetCode account');
      }

      // Remove LeetCode stats
      const { error: statsError } = await supabase
        .from('leetcode_stats')
        .delete()
        .eq('user_id', userId);

      if (statsError) {
        console.error('Error removing LeetCode stats:', statsError);
      }

      setLeetcodeStats(null);
      toast({
        title: "Success",
        description: "LeetCode account disconnected successfully!",
      });

      if (onUpdate) {
        onUpdate();
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error disconnecting LeetCode:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect LeetCode account",
        variant: "destructive",
      });
    }
  };

  const refreshStats = async () => {
    if (!username) return;
    
    try {
      setIsLoadingStats(true);
      await fetchFromLeetCodeAPI(username);
      toast({
        title: "Success",
        description: "LeetCode stats refreshed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh LeetCode stats",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div
        className={`rounded-xl p-4 flex items-center justify-between ${
          hasLeetCodeUsername
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              hasLeetCodeUsername ? 'bg-green-500/20' : 'bg-blue-500/20'
            }`}
          >
            <Code2
              className={`h-5 w-5 ${
                hasLeetCodeUsername ? 'text-green-400' : 'text-blue-400'
              }`}
            />
          </div>
          <div>
            <h3 className="font-medium">
              {hasLeetCodeUsername ? 'LeetCode Connected' : 'Connect LeetCode'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasLeetCodeUsername
                ? `Username: ${username} • ${leetcodeStats?.total_solved || 0} problems solved`
                : 'Add your LeetCode username to track your progress'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {hasLeetCodeUsername && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStats}
              disabled={isLoadingStats}
              className="text-green-400"
            >
              {isLoadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          )}
          <Button
            variant={hasLeetCodeUsername ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className={hasLeetCodeUsername ? 'text-green-400' : 'text-blue-400'}
          >
            {hasLeetCodeUsername ? 'View' : 'Connect'}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-400" />
              {hasLeetCodeUsername
                ? 'Your LeetCode Profile'
                : 'Connect Your LeetCode Account'}
            </DialogTitle>
            <DialogDescription>
              {hasLeetCodeUsername
                ? 'Your LeetCode progress is helping you climb the leaderboard'
                : 'Add your LeetCode username to track your coding progress and compete on the leaderboard'}
            </DialogDescription>
          </DialogHeader>

          {!hasLeetCodeUsername ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Enter your LeetCode username to connect your account
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your LeetCode username"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || isVerifying}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>

                {validationError && (
                  <div className="mt-2 text-destructive text-sm flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-2 text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </div>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">
                  Benefits of connecting your LeetCode account:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Track your problem-solving progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Compete on the LeetCode leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Earn additional points for consistent practice</span>
                  </li>
                </ul>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">{username}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    Connected
                  </Badge>
                </div>

                {isLoadingStats ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading stats...
                  </div>
                ) : leetcodeStats ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Solved</div>
                      <div className="font-semibold text-lg">{leetcodeStats.total_solved}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Acceptance Rate</div>
                      <div className="font-semibold text-lg">{leetcodeStats.acceptance_rate?.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Easy</div>
                      <div className="font-semibold text-green-600">{leetcodeStats.easy_solved}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Medium</div>
                      <div className="font-semibold text-yellow-600">{leetcodeStats.medium_solved}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Hard</div>
                      <div className="font-semibold text-red-600">{leetcodeStats.hard_solved}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Contest Rating</div>
                      <div className="font-semibold">{leetcodeStats.contest_rating || 'N/A'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No stats available. Click refresh to load.
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Your LeetCode progress is now being tracked. Keep solving problems to improve your ranking!
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`https://leetcode.com/${username}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}