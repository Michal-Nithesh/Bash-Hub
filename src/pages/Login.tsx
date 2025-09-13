import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Login: React.FC = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Ensure email is properly formatted and trimmed
      const trimmedEmail = formData.email.trim().toLowerCase();
      
      console.log('Login attempt with:', { email: trimmedEmail });
      
      const result = await signIn(trimmedEmail, formData.password);
      
      console.log('Auth result:', result);
      
      if (result?.error) {
        console.error('Login error details:', result.error);
        
        // Specific error handling based on error messages
        if (result.error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (result.error.message.includes('rate limit')) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(`Authentication error: ${result.error.message}`);
        }
      } else if (result?.user) {
        console.log('Login successful, user:', result.user);
        // The useEffect above will handle navigation when user state updates
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(`Login failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate floating objects
  const FloatingObject = ({ 
    size, 
    delay, 
    duration, 
    top, 
    left, 
    shape = 'sphere',
    color = 'primary'
  }: {
    size: number;
    delay: number;
    duration: number;
    top: string;
    left: string;
    shape?: 'sphere' | 'cube' | 'triangle' | 'ring';
    color?: string;
  }) => {
    const baseClasses = `absolute opacity-20 animate-pulse`;
    const shapeClasses = {
      sphere: 'rounded-full bg-gradient-to-br',
      cube: 'rounded-lg bg-gradient-to-br transform rotate-45',
      triangle: 'w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent',
      ring: 'rounded-full border-4 bg-transparent'
    };

    const colorClasses = {
      primary: 'from-primary/30 to-accent/30',
      secondary: 'from-purple-400/30 to-pink-400/30',
      tertiary: 'from-blue-400/30 to-cyan-400/30',
      quaternary: 'from-green-400/30 to-emerald-400/30'
    };

    return (
      <div
        className={`${baseClasses} ${shapeClasses[shape]} ${shape !== 'triangle' ? colorClasses[color as keyof typeof colorClasses] : ''}`}
        style={{
          width: shape === 'triangle' ? '0' : `${size}px`,
          height: shape === 'triangle' ? '0' : `${size}px`,
          top,
          left,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          borderBottomColor: shape === 'triangle' ? `hsl(var(--primary))` : undefined,
          borderColor: shape === 'ring' ? `hsl(var(--primary))` : undefined,
          transform: `
            translateX(${Math.sin(Date.now() * 0.001 + delay) * 20}px) 
            translateY(${Math.cos(Date.now() * 0.0015 + delay) * 15}px)
            rotateX(${mousePosition.x * 0.1}deg)
            rotateY(${mousePosition.y * 0.1}deg)
          `,
          transition: 'transform 0.1s ease-out'
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
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