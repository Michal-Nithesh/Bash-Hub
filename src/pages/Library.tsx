import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, Search, Filter, Download, User } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  file_path: string;
  category: string;
  visibility: string;
  created_at: string;
  profiles: {
    full_name: string;
    college_name: string;
  };
}

export const Library: React.FC = () => {
  const { user, signOut } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        profiles(full_name, college_name)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
    } else {
      setCertificates(data || []);
    }
    
    setLoading(false);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const academicCertificates = filteredCertificates.filter(cert => cert.category === 'academic');
  const overallCertificates = filteredCertificates.filter(cert => cert.category === 'overall');

  const CertificateCard = ({ certificate }: { certificate: Certificate }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{certificate.title}</CardTitle>
          <Badge variant={certificate.category === 'academic' ? 'default' : 'secondary'}>
            {certificate.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{certificate.profiles?.full_name}</span>
          <span>•</span>
          <span>{certificate.profiles?.college_name}</span>
        </div>
      </CardHeader>
      <CardContent>
        {certificate.description && (
          <p className="text-sm text-muted-foreground mb-4">{certificate.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {new Date(certificate.created_at).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const { data } = supabase.storage
                .from('certificates')
                .getPublicUrl(certificate.file_path);
              window.open(data.publicUrl, '_blank');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={!!user} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Library</h1>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates, students, or colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="overall">Overall</option>
              </select>
            </div>
          </div>

          <Tabs defaultValue="academic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="academic">Academic ({academicCertificates.length})</TabsTrigger>
              <TabsTrigger value="overall">Overall ({overallCertificates.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="academic" className="mt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : academicCertificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No academic certificates found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {academicCertificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="overall" className="mt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : overallCertificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No overall certificates found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {overallCertificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};