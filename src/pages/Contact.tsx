import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MessageSquare, User, GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Contact: React.FC = () => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("");

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/xwpnzwyq", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });
      
      if (response.ok) {
        setStatus("Thanks for your message! We'll get back to you soon.");
        form.reset();
        setFormData({ name: '', email: '', message: '' });
      } else {
        setError("Oops! There was a problem sending your message. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <CardTitle className="text-2xl">Contact Us</CardTitle>
            <CardDescription>
              Have a question or need help? We'd love to hear from you!
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {status && (
                <Alert>
                  <AlertDescription className="text-green-600">{status}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    className="pl-10 min-h-[120px] resize-none"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending Message...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Need immediate help?{' '}
              <Link to="/ai-tutor" className="text-primary hover:underline font-medium">
                Try our AI Tutor
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
