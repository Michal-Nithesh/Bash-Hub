import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, School, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const COLLEGES = [
  'Government Engineering College, Thiruvananthapuram',
  'LBS College of Engineering, Thiruvananthapuram',
  'College of Engineering, Trivandrum',
  'Noorul Islam Centre for Higher Education',
  'Francis Xavier Engineering College',
  'Kamaraj College of Engineering and Technology',
  'CSI Institute of Technology',
  'V.V. College of Engineering',
  'Ponjesly College of Engineering',
  'Other (Please specify)'
];

export const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    personalEmail: '',
    password: '',
    confirmPassword: '',
    leetcodeUsername: '',
    collegeEmail: '',
    linkedinUrl: '',
    collegeName: '',
    otherCollege: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData.personalEmail, formData.password, {
        full_name: formData.fullName,
        college_email: formData.collegeEmail,
        leetcode_username: formData.leetcodeUsername,
        linkedin_url: formData.linkedinUrl,
        college_name: formData.collegeName === 'Other (Please specify)' ? formData.otherCollege : formData.collegeName,
      });

      if (result.error) {
        // Handle specific Supabase errors
        if (result.error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (result.error.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(result.error.message);
        }
      } else if (result.data.user) {
        // Account created successfully - user can now access the app immediately
        console.log('Account created successfully:', result.data.user);
        navigate('/dashboard');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BashHub
            </span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Join BashHub</CardTitle>
            <CardDescription>
              Create your account and start your journey to academic excellence
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Personal Email */}
                <div className="space-y-2">
                  <Label htmlFor="personalEmail">Personal Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="personalEmail"
                      type="email"
                      placeholder="your.email@gmail.com"
                      className="pl-10"
                      value={formData.personalEmail}
                      onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LeetCode Username */}
                <div className="space-y-2">
                  <Label htmlFor="leetcodeUsername">LeetCode Username *</Label>
                  <Input
                    id="leetcodeUsername"
                    placeholder="leetcode_user123"
                    value={formData.leetcodeUsername}
                    onChange={(e) => handleInputChange('leetcodeUsername', e.target.value)}
                    required
                  />
                </div>

                {/* College Email */}
                <div className="space-y-2">
                  <Label htmlFor="collegeEmail">College Email</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="collegeEmail"
                      type="email"
                      placeholder="student@college.edu.in"
                      className="pl-10"
                      value={formData.collegeEmail}
                      onChange={(e) => handleInputChange('collegeEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* College Name */}
              <div className="space-y-2">
                <Label htmlFor="collegeName">College *</Label>
                <Select onValueChange={(value) => handleInputChange('collegeName', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.collegeName === 'Other (Please specify)' && (
                <div className="space-y-2">
                  <Label htmlFor="otherCollege">College Name</Label>
                  <Input
                    id="otherCollege"
                    placeholder="Enter your college name"
                    value={formData.otherCollege}
                    onChange={(e) => handleInputChange('otherCollege', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};