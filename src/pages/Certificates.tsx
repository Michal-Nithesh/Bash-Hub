import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Award, Upload, Plus, Download, Eye, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Certificate {
  id: string;
  title: string;
  description: string;
  file_path: string;
  category: string;
  visibility: string;
  created_at: string;
}

export const Certificates: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [zoom, setZoom] = useState(1);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    visibility: 'public',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]); // Remove fetchCertificates from dependencies since it's stable

  const fetchCertificates = async () => {
    if (!user) return;

    setLoading(true);
    
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('owner', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
    } else {
      setCertificates(data || []);
    }
    
    setLoading(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${user.id.slice(0, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('certificates')
        .insert({
          owner: user.id,
          title: formData.title,
          description: formData.description,
          file_path: fileName,
          category: formData.category,
          visibility: formData.visibility,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Certificate uploaded successfully",
      });

      setIsDialogOpen(false);
      setFormData({ title: '', description: '', category: 'academic', visibility: 'public' });
      setSelectedFile(null);
      fetchCertificates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await supabase.storage
        .from('certificates')
        .remove([filePath]);

      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });

      fetchCertificates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
      
      console.log('Generated URL:', data.publicUrl); // Debug log
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating file URL:', error);
      return '';
    }
  };

  const downloadFile = async (filePath: string, title: string) => {
    setProcessingFile(filePath);
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .download(filePath);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Error",
          description: `Failed to download certificate: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.${filePath.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    } finally {
      setProcessingFile(null);
    }
  };

  const viewFile = (certificate: Certificate) => {
    setViewingCertificate(certificate);
    setIsViewerOpen(true);
    setZoom(1);
  };

  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownloadFromViewer = () => {
    if (viewingCertificate) {
      downloadFile(viewingCertificate.file_path, viewingCertificate.title);
    }
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Certificates</h1>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Certificate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Certificate title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="overall">Overall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Certificate'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No certificates uploaded yet</h3>
              <p className="text-muted-foreground mb-4">Start by uploading your first certificate</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{certificate.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={certificate.category === 'academic' ? 'default' : 'secondary'}>
                          {certificate.category}
                        </Badge>
                        <Badge variant={certificate.visibility === 'public' ? 'default' : 'outline'}>
                          {certificate.visibility}
                        </Badge>
                      </div>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewFile(certificate)}
                          title="View Certificate"
                          disabled={processingFile === certificate.file_path}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(certificate.file_path, certificate.title)}
                          title="Download Certificate"
                          disabled={processingFile === certificate.file_path}
                        >
                          {processingFile === certificate.file_path ? (
                            <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(certificate.id, certificate.file_path)}
                          title="Delete Certificate"
                          disabled={processingFile === certificate.file_path}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Certificate Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {viewingCertificate?.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {getFileType(viewingCertificate?.file_path || '') === 'image' && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleDownloadFromViewer}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {viewingCertificate?.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {viewingCertificate.description}
              </p>
            )}
          </DialogHeader>
          
          <div className="p-6 pt-4 overflow-auto max-h-[calc(90vh-8rem)]">
            {viewingCertificate && (
              <div className="flex justify-center">
                {getFileType(viewingCertificate.file_path) === 'image' ? (
                  <div className="overflow-auto">
                    <img
                      src={getFileUrl(viewingCertificate.file_path)}
                      alt={viewingCertificate.title}
                      className="max-w-none transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center top'
                      }}
                      onError={(e) => {
                        console.error('Image load error');
                        toast({
                          title: "Error",
                          description: "Failed to load certificate image",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                ) : getFileType(viewingCertificate.file_path) === 'pdf' ? (
                  <div className="w-full h-[600px]">
                    <iframe
                      src={getFileUrl(viewingCertificate.file_path)}
                      className="w-full h-full border rounded-lg"
                      title={viewingCertificate.title}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button onClick={handleDownloadFromViewer}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};