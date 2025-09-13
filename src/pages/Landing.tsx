import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Calendar, BookOpen, ShoppingBag, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Trophy,
      title: "Compete & Grow",
      description: "Join leaderboards, track your LeetCode progress, and compete with peers"
    },
    {
      icon: Calendar,
      title: "Smart Timetable",
      description: "Organize your schedule with our intelligent timetable management system"
    },
    {
      icon: BookOpen,
      title: "Digital Library",
      description: "Upload and share certificates, resources, and academic achievements"
    },
    {
      icon: ShoppingBag,
      title: "Student Store",
      description: "Buy and sell used books, instruments, and study materials"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with students from top colleges in Kanyakumari district"
    },
    {
      icon: Zap,
      title: "Points System",
      description: "Earn points for completing tasks and maintaining study streaks"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-bold">
                Empower Your{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Student Journey
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join the ultimate platform for student productivity, learning, and community. 
                Track your progress, compete with peers, and achieve academic excellence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/store">
                <Button variant="outline" size="lg">
                  Browse Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need to{' '}
              <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for ambitious students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Transform Your Studies?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of students who are already using StudentHub to achieve their academic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};